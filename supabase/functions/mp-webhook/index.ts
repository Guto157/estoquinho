import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const token = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!token || !serviceKey || !supabaseUrl) {
      throw new Error("Secrets do Mercado Pago ou Supabase ausentes.");
    }

    const url = new URL(req.url);
    let body: Record<string, any> = {};
    if (req.method === "POST") {
      const raw = await req.text();
      if (raw) {
        try { body = JSON.parse(raw); } catch { body = {}; }
      }
    }

    // IPN legado envia normalmente ?id=...&topic=payment.
    // Algumas notificações também chegam como data.id / type.
    const topic = String(
      url.searchParams.get("topic") ??
      url.searchParams.get("type") ??
      body.topic ??
      body.type ??
      ""
    ).toLowerCase();

    if (topic && topic !== "payment") {
      return new Response("Event ignored", { status: 200 });
    }

    const paymentId = String(
      url.searchParams.get("id") ??
      url.searchParams.get("data.id") ??
      body.data?.id ??
      body.id ??
      ""
    );

    if (!paymentId || !/^\\d+$/.test(paymentId)) {
      return new Response("Payment ID missing or invalid", { status: 400 });
    }

    // Não confiamos nos dados enviados pela notificação. Consultamos o pagamento
    // diretamente na API autenticada do Mercado Pago.
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok) {
      console.error("Mercado Pago lookup failed:", payment);
      return new Response("Could not verify payment", { status: 502 });
    }

    if (payment.status !== "approved") {
      return new Response("Payment not approved", { status: 200 });
    }

    if (payment.payment_method_id !== "pix") {
      return new Response("Payment method mismatch", { status: 400 });
    }

    const orderId = String(payment.external_reference ?? payment.metadata?.order_id ?? "");
    if (!orderId) return new Response("Order reference missing", { status: 400 });

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: order, error: orderError } = await admin
      .from("pix_orders")
      .select("id,mp_payment_id,amount_brl,package_dolars,user_id")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return new Response("Order not found", { status: 404 });

    if (
      String(payment.id) !== String(order.mp_payment_id) ||
      Number(payment.transaction_amount) !== Number(order.amount_brl) ||
      Number(payment.metadata?.package_dolars) !== Number(order.package_dolars) ||
      String(payment.metadata?.user_id ?? "") !== String(order.user_id)
    ) {
      return new Response("Payment/order mismatch", { status: 400 });
    }

    const { data: credited, error: creditError } = await admin.rpc(
      "credit_pix_order",
      { p_order_id: order.id, p_payment_id: String(payment.id) }
    );

    if (creditError) {
      console.error("Credit RPC failed:", creditError);
      throw creditError;
    }
    if (credited !== true) {
      // Pode ser uma notificação repetida de um pagamento já processado.
      return new Response("Already processed or not credited", { status: 200 });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("IPN processing error:", error);
    return new Response("IPN processing error", { status: 500 });
  }
});

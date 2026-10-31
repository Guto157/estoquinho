import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const secret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");
    const token = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!secret || !token || !serviceKey) throw new Error("Webhook secrets ausentes.");
    const body = await req.json();
    const paymentId = String(body.data?.id ?? new URL(req.url).searchParams.get("data.id") ?? "");
    const signatureHeader = req.headers.get("x-signature") ?? "";
    const requestId = req.headers.get("x-request-id") ?? "";
    const signatureParts = Object.fromEntries(signatureHeader.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    }));
    const ts = signatureParts.ts;
    const v1 = signatureParts.v1;
    if (!paymentId || !ts || !v1 || !requestId) return new Response("Missing signature data", { status: 401 });
    const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
    const cryptoKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signed = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(manifest));
    const expected = Array.from(new Uint8Array(signed), b => b.toString(16).padStart(2, "0")).join("");
    if (expected.length !== v1.length || !Array.from(expected).every((c, i) => c === v1[i])) {
      return new Response("Invalid signature", { status: 401 });
    }
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: `Bearer ${token}` } });
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok) throw new Error("Falha ao consultar pagamento.");
    if (payment.status !== "approved") return new Response("Payment not approved", { status: 200 });
    const orderId = String(payment.external_reference ?? payment.metadata?.order_id ?? "");
    if (!orderId) return new Response("Order reference missing", { status: 400 });
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
    const { data: order, error: orderError } = await admin.from("pix_orders").select("id,mp_payment_id,amount_brl,package_dolars").eq("id", orderId).single();
    if (orderError || !order) return new Response("Order not found", { status: 404 });
    if (String(payment.id) !== order.mp_payment_id || Number(payment.transaction_amount) !== Number(order.amount_brl) || Number(payment.metadata?.package_dolars) !== Number(order.package_dolars)) {
      return new Response("Payment/order mismatch", { status: 400 });
    }
    const { data: credited, error: creditError } = await admin.rpc("credit_pix_order", { p_order_id: order.id, p_payment_id: String(payment.id) });
    if (creditError) throw creditError;
    if (credited !== true) return new Response("Credit not applied", { status: 409 });
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Webhook processing error", { status: 500 });
  }
});
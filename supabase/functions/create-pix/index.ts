import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PACKAGES: Record<number, number> = { 10: 5, 50: 20, 100: 35, 500: 150 };
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Faça login para comprar." }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = authHeader.slice(7);
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) return json({ error: "Sessão inválida. Entre novamente." }, 401);

    const body = await req.json();
    const dolars = Number(body.dolars);
    const amount = PACKAGES[dolars];
    if (!amount) return json({ error: "Pacote inválido." }, 400);
    if (!user.email) return json({ error: "Sua conta precisa ter um e-mail válido." }, 400);

    const admin = createClient(url, serviceKey);
    const { data: order, error: insertError } = await admin.from("pix_orders")
      .insert({ user_id: user.id, package_dolars: dolars, amount_brl: amount })
      .select("id").single();
    if (insertError) throw insertError;

    const mpToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");

    const paymentResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": order.id,
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: `${dolars} dolinhas - PEGA 1 PAGA 2`,
        payment_method_id: "pix",
        payer: { email: user.email },
        external_reference: order.id,
        metadata: { order_id: order.id, user_id: user.id, package_dolars: dolars },
      }),
    });
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok) {
      await admin.from("pix_orders").update({ status: "rejected" }).eq("id", order.id);
      console.error("Mercado Pago create payment error:", payment);
      return json({ error: "Não foi possível gerar o Pix. Tente novamente." }, 502);
    }

    const copyPaste = payment.point_of_interaction?.transaction_data?.qr_code ?? null;
    const qrBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64 ?? null;
    if (!payment.id || !copyPaste) throw new Error("Mercado Pago não retornou os dados do Pix.");

    const { error: updateError } = await admin.from("pix_orders").update({
      mp_payment_id: String(payment.id),
      pix_copy_paste: copyPaste,
      pix_qr_base64: qrBase64,
    }).eq("id", order.id);
    if (updateError) throw updateError;

    return json({
      order_id: order.id,
      payment_id: String(payment.id),
      amount_brl: amount,
      dolars,
      pix_copy_paste: copyPaste,
      pix_qr_base64: qrBase64,
    });
  } catch (error) {
    console.error(error);
    return json({ error: "Erro interno ao criar cobrança Pix." }, 500);
  }
});

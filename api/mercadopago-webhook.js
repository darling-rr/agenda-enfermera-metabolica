import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGOACCESSTOKEN,
});

const supabase = createClient(
  process.env.VITESUPABASEURL,
  process.env.SUPABASESERVICEROLEKEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    console.log("Webhook recibido:", req.body);

    const paymentId =
      req.body?.data?.id ||
      req.body?.id ||
      req.query?.id ||
      req.query?.["data.id"];

    if (!paymentId) {
      return res.status(200).json({ message: "Sin paymentId" });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    console.log("Pago consultado:", paymentData);

    const externalReference = paymentData.external_reference;
    const paymentStatus = paymentData.status;

    if (!externalReference) {
      return res.status(200).json({ message: "Sin external_reference" });
    }

    const newStatus = paymentStatus === "approved" ? "confirmed" : "pending_payment";

    const { error } = await supabase
      .from("appointments")
      .update({
        status: newStatus,
        payment_status: paymentStatus,
        payment_id: String(paymentId),
      })
      .eq("external_reference", externalReference);

    if (error) {
      console.error("Error Supabase:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "Webhook procesado" });
  } catch (error) {
    console.error("Error webhook:", error);
    return res.status(500).json({ error: error.message });
  }
}
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

  if (req.body?.type !== "payment") {
  return res.status(200).json({ message: "Evento ignorado" });
}

  try {
    console.log("Webhook recibido:", req.body);

    const paymentId =
      req.body?.data?.id ||
      req.body?.resource ||
      req.body?.id ||
      req.query?.id ||
      req.query?.["data.id"];

    if (!paymentId) {
      console.log("Webhook sin paymentId:", req.body);
      return res.status(200).json({ message: "Sin paymentId" });
    }

    const payment = new Payment(client);

    let paymentData;

    try {
      paymentData = await payment.get({ id: paymentId });
    } catch (error) {
      console.log("No se encontró el pago o no es un payment válido:", {
        paymentId,
        body: req.body,
        error,
      });

      return res.status(200).json({
        message: "Notificación recibida, pero no corresponde a un pago válido",
      });
    }

    console.log("Pago consultado:", paymentData);

    const externalReference = paymentData.external_reference;
    const paymentStatus = paymentData.status;

    if (!externalReference) {
      console.log("Pago sin external_reference:", paymentData);
      return res.status(200).json({ message: "Sin external_reference" });
    }

    const newStatus =
      paymentStatus === "approved" ? "confirmed" : "pending_payment";

    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: newStatus,
        payment_status: paymentStatus,
        payment_id: String(paymentId),
      })
      .eq("external_reference", externalReference)
      .select();

    if (error) {
      console.error("Error Supabase:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("Reserva actualizada:", data);

    return res.status(200).json({
      message: "Webhook procesado",
      paymentId,
      externalReference,
      paymentStatus,
      newStatus,
    });
  } catch (error) {
    console.error("Error webhook:", error);
    return res.status(500).json({ error: error.message });
  }
}
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    if (req.body?.type !== "payment") {
      return res.status(200).json({ message: "Evento ignorado" });
    }

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

    const externalReference = paymentData.external_reference;
    const paymentStatus = paymentData.status;

    if (!externalReference) {
      console.log("Pago sin external_reference:", paymentData);
      return res.status(200).json({ message: "Sin external_reference" });
    }

    const newStatus =
      paymentStatus === "approved" ? "confirmed" : "pending_payment";

    const { data: updatedAppointments, error: updateError } = await supabase
      .from("appointments")
      .update({
        status: newStatus,
        payment_status: paymentStatus,
        payment_id: String(paymentId),
      })
      .eq("external_reference", externalReference)
      .select();

    if (updateError) {
      console.error("Error Supabase:", updateError);
      return res.status(500).json({ error: updateError.message });
    }

    console.log("Reserva actualizada:", updatedAppointments);

    if (paymentStatus === "approved" && updatedAppointments?.length > 0) {
      const appointment = updatedAppointments[0];

      try {
        await resend.emails.send({
          from: "Enfermera Metabólica <onboarding@resend.dev>",
          to: appointment.email,
          subject: "Tu hora está confirmada 💚",
          html: `
            <div style="font-family: Arial, sans-serif; color: #1f2a24; line-height: 1.6;">
              <h2 style="color: #2f7d46;">Tu evaluación metabólica está confirmada 💚</h2>

              <p>Hola ${appointment.name || ""},</p>

              <p>Tu hora quedó confirmada correctamente.</p>

              <div style="background: #f3f8ef; border: 1px solid #dbe7d8; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <p><strong>Fecha:</strong> ${appointment.date_label}</p>
                <p><strong>Hora:</strong> ${appointment.time} hrs</p>
                <p><strong>Modalidad:</strong> ${appointment.mode}</p>
              </div>

              <p>Si tienes dudas, puedes escribirme por WhatsApp.</p>

              <p style="margin-top: 24px;">
                Con cariño,<br/>
                <strong>Enfermera Metabólica</strong>
              </p>
            </div>
          `,
        });

        console.log("Correo enviado a:", appointment.email);
      } catch (emailError) {
        console.error("Error enviando correo:", emailError);
      }
    }

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

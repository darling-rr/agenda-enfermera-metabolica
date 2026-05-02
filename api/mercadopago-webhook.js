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
            <div style="font-family: Arial, sans-serif; background:#f6f9f7; padding: 20px;">
              <div style="max-width: 500px; margin: auto; background: white; border-radius: 14px; padding: 24px; border: 1px solid #e3efe8;">
                <h2 style="color:#2f7d46; text-align:center;">
                  💚 Evaluación confirmada
                </h2>

                <p style="text-align:center; color:#526057;">
                  Hola ${appointment.name || ""}, tu hora ya quedó reservada.
                </p>

                <div style="background:#f3f8ef; border-radius:12px; padding:16px; margin:20px 0; text-align:center;">
                  <p style="margin:6px 0;"><strong>📅 Fecha:</strong> ${appointment.date_label}</p>
                  <p style="margin:6px 0;"><strong>⏰ Hora:</strong> ${appointment.time} hrs</p>
                  <p style="margin:6px 0;"><strong>📍 Modalidad:</strong> ${appointment.mode}</p>
                </div>

                <p style="color:#526057; text-align:center;">
                  Si necesitas reprogramar o tienes dudas, puedes escribirme directamente.
                </p>

                <div style="text-align:center; margin-top:20px;">
                  <a href="https://wa.me/56977415299"
                     style="background:#2f7d46; color:white; padding:12px 20px; border-radius:999px; text-decoration:none; font-weight:600;">
                    Escribir por WhatsApp
                  </a>
                </div>

                <p style="margin-top:30px; font-size:13px; color:#8a9a91; text-align:center;">
                  Enfermera Metabólica • Salud preventiva y metabólica
                </p>
              </div>
            </div>
          `,
        });

        await resend.emails.send({
          from: "Enfermera Metabólica <onboarding@resend.dev>",
          to: "TU_CORREO_AQUI@gmail.com",
          subject: "Nueva reserva confirmada 💚",
          html: `
            <div style="font-family: Arial, sans-serif; background:#f6f9f7; padding: 20px;">
              <div style="max-width: 520px; margin: auto; background: white; border-radius: 14px; padding: 24px; border: 1px solid #e3efe8;">
                <h2 style="color:#2f7d46; text-align:center;">
                  Nueva reserva confirmada 💚
                </h2>

                <div style="background:#f3f8ef; border-radius:12px; padding:16px; margin:20px 0;">
                  <p><strong>Nombre:</strong> ${appointment.name || ""}</p>
                  <p><strong>Email:</strong> ${appointment.email || ""}</p>
                  <p><strong>WhatsApp:</strong> ${appointment.phone || ""}</p>
                </div>

                <div style="background:#ffffff; border:1px solid #e3efe8; border-radius:12px; padding:16px;">
                  <p><strong>Fecha:</strong> ${appointment.date_label}</p>
                  <p><strong>Hora:</strong> ${appointment.time} hrs</p>
                  <p><strong>Modalidad:</strong> ${appointment.mode}</p>
                  <p><strong>Estado pago:</strong> ${paymentStatus}</p>
                  <p><strong>ID pago:</strong> ${paymentId}</p>
                </div>
              </div>
            </div>
          `,
        });

        console.log("Correos enviados:", {
          paciente: appointment.email,
          admin: "enfermera.metabolica@gmail.com",
        });
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
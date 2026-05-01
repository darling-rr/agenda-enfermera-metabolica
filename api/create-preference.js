import { MercadoPagoConfig, Preference } from "mercadopago";
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
    const { patient, selectedMode, selectedDate, selectedTime, price } = req.body;

    const externalReference = crypto.randomUUID();

    const { error } = await supabase.from("appointments").insert([
      {
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        date: selectedDate.dateKey,
        date_label: selectedDate.label,
        time: selectedTime,
        mode: selectedMode,
        status: "pending_payment",
        external_reference: externalReference,
        payment_status: "created",
      },
    ]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        external_reference: externalReference,
        items: [
          {
            title: `Evaluación metabólica ${selectedMode}`,
            quantity: 1,
            unit_price: Number(price),
            currency_id: "CLP",
          },
        ],
        payer: {
          name: patient.name,
          email: patient.email,
          phone: {
            number: patient.phone,
          },
        },
        back_urls: {
          success: "https://agenda-enfermera-metabolica.vercel.app/",
          failure: "https://agenda-enfermera-metabolica.vercel.app/",
          pending: "https://agenda-enfermera-metabolica.vercel.app/",
        },
        notification_url:
          "https://agenda-enfermera-metabolica.vercel.app/api/mercadopago-webhook",
      },
    });

    return res.status(200).json({
      init_point: result.init_point,
      external_reference: externalReference,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

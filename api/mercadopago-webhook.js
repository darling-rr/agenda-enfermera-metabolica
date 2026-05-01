export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    console.log("Webhook recibido:", req.body);

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.error("Error webhook:", error);
    return res.status(500).json({ error: "Error interno" });
  }
}

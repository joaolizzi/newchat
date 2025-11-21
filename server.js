const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "meutokenmovvi"; 
const ACCESS_TOKEN = "EAASygrB4q0IBQIA4PkgvlZCirOeynTd8xmlJhIomte5egZCVsf4yZAH8qZBgW4H1e3tRTIdNfzoCKVa8CUpSySZCkg166zwW3tc3ZCrY3SdwnBqRCVa5C0dkpy2ySBfwIXWxyRd7IfsV09wVIqJNQWwo2xZBMk18JlE79Mpxxa60G4QLyC9UBkAKiXmOIQLhPGkqjZA750fqbR7jW89gDBfVRuiFZCsDCg32CoKQCM5HaJBaMe4MjmpkeiSoJ6UZBH5n7A0fQjtKKzoeJ1wAMtFuJp";
const PHONE_ID = "803499252857026";

// Verificação do Webhook (obrigatório)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Receber mensagens
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0];

  if (message) {
    const from = message.from; 
    const text = message.text?.body;

    console.log("Mensagem recebida:", text);

    // ➤ Lógica do chatbot Movvi:
    await enviarMensagem(from, "Olá! Eu sou o Movvi, assistente da MMG 🚀");
  }

  res.sendStatus(200);
});

// Função de envio
async function enviarMensagem(to, texto) {
  await axios.post(
    `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: texto }
    },
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

app.listen(3000, () => console.log("Movvi Webhook rodando na porta 3000"));

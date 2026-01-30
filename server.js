import express from "express";
import cors from "cors";
import puter from "@heyputer/puter.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 10000;

app.use(cors());
app.use(express.json());

// ⚠️ Sert SEULEMENT le dossier public (pas de app.get("/"))
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Veuillez poser une question." });
    }

    const response = await puter.ai.chat({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Tu es Kousossou, un assistant intelligent, poli et clair."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({ reply: response.message.content });

  } catch (error) {
    console.error("Erreur IA:", error);
    res.status(500).json({ reply: "Erreur lors de la réponse de l’assistant." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🤖 Kousossou AI en ligne sur le port ${PORT}`);
});

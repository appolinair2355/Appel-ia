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
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Veuillez poser une question." });
    }

    // ✅ MÉTHODE CORRECTE POUR PUTER (SERVEUR)
    const response = await puter.ai.complete({
      prompt: `Tu es Kousossou, un assistant intelligent et poli.\n\nUtilisateur : ${message}\nAssistant :`,
      model: "gpt-4o-mini"
    });

    const reply = response?.text || "Aucune réponse générée.";

    res.json({ reply });

  } catch (error) {
    console.error("❌ Erreur Puter :", error);
    res.status(500).json({
      reply: "Erreur interne de l’assistant."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🤖 Kousossou AI en ligne sur le port ${PORT}`);
});

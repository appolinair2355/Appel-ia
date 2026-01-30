import express from "express";
import cors from "cors";
import { puter } from "@heyputer/puter.js"; // ✅ import correct pour ESM
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Route API pour le chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "Veuillez poser une question." });
    }

    // 🔥 Utilisation stable de Puter
    const response = await puter.ai.complete({
      prompt: `Tu es Kousossou, assistant poli et intelligent.\nUtilisateur : ${message}\nAssistant :`,
      model: "gpt-4o-mini"
    });

    // 🔹 Fallback sécurisé
    const reply = response?.text?.trim() || "Je n’ai pas pu générer de réponse.";

    // 🔹 Logs détaillés pour Debug sur Render
    console.log("📌 Prompt envoyé :", message);
    console.log("📌 Réponse brute Puter :", response);
    console.log("📌 Réponse envoyée à frontend :", reply);

    res.json({ reply });

  } catch (error) {
    console.error("❌ Erreur Puter complète :", error);

    res.status(500).json({
      reply: `Erreur interne de l’assistant : ${error.message}`
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🤖 Kousossou AI en ligne sur le port ${PORT}`);
});

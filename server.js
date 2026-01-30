import express from "express";
import cors from "cors";
import { puter } from "@heyputer/puter.js"; // ✅ import correct
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

    // ✅ Méthode chat() compatible toutes versions
    const response = await puter.ai.chat({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es Kousossou, assistant poli et clair." },
        { role: "user", content: message }
      ]
    });

    // 🔹 Lecture sécurisée
    const reply = response?.message?.content || "Je n’ai pas pu générer de réponse.";

    // 🔹 Logs pour Render
    console.log("📌 Message utilisateur :", message);
    console.log("📌 Réponse brute Puter :", response);
    console.log("📌 Réponse envoyée :", reply);

    res.json({ reply });

  } catch (error) {
    console.error("❌ Erreur Puter :", error);

    res.status(500).json({
      reply: `Erreur interne de l’assistant : ${error.message}`
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🤖 Kousossou AI en ligne sur le port ${PORT}`);
});

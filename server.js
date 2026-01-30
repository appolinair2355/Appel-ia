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
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await puter.ai.chat({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es Kousossou, un assistant intelligent, poli et clair." },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: response.message.content });
  } catch (e) {
    res.status(500).json({ error: "Erreur IA" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🤖 Kousossou AI lancé sur le port ${PORT}`);
});

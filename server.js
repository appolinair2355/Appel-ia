import express from "express";
import cors from "cors";
import wiki from "wikipedia";
import Fuse from "fuse.js";
import { FAQ } from "./data/faq.js";

const app = express();
const PORT = 10000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const fuse = new Fuse(FAQ, {
  keys: ["question"],
  threshold: 0.4
});

async function getAnswer(message) {
  // 1️⃣ Recherche dans le dictionnaire
  const result = fuse.search(message);
  if (result.length > 0) {
    return result[0].item.answer;
  }

  // 2️⃣ Recherche Wikipedia
  try {
    const search = await wiki.search(message);
    if (search.results.length > 0) {
      const page = await wiki.page(search.results[0].title);
      const summary = await page.summary();
      return summary.extract.slice(0, 500) + "...";
    }
  } catch (e) {
    console.error("Wiki error:", e.message);
  }

  // 3️⃣ Réponse par défaut
  return "Désolé, je n’ai pas encore la réponse à cette question.";
}

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.json({ reply: "Veuillez poser une question." });
  }

  const reply = await getAnswer(message);
  res.json({ reply });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🤖 Assistante active sur le port ${PORT}`);
});

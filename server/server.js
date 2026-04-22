import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

dotenv.config();

const app = express();

// If you use Vite proxy (recommended), CORS isn't strictly required in dev,
// but keeping it enabled makes local testing easier.
app.use(cors());

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
	dest: UPLOAD_DIR,
	limits: { fileSize: 5 * 1024 * 1024 },
});

function getOpenAIClient() {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) return null;
	return new OpenAI({ apiKey });
}

app.get("/api/health", (req, res) => {
	res.json({ ok: true });
});

app.post("/api/analyze", upload.single("image"), async (req, res) => {
	let uploadedPath = null;
	try {
		const openai = getOpenAIClient();
		if (!openai) {
			return res.status(501).json({
				error: "OPENAI_API_KEY is not configured",
			});
		}

		if (!req.file) {
			return res.status(400).json({ error: "No image" });
		}

		uploadedPath = req.file.path;
		const imageBase64 = fs.readFileSync(uploadedPath, "base64");

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: [
						"Ты анализируешь изображения товаров.",
						"",
						"Верни строго JSON:",
						"{",
						'  "type": "кроссовки | одежда | аксессуар",',
						"  \"price\": число (примерная цена в юанях),",
						"  \"size\": \"если видно, иначе null\"",
						"}",
						"",
						"НЕ пиши ничего кроме JSON.",
					].join("\n"),
				},
				{
					role: "user",
					content: [
						{ type: "text", text: "Проанализируй товар на изображении" },
						{
							type: "image_url",
							image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
						},
					],
				},
			],
		});

		let content = response.choices?.[0]?.message?.content ?? "";

		// If the model wrapped JSON in a code fence, remove it.
		content = String(content).replace(/```json|```/g, "").trim();

		let parsed;
		try {
			parsed = JSON.parse(content);
		} catch {
			return res.status(500).json({
				error: "Invalid AI response",
				raw: content,
			});
		}

		return res.json(parsed);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Server error" });
	} finally {
		if (uploadedPath) {
			try {
				fs.unlinkSync(uploadedPath);
			} catch {
				// ignore
			}
		}
	}
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});


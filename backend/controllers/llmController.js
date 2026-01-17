// controllers/llmController.js
import { geminiModel } from "../utils/geminiClient.js";

export const getLlmSuggestions = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }

    // Reduce prompt size (important)
    const trimmedItems = items.slice(0, 10);

    const prompt = `
    You are an expert learning advisor.

    Analyze each learning resource and explain WHY it is useful for the user.
    Focus on:
    - relevance to the topic
    - depth of content
    - practical usefulness
    - suitability for beginners/intermediate learners

    Return ONLY valid JSON in the following format:
    [
    {
        "id": "<id>",
        "name": "<resource title>",
        "url": "<resource url>",
        "reason": "<2-3 sentence explanation>"
    }
    ]

    Resources:
    ${trimmedItems
    .map(
        (i) => `
    ID: ${i.id}
    Title: ${i.name}
    Description: ${i.desc}
    URL: ${i.url}
    Source: ${i.source}
    `
    )
    .join("\n")}
    `;

    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    // Safety: ensure JSON
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;
    const cleanJson = text.slice(jsonStart, jsonEnd);

    const parsed = JSON.parse(cleanJson);

    res.json(parsed);
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
};

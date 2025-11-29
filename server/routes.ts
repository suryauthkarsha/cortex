import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // TTS Endpoint - uses Google Cloud Text-to-Speech API
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("GEMINI_API_KEY not found in environment");
        return res.status(500).json({ error: "API key not configured" });
      }

      console.log("Calling TTS API with text:", text.substring(0, 50));
      
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: "en-US",
              name: "en-US-Neural2-C",
              ssmlGender: "FEMALE",
            },
            audioConfig: {
              audioEncoding: "MP3",
              pitch: 0,
              speakingRate: 1,
            },
          }),
        }
      );

      const data = await response.json();
      console.log("TTS API response status:", response.status);
      
      if (data.error) {
        console.error("TTS API error:", data.error);
        throw new Error(data.error.message || "TTS API error");
      }

      if (!data.audioContent) {
        console.error("No audio content in response:", data);
        throw new Error("No audio content returned");
      }

      res.json({ audioContent: data.audioContent });
    } catch (err: any) {
      console.error("TTS endpoint error:", err);
      res.status(500).json({ error: err.message || "TTS failed" });
    }
  });

  // Infographic Generation Endpoint - Use Gemini like quiz
  app.post("/api/generate-infographic", async (req, res) => {
    try {
      const { topic, content, images = [] } = req.body;
      if (images.length === 0) {
        return res.status(400).json({ error: "Upload study material first" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
      }

      // Build request with images
      const imageParts = images.map(img => ({
        inlineData: {
          mimeType: "image/jpeg",
          data: img.split(',')[1]
        }
      }));

      const prompt = `Analyze the study material and create study notes.
      
Return valid JSON ONLY (no markdown):
{
  "title": "Study Notes",
  "subtitle": "Key Concepts",
  "colorScheme": ["#FBBF24", "#3B82F6", "#EC4899"],
  "concepts": [
    {"title": "Concept 1", "icon": "brain", "description": "Description", "color": "#FBBF24"},
    {"title": "Concept 2", "icon": "lightbulb", "description": "Description", "color": "#3B82F6"},
    {"title": "Concept 3", "icon": "sparkles", "description": "Description", "color": "#EC4899"}
  ],
  "keyStats": [{"label": "Key", "value": "Info", "icon": "check-circle"}],
  "summary": "Study guide summary"
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                ...imageParts,
                { text: prompt }
              ]
            }]
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "API error");
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : textResponse;
      
      const infographicData = JSON.parse(jsonString);
      res.json(infographicData);
    } catch (err: any) {
      console.error("Infographic error:", err.message);
      // Return fallback
      res.json({
        title: "Study Guide",
        subtitle: "Key Learning Concepts",
        colorScheme: ["#FBBF24", "#3B82F6", "#EC4899"],
        concepts: [
          {
            title: "Main Topic",
            icon: "brain",
            description: "Primary subject from your study material",
            color: "#FBBF24"
          },
          {
            title: "Key Concepts",
            icon: "lightbulb",
            description: "Important ideas and core principles to understand",
            color: "#3B82F6"
          },
          {
            title: "Learning Focus",
            icon: "sparkles",
            description: "Areas to emphasize and practice",
            color: "#EC4899"
          }
        ],
        keyStats: [
          {
            label: "Study Method",
            value: "Active Learning",
            icon: "check-circle"
          }
        ],
        summary: "Review these key concepts regularly for better retention."
      });
    }
  });

  return httpServer;
}

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

  // Infographic Generation Endpoint
  app.post("/api/generate-infographic", (req, res) => {
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
      summary: "Review these key concepts regularly. Use active recall and spaced repetition for better retention of the material."
    });
  });

  return httpServer;
}

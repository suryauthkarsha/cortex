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
  app.post("/api/generate-infographic", async (req, res) => {
    try {
      const { topic, content, images = [] } = req.body;
      if (images.length === 0) {
        return res.status(400).json({ error: "Upload study material first" });
      }

      const apiKey = 'AIzaSyDIqg3VvdiMz7N1aJi82Ju0_X93-7RFLkI'; // Gemini API key

      // Build request with images
      const imageParts = images.map(img => ({
        inlineData: {
          mimeType: "image/jpeg",
          data: img.split(',')[1]
        }
      }));

      const prompt = `Analyze the study material in this image and create an infographic summary.
      
      Return ONLY valid JSON (no markdown):
      {"title":"Study Guide","subtitle":"Key Learning","colorScheme":["#FBBF24","#3B82F6","#EC4899"],"concepts":[{"title":"Main Concept","icon":"brain","description":"Primary topic from the material","color":"#FBBF24"},{"title":"Key Point","icon":"lightbulb","description":"Important detail","color":"#3B82F6"},{"title":"Learning Focus","icon":"sparkles","description":"What to focus on","color":"#EC4899"}],"keyStats":[{"label":"Topic","value":"Study","icon":"check-circle"}],"summary":"Brief overview of main concepts."}`;

      const requestBody = {
        contents: [{
          parts: [
            ...imageParts,
            { text: prompt }
          ]
        }]
      };

      console.log("Generating infographic from", imageParts.length, "image(s)");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error("Infographic generation error:", data.error);
        throw new Error(data.error.message || "Generation failed");
      }

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response from AI");
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      let jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Extract JSON object
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      
      const infographicData = JSON.parse(jsonString);

      res.json(infographicData);
    } catch (err: any) {
      console.error("Infographic endpoint error:", err.message);
      console.error("Error stack:", err.stack);
      
      // Fallback: Return default infographic structure if parsing fails
      const fallbackInfographic = {
        title: "Study Notes",
        subtitle: "Key Learning Points from Your Material",
        colorScheme: ["#FBBF24", "#3B82F6", "#EC4899"],
        concepts: [
          {
            title: "Core Concept",
            icon: "brain",
            description: "Review the study material to master this concept",
            color: "#FBBF24"
          },
          {
            title: "Key Points",
            icon: "lightbulb",
            description: "Identify the main ideas and principles",
            color: "#3B82F6"
          },
          {
            title: "Practice",
            icon: "sparkles",
            description: "Apply your knowledge through exercises",
            color: "#EC4899"
          }
        ],
        keyStats: [
          {
            label: "Study Tips",
            value: "Active Learning",
            icon: "check-circle"
          }
        ],
        summary: "Use these study notes to reinforce your understanding of the material. Practice regularly and review key concepts."
      };
      
      res.json(fallbackInfographic);
    }
  });

  return httpServer;
}

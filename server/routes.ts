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
      if (!topic || !content) {
        return res.status(400).json({ error: "Topic and content are required" });
      }

      const apiKey = 'AIzaSyDIqg3VvdiMz7N1aJi82Ju0_X93-7RFLkI'; // Gemini API key

      const prompt = `
You are a brilliant study infographic designer. Create a detailed, visually-descriptive infographic about this topic in JSON format.

Topic: ${topic}
Content: ${content}

Generate an infographic that includes:
1. A catchy title based on the study material
2. 3-4 key concepts with icons
3. Visual statistics or key points from the material
4. Color scheme (use vibrant, study-friendly colors)
5. Layout suggestions

Return ONLY valid JSON with this structure:
{
  "title": "Infographic Title",
  "subtitle": "A brief subtitle",
  "colorScheme": ["#color1", "#color2", "#color3"],
  "concepts": [
    {
      "title": "Concept Title",
      "icon": "icon-name",
      "description": "Brief explanation",
      "color": "#hexcolor"
    }
  ],
  "keyStats": [
    {
      "label": "Statistic Label",
      "value": "Value or percentage",
      "icon": "icon-name"
    }
  ],
  "summary": "A concise summary of the key takeaways"
}
      `;

      // Build request with images if available
      const imageParts = images.map(img => ({
        inlineData: {
          mimeType: "image/jpeg",
          data: img.split(',')[1]
        }
      }));

      const requestBody = {
        contents: [{
          parts: [
            ...imageParts,
            { text: prompt }
          ]
        }]
      };

      console.log("Calling Gemini with", imageParts.length, "images for infographic generation");

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
        throw new Error(data.error.message || "Infographic generation failed");
      }

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error("Invalid response structure:", data);
        throw new Error("Invalid response from AI");
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const infographicData = JSON.parse(jsonString);

      res.json(infographicData);
    } catch (err: any) {
      console.error("Infographic endpoint error:", err);
      res.status(500).json({ error: err.message || "Infographic generation failed" });
    }
  });

  return httpServer;
}

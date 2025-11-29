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

      const prompt = `You are a brilliant study infographic designer. Analyze this study material and respond with ONLY a valid JSON object (no markdown, no code blocks, no extra text).

Topic: ${topic}
Content: ${content}

Return this exact JSON structure:
{"title":"Study Guide","subtitle":"Key Learning Points","colorScheme":["#FBBF24","#3B82F6","#EC4899"],"concepts":[{"title":"Concept 1","icon":"brain","description":"First key concept from the material","color":"#FBBF24"},{"title":"Concept 2","icon":"lightbulb","description":"Second key concept from the material","color":"#3B82F6"},{"title":"Concept 3","icon":"sparkles","description":"Third key concept from the material","color":"#EC4899"}],"keyStats":[{"label":"Key Point","value":"Important","icon":"check-circle"}],"summary":"A concise summary of the main learning objectives."}`;


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
      console.log("Raw Gemini response:", textResponse.substring(0, 200));
      
      let jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Try to extract JSON if it's embedded in text
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      
      console.log("Parsed JSON string:", jsonString.substring(0, 200));
      
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

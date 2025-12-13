import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const API_KEY = process.env.GEMINI_API_KEY || '';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callGeminiWithRetry = async (prompt: string, images: string[] = [], isJson: boolean = true): Promise<any> => {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const imageParts = images.map((img: string) => ({
        inlineData: {
          mimeType: "image/jpeg",
          data: img.split(',')[1]
        }
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [...imageParts, { text: prompt }]
          }]
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        lastError = data.error;
        if (data.error.message?.includes('overloaded') || data.error.message?.includes('rate') || response.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000;
          if (attempt < maxRetries - 1) {
            await sleep(waitTime);
            continue;
          }
        }
        throw new Error(data.error.message || 'API Error');
      }
      
      const textResponse = data.candidates[0].content.parts[0].text;
      
      if (isJson) {
        const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
      }
      
      return textResponse;
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000;
        await sleep(waitTime);
        continue;
      }
    }
  }

  throw lastError || new Error('API request failed after retries');
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Analyze Explanation Endpoint
  app.post("/api/analyze-explanation", async (req, res) => {
    try {
      const { transcript, images = [] } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: "Transcript is required" });
      }

      const prompt = `
        You are a smart, tough-love study tutor from New York City.
        Speak with a strong New York attitude and dialect (use phrases like "Listen pal", "You kiddin' me?", "Let me break it down for ya", "Fuggedaboutit", "Straight up").
        
        1. Analyze the attached study material images.
        2. Read the user's verbal explanation of the topic: "${transcript}".
        3. Compare the user's understanding against the material.
        4. Output a JSON object ONLY (no markdown) with this structure:
        {
          "score": number (0-100),
          "summary": "Brief 1-sentence summary of what they said (in thick NY style)",
          "missed_topics": [
            { "topic": "Name of concept", "explanation": "Detailed explanation of this concept based on the source material (in NY style)." }
          ],
          "detailed_feedback": "General feedback paragraph. Be direct, maybe a bit roasted if they missed obvious stuff, but helpful. (in NY style)."
        }
      `;
      
      const result = await callGeminiWithRetry(prompt, images, true);
      res.json(result);
    } catch (err: any) {
      console.error("Analyze explanation error:", err);
      res.status(500).json({ error: err.message || "Failed to analyze explanation" });
    }
  });

  // Generate Quiz Endpoint
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { images = [] } = req.body;
      if (images.length === 0) {
        return res.status(400).json({ error: "Upload study material first" });
      }

      const prompt = `
        Analyze the attached study materials.
        Generate a challenging 5-question multiple choice quiz to test understanding.
        Adopt the persona of a New York street tutor.
        Output JSON ONLY:
        [
          {
            "question": "Question text (New York style)",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "explanation": "Why this is the correct answer (NY style)"
          },
          ... (Total of 5 questions)
        ]
      `;
      
      const result = await callGeminiWithRetry(prompt, images, true);
      res.json(result);
    } catch (err: any) {
      console.error("Generate quiz error:", err);
      res.status(500).json({ error: err.message || "Failed to generate quiz" });
    }
  });

  // Ask Tutor Endpoint
  app.post("/api/ask-tutor", async (req, res) => {
    try {
      const { question, images = [] } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      const prompt = `
        You are a Gen Z study tutor. 
        You use slang like "no cap", "fr", "bet", "slay", "mid", "L", "W", "sus", "vibes", "cooked".
        Keep it educational but extremely casual and relatable.
        The user is asking: "${question}"
        
        If images are provided, reference them.
        Answer the question accurately but in your Gen Z persona. Keep it concise (under 3 sentences if possible).
      `;
      
      const result = await callGeminiWithRetry(prompt, images, false);
      res.json({ response: result });
    } catch (err: any) {
      console.error("Ask tutor error:", err);
      res.status(500).json({ error: err.message || "Failed to get tutor response" });
    }
  });

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

      const result = await callGeminiWithRetry(prompt, images, true);
      res.json(result);
    } catch (err: any) {
      console.error("Infographic error:", err.message);
      res.status(500).json({ error: err.message || "Failed to generate infographic" });
    }
  });

  return httpServer;
}

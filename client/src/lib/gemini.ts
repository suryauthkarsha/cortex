import { useState } from 'react';

const API_KEY = 'AIzaSyDIqg3VvdiMz7N1aJi82Ju0_X93-7RFLkI'; // Provided by user

export interface GeminiResponse {
  score: number;
  summary: string;
  missed_topics: Array<{ topic: string; explanation: string }>;
  detailed_feedback: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const getImageParts = (images: string[]) => images.map(img => ({
  inlineData: {
    mimeType: "image/jpeg",
    data: img.split(',')[1]
  }
}));

// Retry logic for API calls
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callGeminiWithRetry = async (prompt: string, images: string[] = [], isJson: boolean = true): Promise<any> => {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [...getImageParts(images), { text: prompt }]
          }]
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        lastError = data.error;
        // If overloaded or rate limited, retry with backoff
        if (data.error.message?.includes('overloaded') || data.error.message?.includes('rate') || response.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
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

export const callGemini = async (prompt: string, images: string[] = []): Promise<any> => {
  return callGeminiWithRetry(prompt, images, true);
};

export const callGeminiText = async (prompt: string, images: string[] = []): Promise<string> => {
  return callGeminiWithRetry(prompt, images, false);
};

export const analyzeExplanation = async (transcript: string, images: string[]): Promise<GeminiResponse> => {
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
  return callGemini(prompt, images);
};

export const generateQuiz = async (images: string[]): Promise<QuizQuestion[]> => {
  const prompt = `
    Analyze the attached study materials.
    Generate a challenging 5-question multiple choice quiz to test understanding.
    Adopt the persona of a New York street tutor.
    Output JSON ONLY:
    [
      {
        "question": "Question text (New York style)",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0, // index of correct option (0-3)
        "explanation": "Why this is the correct answer (NY style)"
      },
      ... (Total of 5 questions)
    ]
  `;
  return callGemini(prompt, images);
};

export const askTutor = async (question: string, images: string[] = []): Promise<string> => {
  const prompt = `
    You are a Gen Z study tutor. 
    You use slang like "no cap", "fr", "bet", "slay", "mid", "L", "W", "sus", "vibes", "cooked".
    Keep it educational but extremely casual and relatable.
    The user is asking: "${question}"
    
    If images are provided, reference them.
    Answer the question accurately but in your Gen Z persona. Keep it concise (under 3 sentences if possible).
  `;
  return callGeminiText(prompt, images);
};

export interface InfographicData {
  title: string;
  subtitle: string;
  colorScheme: string[];
  concepts: Array<{
    title: string;
    icon: string;
    description: string;
    color: string;
  }>;
  keyStats: Array<{
    label: string;
    value: string;
    icon: string;
  }>;
  summary: string;
}

export const generateInfographic = async (topic: string, content: string, images: string[] = []): Promise<InfographicData> => {
  const prompt = `Analyze the attached study materials and create study notes infographic.
  
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
  
  return callGemini(prompt, images);
};

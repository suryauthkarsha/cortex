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

export const callGemini = async (prompt: string, images: string[] = []): Promise<any> => {
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
  if (data.error) throw new Error(data.error.message);
  
  const textResponse = data.candidates[0].content.parts[0].text;
  // Clean markdown json code blocks if present
  const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonString);
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
      }
    ]
  `;
  return callGemini(prompt, images);
};

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

export const analyzeExplanation = async (transcript: string, images: string[]): Promise<GeminiResponse> => {
  const response = await fetch('/api/analyze-explanation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, images })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze explanation');
  }
  
  return response.json();
};

export const generateQuiz = async (images: string[]): Promise<QuizQuestion[]> => {
  const response = await fetch('/api/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate quiz');
  }
  
  return response.json();
};

export const askTutor = async (question: string, images: string[] = []): Promise<string> => {
  const response = await fetch('/api/ask-tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, images })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get tutor response');
  }
  
  const data = await response.json();
  return data.response;
};

export const generateInfographic = async (topic: string, content: string, images: string[] = []): Promise<InfographicData> => {
  const response = await fetch('/api/generate-infographic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, content, images })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate infographic');
  }
  
  return response.json();
};

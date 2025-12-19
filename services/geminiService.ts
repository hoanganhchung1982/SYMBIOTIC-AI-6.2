import { AIResponse } from "../types";

export const generateStudyContent = async (
  subject: string,
  prompt: string,
  image?: string 
): Promise<AIResponse> => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, prompt, image }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Lỗi kết nối Backend");
  }

  return await response.json();
};

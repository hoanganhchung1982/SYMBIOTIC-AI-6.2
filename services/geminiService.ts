import { AIResponse } from "../types";

export const generateStudyContent = async (
  subject: string,
  prompt: string,
  image?: string 
): Promise<AIResponse> => {
  // 1. Gọi qua đường dẫn /api/gemini (Không có đuôi .ts)
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 
      // 2. Sửa lại Content-Type cho đúng chuẩn quốc tế
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ subject, prompt, image }),
  });

  if (!response.ok) {
    // Bắt lỗi nếu server trả về 404 hoặc 500
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Lỗi kết nối Backend: ${response.status}`);
  }

  return await response.json();
};

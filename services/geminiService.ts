import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AIResponse } from "../types";

// 1. Gọi API Key đúng cách cho Vite và Vercel
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateStudyContent = async (
  subject: string,
  prompt: string,
  image?: string 
): Promise<AIResponse> => {
  try {
    // 2. Cấu hình Model (Sử dụng gemini-1.5-flash cho tốc độ nhanh)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      // Định nghĩa cấu trúc trả về để làm app Socratic
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            socratic_hint: { type: SchemaType.STRING },
            core_concept: { type: SchemaType.STRING },
            step_by_step: { type: SchemaType.STRING },
            mermaid_diagram: { type: SchemaType.STRING }
          },
          required: ["socratic_hint", "core_concept"]
        }
      }
    });

    // 3. Chuẩn bị dữ liệu gửi đi (Text + Image nếu có)
    const promptInstructions = `Bạn là một giáo viên Socratic dạy môn ${subject}. 
    Thay vì giải ngay, hãy đưa ra gợi ý giúp học sinh tự tư duy.
    Câu hỏi: ${prompt}`;

    let result;
    if (image) {
      // Xử lý hình ảnh từ Base64
      const imageData = image.split(',')[1] || image;
      result = await model.generateContent([
        promptInstructions,
        { inlineData: { data: imageData, mimeType: "image/jpeg" } }
      ]);
    } else {
      result = await model.generateContent(promptInstructions);
    }

    // 4. Lấy kết quả và chuyển thành JSON
    const responseText = result.response.text();
    return JSON.parse(responseText) as AIResponse;

  } catch (error) {
    console.error("Lỗi Gemini API:", error);
    // Trả về lỗi mặc định để App.tsx không bị crash
    throw new Error("AI đang bận, vui lòng thử lại.");
  }
};

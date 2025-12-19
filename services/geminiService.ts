
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AIResponse } from "../types";
export const generateStudyContent = async (
  subject: string,
  prompt: string,
  image?: string 
): Promise<AIResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `Bạn là Chuyên gia Giáo dục Symbiotic AI. Phân tích môn ${subject}.
Nhiệm vụ: Trả về JSON chứa các module kiến thức sau bài tập/câu hỏi người dùng gửi.

Yêu cầu NGHIÊM NGẶT cho từng Module:

1. speed: 
   - answer: CHỈ ghi đáp án cuối cùng (Ví dụ: "x = 5", "19/05/1890", "Đáp án A"). Tuyệt đối KHÔNG giải thích, KHÔNG thêm lời dẫn.
   - similar: 1 câu trắc nghiệm tương tự (4 lựa chọn, 1 đáp án đúng). Cỡ chữ đề bài và phương án phải bình thường, súc tích.

2. socratic: 2 câu hỏi gợi mở siêu ngắn.

3. notebooklm: Tóm tắt lý thuyết tối đa 3 gạch đầu dòng từ khóa quan trọng nhất.

4. perplexity: 1 ứng dụng thực tế hoặc thông tin mở rộng ngắn gọn (1-2 câu).

5. tools: Hướng dẫn bấm máy tính Casio 580 (Toán) hoặc trích dẫn pháp luật/sự kiện (Xã hội) cực ngắn.

6. mermaid (Sơ đồ tư duy dạng CÂY DỌC):
   - Sử dụng syntax: mindmap
   - Vẽ theo cấu trúc CÂY DỌC (Vertical Tree style).
   - Mỗi node CHỈ ĐƯỢC CHỨA ĐÚNG 1 TỪ DUY NHẤT.
   - KHÔNG dùng cụm từ, KHÔNG dùng câu.
   - Cấu trúc: root((Chủ đề)) -> tối đa 3 Nhánh chính -> mỗi nhánh chính tối đa 3 Nhánh con.
   - Loại bỏ hoàn toàn các ký tự đặc biệt (), [], {}, "" trong các node con.`;

  const parts: any[] = [{ text: prompt }];
  if (image) {
    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "Gemini 1.5 Flash ",
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
      temperature: 0.1,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          speed: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING },
              similar: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER }
                },
                required: ["question", "options", "correctIndex"]
              }
            },
            required: ["answer", "similar"]
          },
          socratic: { type: Type.STRING },
          notebooklm: { type: Type.STRING },
          perplexity: { type: Type.STRING },
          tools: { type: Type.STRING },
          mermaid: { type: Type.STRING }
        },
        required: ["speed", "socratic", "notebooklm", "perplexity", "tools", "mermaid"]
      }
    }
  });

  try {
    const text = response.text.trim();
    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw new Error("Lỗi định dạng dữ liệu AI.");
  }
};

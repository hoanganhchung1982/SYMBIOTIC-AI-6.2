import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const config = {
  runtime: 'edge', // Giúp hàm chạy cực nhanh trên hạ tầng toàn cầu của Vercel
};

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || "");

export default async (req: Request) => {
  // Chỉ cho phép phương thức POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { subject, prompt, image } = await req.json();

    // Sử dụng model 'gemini-1.5-flash' - phiên bản ổn định nhất hiện tại
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
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

    const promptInstructions = `Bạn là giáo viên Socratic môn ${subject}. Đưa ra gợi ý giúp học sinh tự tư duy. Câu hỏi: ${prompt}`;

    let result;
    if (image) {
      const imageData = image.split(',')[1] || image;
      result = await model.generateContent([
        promptInstructions,
        { inlineData: { data: imageData, mimeType: "image/jpeg" } }
      ]);
    } else {
      result = await model.generateContent(promptInstructions);
    }

    return new Response(result.response.text(), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

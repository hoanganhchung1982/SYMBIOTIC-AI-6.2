export const config = {
  runtime: 'edge',
  regions: ['sin1'], // Chạy tại Singapore
};
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const config = {
  runtime: 'edge',
};

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  // 1. Kiểm tra API Key ngay lập tức
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API Key is missing in Vercel settings!' }), { status: 500 });
  }

  try {
    const { subject, prompt, image } = await req.json();
    
    // 2. Khởi tạo bên trong handler để đảm bảo có apiKey
    const genAI = new GoogleGenerativeAI(apiKey);
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

    const promptInstructions = `Bạn là giáo viên Socratic môn ${subject}. Hãy đưa ra gợi ý thay vì lời giải. Câu hỏi: ${prompt}`;

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

    const text = result.response.text();
    return new Response(text, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Lỗi Backend:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  runtime: 'edge',
};

export default async (req: Request) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  if (!apiKey) return new Response(JSON.stringify({ error: 'Thiếu Groq API Key' }), { status: 500 });

  try {
    const { subject, prompt } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Model Llama 3.3 70B cực mạnh và miễn phí
        "model": "llama-3.3-70b-versatile", 
        "messages": [
          {
            "role": "system", 
            "content": `Bạn là giáo viên Socratic môn ${subject}. Chỉ đưa ra gợi ý, không cho lời giải trực tiếp.`
          },
          {
            "role": "user", 
            "content": prompt
          }
        ],
        // Yêu cầu trả về JSON nếu bạn muốn
        "response_format": { "type": "json_object" }
      })
    });

    const data = await response.json();
    
    // Groq trả về dữ liệu theo cấu trúc OpenAI
    const aiContent = data.choices[0].message.content;

    return new Response(aiContent, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

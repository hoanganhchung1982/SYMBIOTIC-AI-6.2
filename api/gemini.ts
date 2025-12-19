export const config = {
  runtime: 'edge',
};

export default async function (req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // Lấy API Key từ hệ thống
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

  try {
    const { subject, prompt } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "llama-3.3-70b-versatile",
        "messages": [
          { 
            "role": "system", 
            "content": "Bạn là giáo viên. Trả về JSON chính xác cấu trúc này: { \"speed\": { \"answer\": \"đáp án\", \"similar\": { \"question\": \"câu hỏi\", \"options\": [\"A\", \"B\", \"C\", \"D\"] } }, \"socratic_hint\": \"gợi ý\", \"core_concept\": \"khái niệm\" }" 
          },
          { "role": "user", "content": `Môn ${subject}: ${prompt}` }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    const data = await response.json();
    // Chú ý: Groq trả về content là một chuỗi JSON, ta cần giữ nguyên hoặc parse lại
    const content = data.choices[0].message.content;
    
    return new Response(content, {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ' }), { status: 500 });
  }
}

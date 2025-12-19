export const config = {
  runtime: 'edge',
};

// Khai báo để sửa lỗi "process is not defined"
declare var process: { env: { [key: string]: string } };

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const apiKey = process.env.GROQ_API_KEY; // Đảm bảo tên này khớp với Vercel Settings

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Chưa cấu hình GROQ_API_KEY trên Vercel' }), { status: 500 });
  }

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
          { "role": "system", "content": `Bạn là giáo viên môn ${subject}. Trả về JSON.` },
          { "role": "user", "content": prompt }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    const data = await response.json();
    
    // Kiểm tra nếu Groq báo lỗi (hết hạn mức, key sai...)
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
    }

    return new Response(data.choices[0].message.content, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

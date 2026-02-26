export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'API key not configured'
    });
  }

  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({
      error: 'No image provided'
    });
  }

  // ⭐ สำคัญสุด
  const cleanBase64 = imageBase64.includes("base64,")
    ? imageBase64.split("base64,")[1]
    : imageBase64;

  const prompt = `Analyze this fruit image and respond ONLY JSON:

{
"fruitName":"ชื่อไทย",
"fruitNameEn":"English",
"emoji":"🍌",
"ripeness":50,
"status":"perfect",
"statusTh":"สุกพอดี",
"color":"สี",
"texture":"เนื้อ",
"smell":"กลิ่น",
"eatIn":"ควรกินเมื่อไร",
"advice":"คำแนะนำ",
"isNotFruit":false
}

If not fruit:
{"isNotFruit":true}
`;

  try {

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          contents: [
            {
              parts: [

                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: cleanBase64
                  }
                },

                {
                  text: prompt
                }

              ]
            }
          ]

        })

      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(500).json({
        error: data.error?.message
      });
    }

    let text =
      data.candidates[0].content.parts[0].text;

    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const result = JSON.parse(text);

    return res.status(200).json(result);

  } catch (e) {

    return res.status(500).json({
      error: e.message
    });

  }

}

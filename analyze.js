export default async function handler(req, res) {

  // CORS
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


  // ✅ แยก mime type และ base64
  let mimeType = "image/jpeg";
  let cleanBase64 = imageBase64;

  const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);

  if (match) {
    mimeType = match[1];
    cleanBase64 = match[2];
  }


  const prompt = `วิเคราะห์ผลไม้ในรูปนี้และตอบเป็น JSON เท่านั้น:

{
"fruitName":"ชื่อผลไม้",
"fruitNameEn":"English name",
"emoji":"emoji",
"ripeness":0-100,
"status":"unripe|almost|perfect|overripe",
"statusTh":"ไทย",
"color":"สี",
"texture":"เนื้อ",
"smell":"กลิ่น",
"eatIn":"ควรกินเมื่อไร",
"advice":"คำแนะนำ",
"isNotFruit":false
}

ถ้าไม่ใช่ผลไม้ให้ตอบ {"isNotFruit":true}
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
                    mime_type: mimeType,
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

      throw new Error(
        data.error?.message || "Gemini API error"
      );

    }


    let text =
      data.candidates[0].content.parts[0].text;

    text = text
      .replace(/```json/g,'')
      .replace(/```/g,'')
      .trim();


    const result = JSON.parse(text);

    return res.status(200).json(result);


  }
  catch(e){

    return res.status(500).json({
      error:e.message
    });

  }

}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

  const prompt = `วิเคราะห์ผลไม้ในรูปนี้และตอบเป็น JSON เท่านั้น ไม่ต้องมีข้อความอื่น:
{
  "fruitName": "ชื่อผลไม้ภาษาไทย",
  "fruitNameEn": "ชื่อภาษาอังกฤษ",
  "emoji": "emoji ผลไม้ที่เหมาะสม",
  "ripeness": number 0-100 (0=ดิบมาก, 50=กำลังสุก, 80=สุกพอดี, 100=งอมมาก),
  "status": "unripe" หรือ "almost" หรือ "perfect" หรือ "overripe",
  "statusTh": "ยังดิบ" หรือ "เกือบสุก" หรือ "สุกพอดี" หรือ "งอมแล้ว",
  "color": "สีที่เห็น",
  "texture": "ลักษณะเนื้อที่คาดการณ์",
  "smell": "กลิ่นที่คาดการณ์",
  "eatIn": "ควรกินเลย หรือ รออีก X วัน หรือ เกินไปแล้ว",
  "advice": "คำแนะนำละเอียด 1-2 ประโยค",
  "isNotFruit": false
}
ถ้าไม่ใช่ผลไม้ให้ตอบ {"isNotFruit": true}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } },
              { text: prompt }
            ]
          }],
          generationConfig: { maxOutputTokens: 1000 }
        })
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      // ถ้า quota หมด
      if (data.error?.status === 'RESOURCE_EXHAUSTED') {
        return res.status(429).json({ limitReached: true });
      }
      throw new Error(data.error?.message || 'Gemini API error');
    }

    const text = data.candidates[0].content.parts[0].text
      .replace(/```json|```/g, '').trim();
    const result = JSON.parse(text);
    return res.status(200).json(result);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

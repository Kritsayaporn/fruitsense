export default async function handler(req, res) {

res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

if (req.method === 'OPTIONS') {
return res.status(200).end();
}

const apiKey = process.env.GEMINI_API_KEY;

const { imageBase64 } = req.body;

const cleanBase64 = imageBase64
.replace(/^data:image\/jpeg;base64,/, '')
.replace(/^data:image\/png;base64,/, '');

const prompt = "Identify the fruit and respond JSON only";

try {

const geminiRes = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[
{
parts:[
{
inline_data:{
mime_type:"image/jpeg",
data:cleanBase64
}
},
{
text:prompt
}
]
}
]
})
}
);

const data = await geminiRes.json();

const text =
data.candidates[0].content.parts[0].text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();

return res.status(200).json(JSON.parse(text));

}
catch(e){

return res.status(500).json({
error:e.message
});

}

}

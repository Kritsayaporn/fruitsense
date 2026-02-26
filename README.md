# 🍎 FruitSense — วิธี Deploy บน Vercel

## โครงสร้างไฟล์
```
fruitsense/
├── api/
│   └── analyze.js      ← Backend (ซ่อน API Key ไว้ที่นี่)
├── public/
│   └── index.html      ← หน้าเว็บ (ไม่มี key เลย)
├── vercel.json
└── package.json
```

---

## วิธี Deploy (ทำครั้งเดียวจบ)

### ขั้นที่ 1 — สมัคร Vercel
- เข้า **vercel.com** → Sign up ด้วย GitHub (ฟรี)

### ขั้นที่ 2 — อัปโหลดไฟล์
- กด **"Add New Project"**
- ลาก folder `fruitsense` ทั้งโฟลเดอร์ใส่ หรือ connect GitHub repo

### ขั้นที่ 3 — ใส่ API Key (สำคัญมาก!)
- ไปที่ **Settings → Environment Variables**
- กด Add
- Name: `GEMINI_API_KEY`
- Value: ใส่ key จาก aistudio.google.com
- กด Save

### ขั้นที่ 4 — Deploy!
- กด **Deploy** รอแป๊บเดียว
- จะได้ลิงก์ เช่น `https://fruitsense.vercel.app`

---

## ขอ Gemini API Key ฟรี
1. เข้า **aistudio.google.com/apikey**
2. Login ด้วย Google
3. กด **Create API Key**
4. คัดลอก key (หน้าตา `AIzaSy...`)

**ฟรี 1,500 ครั้ง/วัน ไม่ต้องใส่บัตรเครดิต!**

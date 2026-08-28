# 🛡️ PenTest AI - Advanced Security Assistant

Chatbot AI khusus untuk Penetration Testing dan Keamanan Siber, dibangun dengan React + Vite + TypeScript + Tailwind CSS.

## ✨ Fitur

- 🤖 **Persona Penetration Testing** - Asisten AI khusus keamanan siber (Sentinel)
- 🔑 **API Key Rotator** - Auto-rotation multiple OpenRouter API keys
- 💬 **Streaming Response** - Efek mengetik real-time seperti AI sedang merespons
- 🔐 **Login System** - Autentikasi dengan kredensial di environment variables
- 🎨 **Parallax Effect** - Background interaktif dengan particle system
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 📝 **Markdown Support** - Syntax highlighting untuk kode
- 💾 **Session Management** - Simpan riwayat chat di localStorage

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` ke `.env`, lalu isi environment variables berikut. Kredensial tanpa prefix `VITE_` hanya dibaca oleh server Vercel:

```env
# API endpoints (same-origin defaults)
VITE_CHAT_API_URL=/api/chat
VITE_LOGIN_API_URL=/api/login

# URL tujuan setelah login berhasil
VITE_AUTH_REDIRECT_URL=/

# OpenRouter keys, dipisahkan koma atau baris baru
OPENROUTER_API_KEYS=sk-or-v1-key1,sk-or-v1-key2

# Format pasangan login: ID1/PW1 sampai ID100/PW100
ID1=hahaha
PW1=hahaha
```

Salin pasangan `ID1` sampai `ID100` dari `.env.example` dan ganti nilainya. Jangan commit file `.env` atau API key asli.

### 3. Jalankan Development Server

```bash
npm run dev
```

Untuk mengetes endpoint `/api/login` dan `/api/chat` secara lokal, gunakan runtime Vercel:

```bash
npm run dev:vercel
```

### 4. Build untuk Production

```bash
npm run build
```

## 🔧 Konfigurasi Vercel

Untuk deploy ke Vercel, tambahkan environment variables di dashboard Vercel:

1. Buka project di Vercel Dashboard
2. Go to **Settings** → **Environment Variables**
3. Tambahkan `OPENROUTER_API_KEYS`, `OPENROUTER_MODEL`, `APP_URL`, serta variabel login `ID1`/`PW1` sampai `ID100`/`PW100`

## 📁 Struktur Project

```
penetration-testing-chatbot/
├── src/
│   ├── components/
│   │   ├── ChatInterface.tsx    # UI chat utama
│   │   ├── LoginPage.tsx         # Halaman login
│   │   ├── MessageBubble.tsx     # Bubble pesan
│   │   ├── TypingIndicator.tsx   # Indikator mengetik
│   │   ├── ParallaxBackground.tsx # Background parallax
│   │   └── Sidebar.tsx           # Sidebar riwayat chat
│   ├── hooks/
│   │   ├── useAuth.ts            # Hook autentikasi
│   │   └── useOpenRouter.ts      # Hook OpenRouter API
│   ├── utils/
│   │   ├── persona.ts            # Konfigurasi persona AI
│   │   └── apiRotator.ts         # Rotator API key
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── api/
│   ├── chat.js                # Proxy OpenRouter + API key rotator
│   └── login.js               # Validasi 100 akun dari environment
├── .env.example
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🔐 API Key Rotator

Sistem rotator akan:
1. Menggunakan API key yang tersedia
2. Jika key habis/rate limited (429/401), otomatis pindah ke key berikutnya
3. Track status setiap key (aktif/non-aktif)
4. Tampilkan jumlah key aktif di sidebar

## 🎨 Persona: Sentinel

Sentinel adalah Senior Penetration Testing Specialist dengan keahlian:
- Web Application Pentest (OWASP Top 10)
- Network Pentest (Nmap, Metasploit, Burp Suite)
- API Security Testing
- Cloud Security Assessment
- Mobile App Security
- Red Team Operations

## 📝 Catatan

- Model default: `google/gemma-4-26b-a4b-it:free`
- Session login berlaku 24 jam
- Riwayat chat tersimpan di localStorage browser
- Gunakan API key OpenRouter yang valid

## 📄 License

MIT License

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

Copy `.env.example` ke `.env` dan isi dengan API keys OpenRouter-mu:

```env
# OpenRouter API Keys (pisahkan dengan koma)
VITE_OPENROUTER_API_KEYS=sk-or-v1-key1,sk-or-v1-key2,sk-or-v1-key3

# Model OpenRouter
VITE_OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free

# Login Credentials
VITE_AUTH_USERNAME=admin
VITE_AUTH_PASSWORD=SecureP@ssw0rd2026!
```

### 3. Jalankan Development Server

```bash
npm run dev
```

### 4. Build untuk Production

```bash
npm run build
```

## 🔧 Konfigurasi Vercel

Untuk deploy ke Vercel, tambahkan environment variables di dashboard Vercel:

1. Buka project di Vercel Dashboard
2. Go to **Settings** → **Environment Variables**
3. Tambahkan semua variabel dari `.env`

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

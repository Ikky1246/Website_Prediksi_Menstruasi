# 🩸 Menstruasi App - AI Cycle Prediction

## 📌 Deskripsi

Menstruasi App adalah aplikasi berbasis web untuk membantu pengguna memantau siklus menstruasi dan melakukan prediksi tanggal menstruasi berikutnya menggunakan teknologi Machine Learning.

Aplikasi memiliki 2 role:
- 👤 User
- 👨‍💼 Admin

User dapat melakukan prediksi siklus, melihat kalender menstruasi, mencatat jurnal kesehatan, dan melihat riwayat prediksi.

Admin dapat mengelola pengguna, memantau data prediksi, dan mengelola sistem.


## 🚀 Teknologi

Frontend:
- React.js
- TypeScript
- Tailwind CSS

Backend:
- Node.js
- Express.js

AI Prediction Service:
- FastAPI
- Machine Learning

Database:
- MongoDB Atlas


## ⚙️ Fitur

- Authentication (Login/Register)
- Prediksi siklus menstruasi berbasis AI
- Kalender menstruasi
- Tracking siklus
- Journal kesehatan
- Riwayat prediksi
- Dashboard User & Admin
- Manajemen pengguna


## 🔧 Setup

Install dependency:

```bash
npm install
```

Jalankan aplikasi:

```bash
npm run dev
```

Jalankan FastAPI:

```bash
python prediksi_service.py
```


## 🔑 Environment

Buat file `.env`:

```env
MONGODB_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret
FASTAPI_URL=http://localhost:8001
```


## 👩‍💻 Developer

Adinda Riski Maulida

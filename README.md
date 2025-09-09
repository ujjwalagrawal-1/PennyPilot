# 🚀 PennyPilot - Personal Finance Tracker

**PennyPilot** is a modern personal finance management app that helps users track income, expenses, and receipts using OCR (Optical Character Recognition) powered by Mindee. It features real-time transaction tracking, category breakdowns, monthly budgets, and receipt scanning.

![PennyPilot Screenshot](https://via.placeholder.com/800x400?text=PennyPilot+Dashboard)

## 🔧 Features

- ✅ Add transactions manually or via receipt upload
- ✅ Auto-extract amount, date, and description from receipts using **Mindee OCR**
- ✅ Categorize expenses (Food, Transport, Shopping, etc.)
- ✅ View monthly and weekly spending trends with charts
- ✅ Set and track monthly budget
- ✅ Secure authentication with JWT
- ✅ Responsive design (mobile & desktop)
- ✅ Dark mode support (optional)
- ✅ File upload with Multer & Cloudinary

---

## 📁 Project Structure

```
PennyPilot/
├── Backend/                    # Node.js + Express backend
│   ├── config/                 # Config files
│   ├── controllers/            # Route handlers
│   ├── helpers/                # Utility functions
│   ├── middlewares/            # Auth, validation
│   ├── models/                 # Mongoose schemas
│   ├── public/                 # Static assets
│   ├── routes/                 # API routes
│   ├── utils/                  # Helpers like email, PDF
│   ├── .env                    # Environment variables
│   ├── app.js                  # Express app setup
│   └── package.json
│
├── Frontend/                   # React frontend (Vite)
│   ├── private/                # Private config (e.g., Backendurl)
│   ├── public/                 # Public assets
│   ├── src/                    # React components
│   ├── vite.config.js
│   └── package.json
│
├── LICENSE                     # MIT License
└── README.md                   # This file
```

---

## ⚙️ Tech Stack

| Layer       | Technology |
|------------|-----------|
| **Frontend** | React.js, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend**  | Node.js, Express, MongoDB, Mongoose |
| **Auth**     | JWT (JSON Web Tokens), bcrypt |
| **OCR**      | [Mindee](https://mindee.com/) (AI-powered receipt parsing) |
| **File Upload** | Multer, Cloudinary |
| **State Management** | Context API |
| **API**      | RESTful API |

---

## 🔐 Environment Variables

Create a `.env` file in the **Backend** root directory:

```env
# MongoDB Connection
MONGOURL=mongodb://localhost:27017
DBNAME=PennyPilot

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173

# JWT Tokens
ACCESS_TOKEN_SECRET=erwefedwed
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=erwefedwedconnected
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=dpwkgglet
CLOUDINARY_API_KEY=234436313368467
CLOUDINARY_API_SECRET=jviDM3ebZ5qmB0mkCnyy1cx6bdk

# Mindee OCR
MINDEE_API_KEY=md_AKevFDdAGFrobu4AT9gAGQGCgCVPoEyS
```

> 🔒 Keep this file secure — never commit it to GitHub!

---

## 🛠️ Setup & Build Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/PennyPilot.git
cd PennyPilot
```

---

### 2. Backend Setup

```bash
cd Backend
npm install
```

Start the server:

```bash
npm start
```

> ✅ Server runs on `http://localhost:3001`

---

### 3. Frontend Setup

```bash
cd ../Frontend
npm install
```

Start the dev server:

```bash
npm run dev
```

> ✅ Frontend runs on `http://localhost:5173`

---

### 4. Run Both Together

You can use `concurrently` to run both at once:

Install globally:
```bash
npm install -g concurrently
```

Then run:
```bash
concurrently "cd Backend && npm start" "cd Frontend && npm run dev"
```

---

## 📎 Demo Video

Watch how PennyPilot works:

👉 [**Watch Demo Video Here**](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

> 💡 Replace the placeholder link with your actual video URL (e.g., YouTube, Vimeo).

---

## 🧪 API Endpoints

| Method | Endpoint | Description |
|-------|--------|------------|
| `POST` | `/api/register` | Register new user |
| `POST` | `/api/login` | Login user |
| `GET` | `/api/me` | Get current user profile |
| `PUT` | `/api/update` | Update profile |
| `POST` | `/api/change-password` | Change password |
| `POST` | `/api/transactions` | Add new transaction |
| `GET` | `/api/transactions` | Get all transactions |
| `POST` | `/api/transactions/ocr` | Upload receipt → extract data → create transaction |

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🚀 Built With ❤️

- [React](https://reactjs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mindee OCR](https://mindee.com/)
- [Cloudinary](https://cloudinary.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📬 Contact

For questions or contributions, reach out to:  
📧 `tanzir.rahman@example.com`  
🌐 [GitHub Profile](https://github.com/yourusername)

---

## 🎥 Watch the Full Demo

[![Watch on YouTube](https://youtu.be/XuJrNw1_Crc)](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

> 🔗 Replace with your actual video thumbnail and link.

---

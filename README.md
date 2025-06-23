# 🥗 AI Calorie Tracker

An AI-powered full-stack web application that helps users track their daily calorie and macronutrient intake using natural language descriptions of meals. It uses **Gemini (Google AI)** to understand food descriptions and extract nutritional details like calories, proteins, carbs, and fats.

---

## ✨ Features

- 🔐 User authentication with JWT (login/register)
- 🧠 Gemini API integration for natural language meal analysis
- 📊 Daily meal logging and automatic reset at midnight
- 📈 Weekly nutrition summaries with calories and macros breakdown
- 🧾 Full-stack architecture with React frontend and Node.js backend
- 🗃️ MongoDB database for users, meal logs, and weekly analytics

---

## 🔧 Tech Stack

| Frontend     | Backend    | Database | AI Service         |
|--------------|------------|----------|--------------------|
| React + MUI  | Node.js    | MongoDB  | Gemini (Google GenAI) |
| Material UI  | Express.js | Mongoose |                    |

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Aayush03107/Ai-Calorie-Tracker.git
cd Ai-Calorie-Tracker

## 📂 Project Structure
ai-calorie-tracker/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── index.html
└── README.md

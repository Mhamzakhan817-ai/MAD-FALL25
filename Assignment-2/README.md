🧵 Top Fabrics Retail
Full-Stack E-Commerce Mobile App (React Native + Node.js)

Top Fabrics Retail is a production-ready full-stack mobile e-commerce application built with React Native (Expo) and Node.js.
It is designed for fabric stores, textile retailers, and fashion businesses, featuring a premium black & gold UI, modern Redux architecture, and a clean backend API.

This project is ideal for:

Learning full-stack mobile development

Launching a real e-commerce app

Client projects & MVPs

Final-year / portfolio projects

✨ Features
🛍️ Shopping

Browse all fabrics with images & categories

Featured products carousel

Product details screen

Fabric size chart & unit conversion

Add to cart with quantity selection

❤️ Wishlist

Save favorite products

Syncs with backend

Persistent across sessions

🛒 Cart & Checkout

Add / remove / update cart items

Live total calculation

Checkout flow

Cash on Delivery & Card payment UI

Order success animation

📦 Orders

Place orders

View order history

Order details with products & quantities

👤 Authentication

Signup & Login

JWT-based authentication

Persistent login using AsyncStorage

Protected routes

🧠 Tech Stack
Frontend

React Native (Expo)

Redux Toolkit

React Navigation (Stack + Tabs)

Axios

AsyncStorage

Lottie Animations

Custom reusable UI components

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT Authentication

REST APIs

📁 Project Structure
Top-Fabrics-Retail/
│
├── frontend/
│   ├── components/
│   ├── screens/
│   ├── redux/
│   ├── navigation/
│   ├── services/
│   ├── constants/
│   ├── utils/
│   └── App.js
│
├── backend/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── config/
│   ├── seed/
│   └── server.js
│
└── README.md

⚙️ Environment Setup
Backend .env

Create a .env file inside the backend folder:

PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

▶️ Running the Project Locally
1️⃣ Backend
cd backend
npm install
npm run dev


Server will start at:

http://localhost:8000

2️⃣ Frontend
cd frontend
npm install
npx expo start


Run on:

Android Emulator

Physical device (Expo Go)

📦 Android Build (EAS)

Make sure you’re logged in:

npx expo login


Build APK:

eas build -p android --profile preview

🔗 API Overview
Method	Endpoint	Description
POST	/api/users/signup	User registration
POST	/api/users/login	User login
GET	/api/products	Get all products
GET	/api/products/featured	Featured products
POST	/api/cart/add	Add to cart
GET	/api/cart/:userId	Get user cart
POST	/api/orders/create	Create order
GET	/api/orders/:userId	Get user orders
🎨 UI Theme

Luxury Black & Gold design

Clean typography

Mobile-first layouts

Smooth animations

📦 What You Get

✅ Full frontend source code

✅ Full backend source code

✅ Redux store & slices

✅ API services

✅ Ready-to-deploy structure

❌ No locked files

❌ No hidden dependencies

⚠️ Notes

This is a developer-focused project

Requires basic knowledge of:

JavaScript

React Native

Node.js

No admin panel included (can be added later)

🎯 Perfect For

Students

Developers

Freelancers

Fabric & textile businesses

Startup MVPs

Learning full-stack mobile apps

🏁 Project Status

✅ Core features complete
🚧 Admin panel & online payments can be added

📌 License

This project is provided for learning and commercial use.
Resale of the source code as-is is not permitted without modification.

🚀 If you purchased this from Gumroad:

Thank you for supporting independent development!
Feel free to customize, extend, and deploy your own store.


🎥 App Demo Video Link:


https://github.com/user-attachments/assets/0ddb5c83-048b-4e77-a19e-1f2c2748c2b9




# 🚲 SmarTrax Mobile App

A capstone group project designed to deliver an intelligent and user-friendly bike and e-bike rental solution. SmarTrax empowers users to seamlessly **locate**, **unlock**, and **rent** bikes or e-bikes through QR scanning. It also enables ride tracking, balance management, and history monitoring — all in real-time with a clean, mobile-friendly interface.

> 🏆 **Presented at Hong Kong CCCIS 5th Conference (2025)**

![smartrax_project](https://github.com/user-attachments/assets/54a9eca6-d100-4966-988e-727bc219c4d5)
---

## 📱 Features

* 🔍 **QR Code Scanning** for unlocking smart bikes and e-bikes
* 📍 **Real-time GPS Tracking**
* 🔐 **Firebase Authentication**
* 🧾 **Ride History Management**
* 💳 **Wallet System** with balance tracking
* 📡 **Cloud Sync** via Firebase Firestore
* 🌐 **Backend API** built with PHP and MySQL
* 💡 **User-Friendly UI** with a responsive mobile layout

---

## 💠 Tech Stack

| Tech         | Description                          |
| ------------ | ------------------------------------ |
| React Native | Frontend mobile framework            |
| Firebase     | Auth & real-time database            |
| PHP          | Backend API service layer            |
| MySQL        | Relational database for data storage |

---

## 🚀 Installation

1. **Clone the Repository**

```bash
git clone https://github.com/artace23/smartrax
cd smartrax
```

2. **Install Dependencies**

```bash
npm install
```

3. **Run the App**

Using Expo CLI:

```bash
npx expo start
```

Scan the QR code from your Expo Go app (Android/iOS) to launch the app on your device.

---

## 🧹 Project Structure

```
/smartrax
│
├── /assets              # App images & icons
├── /components          # Reusable UI components
├── /screens             # Main screen components
├── /services            # Firebase & API integrations
├── /utils               # Helper functions and constants
├── App.js               # Root of the app
└── package.json         # Project dependencies
```

---

## 🌐 Backend Setup

The backend uses **PHP** and **MySQL** for server-side logic and database management.

* PHP handles routes for ride logs, user profiles, and wallet transactions.
* Firebase handles secure authentication.
* MySQL stores user data, ride history, and bike status.

---

## 🎓 Academic Presentation

This project was proudly presented at:

**📍 Hong Kong CCCIS (2025) - 5th Conference**

---

## 📌 Links

* 🔗 **Live Project**: [GitHub Repo](https://github.com/artace23/smartrax)
* 📚 **Expo CLI**: [Get Started with Expo](https://docs.expo.dev/get-started/installation/)
* 💬 **Support**: [Expo Forums](https://forums.expo.dev/), [Discord](https://chat.expo.dev/)

---

## 📄 License

This project is licensed under the [MIT License].

```
Copyright (c) 2025 Art III Dela Cruz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

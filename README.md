# 🏋️ Gym Management System

A full-stack **Gym Management System** built using **React, Node.js, Express.js, and MongoDB**. The application helps gym owners and staff efficiently manage members, trainers, attendance, memberships, billing, workout plans, diet plans, reports, and reminder workflows through a centralized dashboard.

---

## 🚀 Features

### 👥 Member Management

* Add, edit, and delete members
* Assign membership plans and trainers
* Activate, freeze, renew memberships
* Member check-in functionality

### 📋 Plan Management

* Create, update, and delete membership plans
* Manage plan pricing and duration

### 🏋️ Trainer Management

* Add, edit, and remove trainers
* Assign trainers to members

### 🥗 Diet Plan Management

* Create and manage diet plans
* Assign diet plans to members

### 💪 Workout Plan Management

* Create and manage workout routines
* Assign workout plans to members

### 📅 Attendance Tracking

* Daily attendance management
* Mark all members present
* Clear attendance records

### 💳 Billing & Payments

* Record member payments
* Track pending dues
* View monthly revenue statistics

### 👨‍💼 Staff Management

* Role-based access control
* Owner, Receptionist, and Trainer roles
* Create and manage staff accounts
* Activate/Deactivate users
* Password reset functionality

### 📊 Reports & Reminders

* Revenue analytics
* Attendance insights
* Membership expiry reminders
* Delivery log tracking
* CSV export support

### 🎨 User Experience

* Light/Dark theme toggle
* Preference persistence across sessions

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

---

## 📁 Project Structure

```text
gym-management-system/
│
├── frontend/
│   ├── src/
│   └── legacy/
│
├── backend/
│   ├── src/
│   ├── test/
│   ├── data/
│   └── .env.example
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gym-management-system
```

### 2. Install Dependencies

```bash
npm install --prefix frontend
npm install --prefix backend
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend directory:

```bash
copy backend\.env.example backend\.env
```

Update the values according to your setup.

---

## 🔑 Environment Variables

```env
PORT=3000
FRONTEND_URL=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/gympro

COOKIE_SECURE=false
SESSION_COOKIE_NAME=gympro_session
SESSION_TTL_MS=43200000

AUTH_RATE_LIMIT_MAX=20
AUTH_RATE_LIMIT_WINDOW_MS=900000

REMINDER_SMS_PROVIDER=console
REMINDER_SMS_FROM=
REMINDER_TWILIO_ACCOUNT_SID=
REMINDER_TWILIO_AUTH_TOKEN=
REMINDER_TWILIO_MESSAGING_SERVICE_SID=

REMINDER_WHATSAPP_PROVIDER=console
REMINDER_WHATSAPP_ACCESS_TOKEN=
REMINDER_WHATSAPP_PHONE_NUMBER_ID=
```

---

## 🔔 Notification Support

The system supports reminder notifications through multiple providers.

### SMS Notifications

* Console Mode (Development)
* Twilio SMS (Production)

### WhatsApp Notifications

* Console Mode (Development)
* Meta WhatsApp Cloud API (Production)

---

## ▶️ Running the Application

### Start Backend Server

```bash
npm run dev:backend
```

### Start Frontend Server

```bash
npm run dev:frontend
```

### Application URLs

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

---

## 📜 Available Scripts

### Root Commands

```bash
npm run dev:frontend
npm run dev:backend
npm run build:frontend
npm run start:backend
```

### Frontend

```bash
npm test
npm run build
```

### Backend

```bash
npm test
npm run dev
npm run start
npm run reset:users
```

---

## 🔐 User Roles

### 👑 Owner

* Full system access
* Manage staff accounts
* Manage members, trainers, plans, billing, workouts, and diets
* Access reports and analytics

### 🧑‍💼 Receptionist

* Manage day-to-day gym operations
* Handle memberships and attendance
* Manage billing and reminders

### 🏋️ Trainer

* Attendance-focused access
* Limited operational permissions
* Member workout monitoring

---

## 📈 Reports & Reminder Workflow

The system provides:

* Membership expiry tracking
* Reminder draft generation
* Reminder delivery through configured providers
* Revenue reports
* Attendance reports
* Delivery log visibility including:

  * Provider
  * External ID
  * Sent Time
  * Sent By

---

## 🧪 Testing

Backend includes:

* Validation Tests
* Session Tests
* Authentication Flow Tests
* State Persistence Tests
* Trainer Permission Tests
* Reminder Sending Workflow Tests

### Run Tests

```bash
npm test --prefix backend
npm test --prefix frontend
```

---

## 🔮 Future Enhancements

* Bulk Member Import/Export
* Advanced Analytics Dashboard
* Payment Receipt Generation
* Personal Training Session Scheduling
* Mobile-Friendly Member Cards
* Notification Retry & History Dashboard

---

## 📄 License

This project is intended for **learning, educational, and development purposes only**.

---

## 👨‍💻 Author

**Ankit Mishra**

B.Tech (CSE-AIML) | Full Stack Developer

Tech Stack: React, Node.js, Express.js, MongoDB

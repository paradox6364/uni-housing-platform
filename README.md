# 🎓 UniHousing Platform (Full-Stack Monorepo)

cross-platform marketplace connecting university students with verified housing near their campus.

## 🧱 Architecture (6 Modules)
1. **`/backend` (Modules 1 & 2):** Node.js, Express, Prisma v6 ORM, JWT Auth, Haversine Geolocation Engine, & Booking API.
2. **`/frontend-web` (Modules 3 & 4):** Next.js 14, Tailwind CSS, Keyless OpenStreetMap Split-Screen Search, Student Booking Modal, & Landlord Portal (`/landlord`).
3. **`/frontend-mobile` (Module 5):** React Native (Expo) iOS & Android app with native map pins and property cards.
4. **`/.github` (Module 6):** Automated CI pipeline for GitHub Pull Requests.

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL DATABASE_URL
npm install
npx prisma migrate dev --name init_schema
npm run db:seed
npm run dev
```

### 2. Web Frontend Setup
```bash
cd frontend-web
cp .env.example .env.local
npm install
npm run dev
```
Open `http://localhost:3000` (Search & Map) or `http://localhost:3000/landlord` (Landlord Portal).

### 3. Mobile App Setup (Expo)
```bash
cd frontend-mobile
npm install
npx expo start
```

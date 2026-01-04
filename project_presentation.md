# Medics: Comprehensive Project Documentation

## 1. Executive Summary
**Medics** is a next-generation healthcare platform that bridges the gap between patients, healthcare providers, and pharmacy administration. By integrating a mobile patient app, a web-based admin dashboard, and a robust backend, Medics ensures seamless appointment booking, medication ordering, and real-time medical consultation.

---

## 2. Technical Architecture & Stack

### 2.1 Backend API (The Core)
*   **Runtime**: Node.js (v22+)
*   **Framework**: Express.js (v5.0) - High-performance web server.
*   **Database**: MongoDB (NoSQL) - Flexible schema for varying data types.
*   **ORM**: Prisma (v6.19) - Type-safe database client and schema management.
*   **Real-time Communication**: Socket.io - Bi-directional event-based communication for chat.
*   **AI Integration**: LangChain + Google Gemini (Flash 1.5) - For the AI health assistant.
*   **Authentication**: JWT (JSON Web Tokens) & Firebase Auth integration.
*   **Cloud Services**: Firebase Admin SDK (Notifications, Auth).

### 2.2 Admin Dashboard (Web)
*   **Framework**: React 19 + TypeScript
*   **Build Tool**: Vite 7 - Extremely fast HMR and build performance.
*   **State Management**: Zustand - Lightweight, modern state management.
*   **UI System**: 
    - **Tailwind CSS (v3.4)**: Utility-first styling for layout and responsiveness.
    - **Ant Design (v6.1)**: Enterprise-grade UI components (tables, modals, forms).
*   **Networking**: Axios (HTTP requests) + Socket.io-client (Real-time).
*   **Assets**: Cloudinary integration for image management.

### 2.3 Pharmacy App (Mobile)
*   **Framework**: Flutter (Dart) - Cross-platform (Android/iOS) native performance.
*   **State Management**: Provider (v6.1) - Efficient dependency injection and state handling.
*   **Local Database**: Sqflite - Offline persistence for user data and caches.
*   **Backend Integration**: 
    - `http` package for REST API calls.
    - `socket_io_client` for real-time chat.
*   **Services**:
    - **Firebase Core/Auth**: Secure authentication flows.
    - **Cloud Firestore**: (Optional/Legacy data sync).
*   **UI/UX**: Custom widgets, FontAwesome icons, Google Fonts.

---

## 3. Database Schema (Prisma Models)
The system is built on a MongoDB database with the following core entities:

*   **Users**: Detailed profiles including role (`USER`, `DOCTOR`, `ADMIN`), contact info, and avatar.
*   **Doctors**: Specialized profiles with ratings, consultation fees, specialties, and computed distance.
    *   *Relations*: Linked to Schedules, Appointments, and Chat Messages.
*   **Appointments**: Booking intent including Date, Time, Reason, and Status (`PENDING`, `CONFIRMED`, `CANCELLED`).
*   **Pharmacy/Drugs**: Inventory items with Pricing (`actual` vs `sale`), Categories, and Stock status.
*   **Orders**: Cart management containing multiple `OrderItems`, shipping details, and status tracking.
*   **Chat**:
    *   `AIChatSession` & `AIChatMessage`: History for the AI assistant.
    *   `ChatMessage`: P2P messages between doctors and patients.
*   **Articles**: Health educational content linked to doctor authors.

---

## 4. Key Feature Deep Dive

### 4.1 Intelligent Appointment Booking
*   **Flow**: User browses doctors by specialty -> Selects Date -> Backend retrieves `DoctorSchedule` -> User picks active slot -> Appointment Created.
*   **Validation**: Prevents double booking via unique constraints on `[doctorId, date, time]`.

### 4.2 E-Pharmacy & Orders
*   **Cart Logic**: Users can add multiple drugs.
*   **Order Lifecycle**: `PENDING` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`.
*   **Admin View**: Dashboard allows admins to toggle these statuses and view "Earnings".

### 4.3 Real-Time Chat & Communications
*   **Architecture**: 
    - Socket.io server listens for `join(userId)` events.
    - Messages are emitted to specific rooms (User ID).
    - Persistence: All messages are saved to MongoDB asynchronously for history fetching.
*   **AI Assistant**: A specialized chatbot powered by Google Gemini that can use "Tools" to search the database for doctors or medicines based on user symptoms.

### 4.4 Role-Based Security
*   **Middleware**: Custom `auth` middleware verifies JWT on every protected route.
*   **Sessions**: Active sessions are tracked in the DB; users can remotely log out other devices.
*   **Admin Route Protection**: frontend checks `user.role` before rendering Admin components.

---

## 5. Deployment Setup

### Backend
1.  **Environment**: Requires `.env` with `DATABASE_URL` (MongoDB Atlas), `JWT_SECRET`, `GEMINI_API_KEY`.
2.  **Commands**:
    *   `npm install` - Install dependencies.
    *   `npx prisma generate` - Create Prisma Client.
    *   `npm run dev` - Start Express server (Port 3000).

### Admin Dashboard
1.  **Environment**: `.env` with `VITE_BACKEND_URL`.
2.  **Commands**:
    *   `npm install`
    *   `npm run dev` - Start Development Server (Port 5173).

### Mobile App
1.  **Environment**: Flutter SDK (v3.x).
2.  **Config**: Update `baseUrl` in `api_service.dart`.
3.  **Commands**:
    *   `flutter pub get`
    *   `flutter run`

---
*Medics Project Presentation - Detailed Technical Overview*

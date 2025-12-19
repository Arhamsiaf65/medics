# Pharmacy App Backend API Documentation

## Overview

Backend implementation for the Pharmacy mobile app using **Node.js + Express**, **Prisma ORM**, and **MongoDB**.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js (v18+) |
| Framework | Express.js |
| ORM | Prisma |
| Database | MongoDB |
| Auth | JWT + Firebase Auth (optional) |

---

## Data Models (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// =====================
// USER & AUTH
// =====================
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  email         String    @unique
  password      String    // hashed
  phone         String?
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  appointments  Appointment[]
  orders        Order[]
  chatMessages  ChatMessage[]
}

// =====================
// DOCTORS
// =====================
model Doctor {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  specialty     String
  rating        Float     @default(0)
  distance      String?   // calculated or static
  imageUrl      String
  about         String?
  consultationFee Float   @default(60.0)
  isTopDoctor   Boolean   @default(false)
  createdAt     DateTime  @default(now())
  
  // Relations
  schedules     DoctorSchedule[]
  appointments  Appointment[]
  chatMessages  ChatMessage[]
}

model DoctorSchedule {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  doctorId    String   @db.ObjectId
  date        String   // "2025-12-07"
  timeSlots   String[] // ["09:00 AM", "10:00 AM", ...]
  
  doctor      Doctor   @relation(fields: [doctorId], references: [id])
  
  @@unique([doctorId, date])
}

// =====================
// APPOINTMENTS
// =====================
model Appointment {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  userId        String   @db.ObjectId
  doctorId      String   @db.ObjectId
  date          String   // "2025-12-07"
  time          String   // "09:00 AM"
  reason        String?
  status        AppointmentStatus @default(PENDING)
  paymentStatus PaymentStatus @default(PENDING)
  totalAmount   Float
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
  doctor        Doctor   @relation(fields: [doctorId], references: [id])
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
}

// =====================
// CHAT
// =====================
model ChatMessage {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  doctorId    String   @db.ObjectId
  text        String
  isFromUser  Boolean
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
  doctor      Doctor   @relation(fields: [doctorId], references: [id])
}

// =====================
// PHARMACY / DRUGS
// =====================
model Drug {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String
  imageUrl    String
  category    String   // "Pain Relief", "Vitamins", etc.
  actualPrice Int
  salePrice   Int?
  rating      Float?
  itemsInfo   String   // "100ml", "30 tablets", etc.
  inStock     Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  orderItems  OrderItem[]
}

// =====================
// ORDERS / CART
// =====================
model Order {
  id            String      @id @default(auto()) @map("_id") @db.ObjectId
  userId        String      @db.ObjectId
  totalAmount   Float
  status        OrderStatus @default(PENDING)
  paymentMethod String?
  shippingAddress String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  user          User        @relation(fields: [userId], references: [id])
  items         OrderItem[]
}

model OrderItem {
  id        String @id @default(auto()) @map("_id") @db.ObjectId
  orderId   String @db.ObjectId
  drugId    String @db.ObjectId
  quantity  Int
  price     Float
  
  order     Order  @relation(fields: [orderId], references: [id])
  drug      Drug   @relation(fields: [drugId], references: [id])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

// =====================
// ARTICLES
// =====================
model Article {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  source    String
  readTime  String   // "5 min read"
  imageUrl  String
  content   String?
  category  String?
  createdAt DateTime @default(now())
}
```

---

## API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | `{name, email, password}` |
| POST | `/login` | Login user | `{email, password}` |
| POST | `/logout` | Logout user | - |
| GET | `/me` | Get current user | - |
| PUT | `/profile` | Update profile | `{name, phone, avatarUrl}` |

---

### Doctors Routes (`/api/doctors`)

| Method | Endpoint | Description | Query/Body |
|--------|----------|-------------|------------|
| GET | `/` | Get all doctors | `?specialty=&search=` |
| GET | `/top` | Get top doctors | - |
| GET | `/:id` | Get doctor by ID | - |
| GET | `/:id/schedule` | Get available dates | - |
| GET | `/:id/slots/:date` | Get time slots for date | - |
| GET | `/specialties` | List all specialties | - |

---

### Appointments Routes (`/api/appointments`)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/` | Book appointment | `{doctorId, date, time, reason}` |
| GET | `/` | Get user appointments | `?status=` |
| GET | `/:id` | Get appointment details | - |
| PUT | `/:id/cancel` | Cancel appointment | - |
| GET | `/:id/payment` | Get payment details | - |
| POST | `/:id/pay` | Process payment | `{paymentMethod}` |

---

### Chat Routes (`/api/chat`)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/doctors/:doctorId` | Get chat history | - |
| POST | `/doctors/:doctorId` | Send message | `{text}` |
| DELETE | `/doctors/:doctorId` | Clear chat history | - |

---

### Pharmacy Routes (`/api/drugs`)

| Method | Endpoint | Description | Query |
|--------|----------|-------------|-------|
| GET | `/` | Get all drugs | `?category=&search=&sort=` |
| GET | `/:id` | Get drug details | - |
| GET | `/categories` | List categories | - |
| GET | `/featured` | Get featured drugs | - |

---

### Cart & Orders Routes (`/api/orders`)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/` | Create order | `{items: [{drugId, quantity}], shippingAddress}` |
| GET | `/` | Get user orders | `?status=` |
| GET | `/:id` | Get order details | - |
| PUT | `/:id/cancel` | Cancel order | - |

---

### Articles Routes (`/api/articles`)

| Method | Endpoint | Description | Query |
|--------|----------|-------------|-------|
| GET | `/` | Get all articles | `?category=&search=` |
| GET | `/:id` | Get article details | - |
| GET | `/categories` | List categories | - |

---

## Project Structure

```
pharmacy-backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   ├── chatController.js
│   │   ├── drugController.js
│   │   ├── orderController.js
│   │   └── articleController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── doctors.js
│   │   ├── appointments.js
│   │   ├── chat.js
│   │   ├── drugs.js
│   │   ├── orders.js
│   │   └── articles.js
│   ├── services/
│   │   └── prisma.js
│   ├── utils/
│   │   └── jwt.js
│   └── app.js
├── .env
├── package.json
└── README.md
```

---

## Environment Variables

```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/pharmacy"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
```

---

## Quick Start Commands

```bash
# Initialize project
npm init -y
npm install express prisma @prisma/client cors dotenv bcryptjs jsonwebtoken

# Initialize Prisma
npx prisma init

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

---

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

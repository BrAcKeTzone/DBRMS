# DMRMS — Digital Medical Record Management System

DMRMS is a web-based application for Blancia College Foundation Inc. (BCFI) designed to let clinic staff record and manage student medical records and to notify parents/guardians via SMS.

## Key Users & Roles

- **Clinic Admin** — Full access to system configuration, user management, and all clinic staff functionalities.
- **Clinic Staff** — Manages student health records, logs clinic visits, and communicates with parents.
- **Parent / Guardian** — Can view their linked children's health records and receive SMS notifications.

## Core Features

- **User Management**: Create and manage accounts for Clinic Staff and Parents. The first user to sign up becomes the default Clinic Admin.
- **Student Health Records**: Manage student profiles, including personal details, course, allergies, blood type, and yearly health metrics (height, weight, BMI).
- **Parent-Student Linking**: Parents can request to link to their child's profile, which Clinic Admins can approve or reject.
- **Clinic Visit Logging**: Record detailed information for each clinic visit, including vitals, diagnosis, treatment, and emergency/referral status.
- **Automated SMS Notifications**: Automatically send SMS alerts to parents after a clinic visit. Staff can preview, resend, or manually send messages.
- **System Configuration**: Admins can manage SMS gateway settings and customize SMS message templates.
- **Audit Logging**: The system tracks all major user activities for accountability and security.

## Architecture & Tech Stack

- **Frontend**: Vite + React + TailwindCSS
- **Backend**: Express (Node.js)
- **Database**: MySQL with Prisma ORM
- **SMS Integration**: SMSMobileAPI (configurable in admin settings)

## Project Structure (top-level)

- `frontend/` — Contains the React application, including components, pages, routes, and state management.
- `backend/` — Houses the Express server, Prisma schema, API services, and routes.
- `docu/` — Includes project documentation, such as the initial proposal and feature descriptions.

## Setup (development)

### Prerequisites

- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn** package manager

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DMRMS_w_Automated_Sms_Notifcation/DBRMS
```

### 2. Database Setup

1. **Create a MySQL database**:

   ```sql
   CREATE DATABASE dmrms_db;
   ```

2. **Create a database user** (optional but recommended):
   ```sql
   CREATE USER 'dmrms_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON dmrms_db.* TO 'dmrms_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### 3. Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables** by creating a `.env` file:

   ```env
   # Database Configuration
   DATABASE_URL="mysql://dmrms_user:your_password@localhost:3306/dmrms_db"

   # JWT Configuration
   JWT_SECRET="your_super_secret_jwt_key_here"

   # Server Configuration
   PORT=3000

   # SMS API Configuration (for notifications)
   SMS_API_KEY="your_sms_provider_api_key"
   SMS_API_URL="your_sms_provider_api_url"

   # Email Configuration (for notifications)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="your_email@gmail.com"
   EMAIL_PASS="your_email_password_or_app_password"

   # Cloudinary Configuration (for file uploads)
   CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
   CLOUDINARY_API_KEY="your_cloudinary_api_key"
   CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
   ```

4. **Generate Prisma client**:

   ```bash
   npx prisma generate
   ```

5. **Run database migrations**:

   ```bash
   npx prisma migrate dev
   ```

6. **Verify database setup** (optional):
   ```bash
   npx prisma studio
   ```
   This opens Prisma Studio in your browser to view/edit database records.

### 4. Frontend Setup

1. **Navigate to frontend directory**:

   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables** by creating a `.env` file:

   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:3000

   # Optional: Enable development features
   VITE_DEV_MODE=true
   ```

### 5. Start the Applications

1. **Start the backend server** (in `backend` directory):

   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:3000`

2. **Start the frontend development server** (in `frontend` directory):
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or the next available port)

### 6. Verify Installation

1. Open your browser and go to the frontend URL
2. The application should load with a login/signup interface
3. Check the browser console and backend terminal for any errors

### 7. Initial Setup

1. **Create the first admin user** by signing up through the web interface
2. The first user to register will automatically be assigned the `CLINIC_ADMIN` role
3. Additional users can be created through the admin panel

### Troubleshooting

- **Port conflicts**: If ports 3000 or 5173 are in use, modify the PORT in backend `.env` or let Vite auto-assign a different port
- **Database connection issues**: Verify MySQL is running and credentials are correct
- **Missing dependencies**: Delete `node_modules` and `package-lock.json`, then run `npm install` again
- **Prisma issues**: Run `npx prisma reset` to reset the database and migrations (⚠️ This will delete all data)

## Where to find more details

- See `docu/initial_proposal.md` and `docu/expected_features.md` for full requirements and feature descriptions.

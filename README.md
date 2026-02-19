# DMRMS — Digital Medical Record Management System

DMRMS is a web-based application for Blancia College Foundation Inc. (BCFI) designed to let clinic staff record and manage student medical records and to notify parents/guardians via SMS.

## Key Users & Roles

- **Clinic Staff** — Full access to system configuration, student management, health records, clinic visit logging, and parent communications. (Combines administrative and operational capabilities).
- **Parent / Guardian** — Can view their linked children's health records and receive SMS notifications.

## Core Features

- **User Management**: Create and manage accounts for Clinic Staff and Parents. New registrations default to Clinic Staff unless configured otherwise.
- **Student Management**:
  - Comprehensive profile management including **Year Level** (High School vs College) support.
  - Track **Blood Type**, **Allergies**, **Height**, and **Weight**.
  - **Mass Import/Export**: Support for Excel (XLSX) bulk operations with dedicated templates for High School and College formats.
- **Parent-Student Linking**: Parents can request to link to their child's profile, which Clinic Staff can approve or reject.
- **Health Record & Visit Logging**:
  - Record detailed clinic visits (vitals, diagnosis, treatment).
  - Track student health history.
- **Automated SMS Notifications**:
  - Automatically send SMS alerts to parents after a clinic visit.
  - **TextBee.dev Integration**: Uses TextBee gateway for Android-based SMS delivery.
  - Configurable SMS templates.
- **System Configuration**: Manage SMS gateway settings (API Key, Device ID) and message templates.

## Architecture & Tech Stack

- **Frontend**: Vite + React + TailwindCSS
- **Backend**: Express (Node.js)
- **Database**: MySQL with Prisma ORM
- **SMS Integration**: TextBee.dev (Android Gateway)

## Project Structure (top-level)

- `frontend/` — Contains the React application, including components, pages, routes, and state management.
- `backend/` — Houses the Express server, Prisma schema, API services, and routes.
- `docu/` — Includes project documentation.

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

   # Resend Configuration (for OTPs/Notifications)
   RESEND_API_KEY="your_resend_api_key"
   FROM_EMAIL="your_verified_sending_email"

   # Cloudinary Configuration (for file uploads)
   CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
   CLOUDINARY_API_KEY="your_cloudinary_api_key"
   CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
   ```

   _(Note: SMS Configuration is now managed via the System Configuration UI, stored in the database)_

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

1. **Create the first staff user** by signing up through the web interface.
2. Navigate to **System Configuration** to set up the TextBee.dev API Key and Device ID for SMS notifications.

## Where to find more details

- See `docu/` for additional documentation.

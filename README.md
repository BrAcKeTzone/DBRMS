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

1.  **Clone the repository.**
2.  **Install frontend dependencies**:
    ```bash
    cd frontend
    npm install
    ```
3.  **Install backend dependencies**:
    ```bash
    cd backend
    npm install
    ```
4.  **Configure environment variables** by creating a `.env` file in the `backend` directory:
    ```env
    DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
    JWT_SECRET="your_jwt_secret_key"
    SMS_API_KEY="your_sms_provider_api_key"
    ```
5.  **Run database migrations**:
    ```bash
    cd backend
    npx prisma migrate dev
    ```
6.  **Start the applications**:
    - Backend: `npm run dev` (in `backend` directory)
    - Frontend: `npm run dev` (in `frontend` directory)

## Where to find more details

- See `docu/initial_proposal.md` and `docu/expected_features.md` for full requirements and feature descriptions.

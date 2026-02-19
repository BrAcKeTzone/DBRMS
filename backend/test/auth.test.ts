import { describe, it, beforeEach, afterAll, expect, vi } from "vitest";
import request from "supertest";

// Mock email sender so tests don't attempt real Resend API calls
vi.mock("../src/utils/email", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

import app from "../src/app";
import prisma from "../src/configs/prisma";

describe("Auth API (signup, login, otp flows)", () => {
  beforeEach(async () => {
    // Clean relevant tables
    await prisma.activityLog.deleteMany();
    await prisma.otp.deleteMany();
    await prisma.user.deleteMany();
    await prisma.student.deleteMany();
    await prisma.course.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers first user as CLINIC_ADMIN and second as PARENT_GUARDIAN", async () => {
    const adminEmail = "admin@test.local";
    const adminPhone = "09170000001";

    // Send OTP for admin email
    await request(app)
      .post("/api/auth/send-otp")
      .send({ email: adminEmail })
      .expect(200);

    // Fetch OTP from DB
    const adminOtp = await prisma.otp.findFirst({
      where: { email: adminEmail },
      orderBy: { createdAt: "desc" },
    });
    expect(adminOtp).toBeTruthy();

    // Verify OTP
    const verifyRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({ email: adminEmail, otp: adminOtp!.otp })
      .expect(200);
    expect(verifyRes.body.data.verified).toBe(true);

    // Register admin
    const adminReg = await request(app)
      .post("/api/auth/register")
      .send({
        email: adminEmail,
        password: "Password123",
        firstName: "Admin",
        lastName: "One",
        phone: adminPhone,
      })
      .expect(201);

    expect(adminReg.body.data.user.role).toBe("CLINIC_ADMIN");

    // Login admin
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password: "Password123" })
      .expect(200);
    expect(loginRes.body.data.token).toBeTruthy();

    // Create second user (parent) using signup flow
    const parentEmail = "parent@test.local";
    const parentPhone = "09170000002";

    await request(app)
      .post("/api/auth/send-otp")
      .send({ email: parentEmail })
      .expect(200);
    const parentOtp = await prisma.otp.findFirst({
      where: { email: parentEmail },
      orderBy: { createdAt: "desc" },
    });
    expect(parentOtp).toBeTruthy();

    await request(app)
      .post("/api/auth/verify-otp")
      .send({ email: parentEmail, otp: parentOtp!.otp })
      .expect(200);

    const parentReg = await request(app)
      .post("/api/auth/register")
      .send({
        email: parentEmail,
        password: "Password123",
        firstName: "Parent",
        lastName: "One",
        phone: parentPhone,
      })
      .expect(201);

    expect(parentReg.body.data.user.role).toBe("PARENT_GUARDIAN");
  });

  it("handles forgot password (OTP reset) flow and allows login with new password", async () => {
    const email = "forgot@test.local";
    const phone = "09170000003";

    // Prepare user (create directly so we can test reset)
    const hashed = await prisma.user.create({
      data: {
        email,
        password: "oldpassword",
        firstName: "Forgot",
        lastName: "User",
        phone,
        role: "PARENT_GUARDIAN",
      },
    });

    // Send reset OTP
    await request(app)
      .post("/api/auth/send-otp-reset")
      .send({ email })
      .expect(200);
    const otpRec = await prisma.otp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });
    expect(otpRec).toBeTruthy();

    // Verify reset OTP
    await request(app)
      .post("/api/auth/verify-otp-reset")
      .send({ email, otp: otpRec!.otp })
      .expect(200);

    // Reset password
    await request(app)
      .post("/api/auth/reset-password")
      .send({ email, otp: otpRec!.otp, password: "newPass123" })
      .expect(200);

    // Login with new password
    await request(app)
      .post("/api/auth/login")
      .send({ email, password: "newPass123" })
      .expect(200);
  });

  it("allows Clinic Admin to create CLINIC_STAFF via admin user creation endpoint", async () => {
    // Create admin first (direct DB create with hashed password)
    const bcrypt = await (await import("bcryptjs")).default;
    const hashed = await bcrypt.hash("adminpass", 12);
    const admin = await prisma.user.create({
      data: {
        email: "makeadmin@test.local",
        password: hashed,
        firstName: "Make",
        lastName: "Admin",
        phone: "09170000004",
        role: "CLINIC_ADMIN",
      },
    });

    // Login as admin to get token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: "adminpass" })
      .expect(200);
    const token = loginRes.body.data.token;
    expect(token).toBeTruthy();

    // Create clinic staff user (using open create route)
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Clinic",
        lastName: "Staff",
        email: "staff@test.local",
        phone: "09170000005",
        password: "staffpass",
        role: "CLINIC_STAFF",
      })
      .expect(201);

    expect(res.body.data.role).toBe("CLINIC_STAFF");

    // Ensure user exists in DB
    const staff = await prisma.user.findUnique({
      where: { email: "staff@test.local" },
    });
    expect(staff).toBeTruthy();
    expect(staff!.role).toBe("CLINIC_STAFF");
  });
});

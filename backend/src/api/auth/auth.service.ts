import prisma from "../../configs/prisma";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import otpGenerator from "otp-generator";
import ApiError from "../../utils/ApiError";
import sendEmail from "../../utils/email";
import { Prisma, User } from "@prisma/client";
import { AuthenticationError } from "../../utils/errors";

interface JwtPayload {
  id: number;
  iat?: number;
  exp?: number;
}

interface OtpOptions {
  upperCase?: boolean;
  specialChars?: boolean;
  lowerCaseAlphabets?: boolean;
  upperCaseAlphabets?: boolean;
  digits?: boolean;
}

const generateToken = (userId: number): string => {
  const payload: JwtPayload = { id: userId };
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    algorithm: "HS256",
  } as jwt.SignOptions);
};

export const sendOtp = async (
  email: string
): Promise<{ message: string; otp?: string }> => {
  console.log("🔐 Starting OTP process for email:", email);

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    console.log("❌ User already exists with email:", email);
    throw new ApiError(400, "User with this email already exists");
  }

  console.log("✅ Email is available, generating OTP...");

  const otpOptions = {
    upperCase: false,
    specialChars: false,
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
  };
  const otp = otpGenerator.generate(6, otpOptions);
  console.log("📱 Generated OTP:", otp); // Remove this in production
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    await prisma.otp.create({
      data: {
        email,
        otp,
        createdAt: new Date(),
        expiresAt,
      },
    });
    console.log("💾 OTP saved to database");

    // Log OTP sent (no userId since user may not exist yet)
    await prisma.activityLog.create({
      data: { action: "OTP_SENT", details: `email:${email}` },
    });
  } catch (error) {
    console.error("❌ Failed to save OTP to database:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(400, "Failed to create OTP record");
    }
    throw error;
  }

  try {
    console.log("📧 Attempting to send email...");
    await sendEmail({
      email,
      subject: "Your OTP for ePTA Registration",
      message: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    });
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    if (process.env.NODE_ENV !== "production") {
      console.warn("Development mode: returning OTP in response for testing");
      return { message: "OTP sent to your email.", otp };
    }
    throw new ApiError(
      500,
      "There was an error sending the email. Please try again later."
    );
  }

  return { message: "OTP sent to your email." };
};

export const sendOtpForReset = async (
  email: string
): Promise<{ message: string; otp?: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  const otpOptions = {
    upperCase: false,
    specialChars: false,
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
  };
  const otp = otpGenerator.generate(6, otpOptions);
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    await prisma.otp.create({
      data: {
        email,
        otp,
        createdAt: new Date(),
        expiresAt: expires,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(400, "Failed to create OTP record");
    }
    throw error;
  }

  try {
    await sendEmail({
      email,
      subject: "Your OTP for ePTA Password Reset",
      message: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
    });
  } catch (error) {
    console.error("Email send failed:", error);
    // In development, return the OTP in the response to make testing easier
    if (process.env.NODE_ENV !== "production") {
      console.warn("Development mode: returning OTP in response for testing");
      return { message: "OTP sent to your email for password reset.", otp };
    }

    throw new ApiError(
      500,
      "There was an error sending the email. Please try again later."
    );
  }

  return { message: "OTP sent to your email for password reset." };
};

export const sendOtpForChange = async (
  email: string,
  password: string
): Promise<{ message: string; otp?: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new ApiError(401, "Incorrect password");
  }

  const otpOptions = {
    upperCase: false,
    specialChars: false,
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
  };
  const otp = otpGenerator.generate(6, otpOptions);
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    await prisma.otp.create({
      data: {
        email,
        otp,
        createdAt: new Date(),
        expiresAt: expires,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(400, "Failed to create OTP record");
    }
    throw error;
  }

  try {
    await sendEmail({
      email,
      subject: "Your OTP for ePTA Password Change",
      message: `Your OTP for password change is: ${otp}. It will expire in 10 minutes.`,
    });
  } catch (error) {
    console.error("Email send failed:", error);
    if (process.env.NODE_ENV !== "production") {
      console.warn("Development mode: returning OTP in response for testing");
      return { message: "OTP sent to your email for password change.", otp };
    }

    throw new ApiError(
      500,
      "There was an error sending the email. Please try again later."
    );
  }

  return { message: "OTP sent to your email for password change." };
};

export const verifyOtp = async (
  email: string,
  otp: string
): Promise<{ message: string; verified: boolean }> => {
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      otp,
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  // Mark this OTP as verified
  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  // Log verification (attach userId if user exists)
  const user = await prisma.user.findUnique({ where: { email } });
  await prisma.activityLog.create({
    data: {
      userId: user ? user.id : null,
      action: "OTP_VERIFIED",
      details: `email:${email}`,
    },
  });

  return { message: "Email verified successfully.", verified: true };
};

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone: string;
}

export const register = async (
  userData: RegisterData
): Promise<{ user: User; token: string }> => {
  const { email, password, firstName, middleName, lastName, phone } = userData;

  // Check if OTP has been verified for this email
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      verified: true,
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw new ApiError(
      400,
      "Email not verified. Please verify your email with OTP first."
    );
  }

  // Ensure phone or email do not already exist
  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    throw new ApiError(400, "Email already exists");
  }
  const existingByPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingByPhone) {
    throw new ApiError(400, "Phone number already exists");
  }

  // Check current user count to determine initial roles
  const userCount = await prisma.user.count();
  // First user becomes CLINIC_ADMIN, second becomes PARENT_GUARDIAN, others default to PARENT_GUARDIAN
  let assignedRole: string = "PARENT_GUARDIAN";
  if (userCount === 0) assignedRole = "CLINIC_ADMIN";
  else if (userCount === 1) assignedRole = "PARENT_GUARDIAN";

  const hashedPassword = await bcrypt.hash(password, 12);

  let user: User;
  try {
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        middleName: middleName || null,
        lastName,
        phone,
        role: assignedRole as any,
      },
    });

    // Delete the OTP after successful registration
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    // Log registration
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTERED",
        details: JSON.stringify({ email, phone }),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ApiError(400, "Email or phone already exists");
      }
    }
    throw error;
  }

  const token = generateToken(user.id);

  return { user, token };
};

export const login = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Log failed login attempt with email (no userId)
    await prisma.activityLog.create({
      data: {
        action: "USER_LOGIN_FAILED",
        details: `email:${email}`,
      },
    });
    throw new AuthenticationError("Incorrect email or password");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    // Log failed login attempt for existing user
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN_FAILED",
        details: `Incorrect password`,
      },
    });
    throw new AuthenticationError("Incorrect email or password");
  }

  // Log successful login
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "USER_LOGIN_SUCCESS",
    },
  });

  const token = generateToken(user.id);

  return { user, token };
};

// Function to verify OTP specifically for password reset
export const verifyOtpForReset = async (
  email: string,
  otp: string
): Promise<{ message: string; verified: boolean }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      otp,
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  // Mark this OTP as verified
  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  return {
    message: "OTP verified successfully for password reset.",
    verified: true,
  };
};

// Function to verify OTP specifically for password change
export const verifyOtpForChange = async (
  email: string,
  otp: string
): Promise<{ message: string; verified: boolean }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      otp,
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  // Mark this OTP as verified
  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  return {
    message: "OTP verified successfully for password change.",
    verified: true,
  };
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if OTP exists and has been verified
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      otp,
      verified: true,
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw new ApiError(
      400,
      "OTP not verified or expired. Please verify OTP first."
    );
  }

  // Delete the OTP after successful password reset
  await prisma.otp.delete({ where: { id: otpRecord.id } });

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // Log password reset
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "PASSWORD_RESET",
    },
  });

  return { message: "Password reset successfully." };
};

export const changePassword = async (
  email: string,
  oldPassword: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
    throw new ApiError(401, "Incorrect email or old password");
  }

  // Check if OTP has been verified
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      otp,
      verified: true,
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw new ApiError(
      400,
      "OTP not verified or expired. Please verify OTP first."
    );
  }

  // Delete the OTP after successful password change
  await prisma.otp.delete({ where: { id: otpRecord.id } });

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // Log password change
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "PASSWORD_CHANGED",
    },
  });

  return { message: "Password changed successfully." };
};

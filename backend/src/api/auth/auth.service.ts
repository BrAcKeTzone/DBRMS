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

export const sendOtp = async (email: string): Promise<{ message: string }> => {
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
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    await prisma.otp.create({
      data: {
        email,
        otp,
        createdAt: expires,
      },
    });
    console.log("💾 OTP saved to database");
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
    throw new ApiError(
      500,
      "There was an error sending the email. Please try again later."
    );
  }

  return { message: "OTP sent to your email." };
};

export const sendOtpForReset = async (
  email: string
): Promise<{ message: string }> => {
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
        createdAt: expires,
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
    console.error(error);
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
): Promise<{ message: string }> => {
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
        createdAt: expires,
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
    console.error(error);
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
      createdAt: {
        gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
      },
    },
  });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  // Mark this OTP as verified but don't delete it yet
  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  return { message: "Email verified successfully.", verified: true };
};

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export const register = async (
  userData: RegisterData
): Promise<{ user: User; token: string }> => {
  const { email, password, firstName, middleName, lastName } = userData;

  // Check if OTP has been verified for this email
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      verified: true,
      createdAt: {
        gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
      },
    },
  });

  if (!otpRecord) {
    throw new ApiError(
      400,
      "Email not verified. Please verify your email with OTP first."
    );
  }

  // Check if this is the first user in the system
  const userCount = await prisma.user.count();
  const isFirstUser = userCount === 0;

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
        // First user automatically becomes an admin
        role: isFirstUser ? "ADMIN" : "PARENT",
      },
    });

    // Delete the OTP after successful registration
    await prisma.otp.delete({ where: { id: otpRecord.id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ApiError(400, "Email already exists");
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
    throw new AuthenticationError("Incorrect email or password");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AuthenticationError("Incorrect email or password");
  }

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
      createdAt: {
        gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
      },
    },
  });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  // Mark this OTP as verified but don't delete it yet
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
      createdAt: {
        gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
      },
    },
  });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  // Mark this OTP as verified but don't delete it yet
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
      createdAt: {
        gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
      },
    },
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
      createdAt: {
        gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
      },
    },
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

  return { message: "Password changed successfully." };
};






"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.verifyOtpForChange = exports.verifyOtpForReset = exports.login = exports.loginByPhone = exports.register = exports.verifyOtpByPhone = exports.verifyOtp = exports.sendOtpForChange = exports.sendOtpForReset = exports.sendOtpByPhone = exports.sendOtp = void 0;
const prisma_1 = __importDefault(require("../../configs/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const email_1 = __importDefault(require("../../utils/email"));
const smsService_1 = require("../../utils/smsService");
const client_1 = require("@prisma/client");
const errors_1 = require("../../utils/errors");
const generateToken = (userId) => {
    const payload = { id: userId };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        algorithm: "HS256",
    });
};
const sendOtp = async (email) => {
    console.log("🔐 Starting OTP process for email:", email);
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (user) {
        console.log("❌ User already exists with email:", email);
        throw new ApiError_1.default(400, "User with this email already exists");
    }
    console.log("✅ Email is available, generating OTP...");
    const otpOptions = {
        upperCase: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
    };
    const otp = otp_generator_1.default.generate(6, otpOptions);
    console.log("📱 Generated OTP:", otp); // Remove this in production
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    try {
        await prisma_1.default.otp.create({
            data: {
                email,
                otp,
                createdAt: new Date(),
                expiresAt,
            },
        });
        console.log("💾 OTP saved to database");
        // Log OTP sent (no userId since user may not exist yet)
        await prisma_1.default.activityLog.create({
            data: { action: "OTP_SENT", details: `email:${email}` },
        });
    }
    catch (error) {
        console.error("❌ Failed to save OTP to database:", error);
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            throw new ApiError_1.default(400, "Failed to create OTP record");
        }
        throw error;
    }
    try {
        console.log("📧 Attempting to send email...");
        await (0, email_1.default)({
            email,
            subject: "Your OTP for BCFI Clinic Portal Registration",
            message: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
        });
        console.log("✅ Email sent successfully");
    }
    catch (error) {
        console.error("❌ Email sending failed:", error);
        if (process.env.NODE_ENV !== "production") {
            console.warn("Development mode: returning OTP in response for testing");
            return { message: "OTP sent to your email.", otp };
        }
        throw new ApiError_1.default(500, "There was an error sending the email. Please try again later.");
    }
    return { message: "OTP sent to your email." };
};
exports.sendOtp = sendOtp;
const sendOtpByPhone = async (phone) => {
    console.log("🔐 Starting OTP process for phone:", phone);
    const user = await prisma_1.default.user.findUnique({ where: { phone } });
    if (user) {
        console.log("❌ User already exists with phone:", phone);
        throw new ApiError_1.default(400, "User with this phone number already exists");
    }
    console.log("✅ Phone is available, generating OTP...");
    const otpOptions = {
        upperCase: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
    };
    const otp = otp_generator_1.default.generate(6, otpOptions);
    console.log("📱 Generated OTP:", otp); // Remove this in production
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    try {
        await prisma_1.default.otp.create({
            data: {
                phone,
                otp,
                createdAt: new Date(),
                expiresAt,
            },
        });
        console.log("💾 OTP saved to database");
        // Log OTP sent (no userId since user may not exist yet)
        await prisma_1.default.activityLog.create({
            data: { action: "OTP_SENT", details: `phone:${phone}` },
        });
    }
    catch (error) {
        console.error("❌ Failed to save OTP to database:", error);
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            throw new ApiError_1.default(400, "Failed to create OTP record");
        }
        throw error;
    }
    try {
        console.log("📤 Attempting to send SMS...");
        const smsResult = await (0, smsService_1.sendSMS)(phone, `Your OTP for BCFI Clinic Portal Registration is: ${otp}. It will expire in 10 minutes.`);
        if (!smsResult.success) {
            console.error("❌ SMS sending failed:", smsResult.error);
            if (process.env.NODE_ENV !== "production") {
                console.warn("Development mode: returning OTP in response for testing");
                return { message: "OTP sent to your phone.", otp };
            }
            throw new ApiError_1.default(500, "There was an error sending the SMS. Please try again later.");
        }
        console.log("✅ SMS sent successfully");
    }
    catch (error) {
        console.error("❌ SMS sending failed:", error);
        if (process.env.NODE_ENV !== "production") {
            console.warn("Development mode: returning OTP in response for testing");
            return { message: "OTP sent to your phone.", otp };
        }
        throw new ApiError_1.default(500, "There was an error sending the SMS. Please try again later.");
    }
    return { message: "OTP sent to your phone." };
};
exports.sendOtpByPhone = sendOtpByPhone;
const sendOtpForReset = async (phone) => {
    const user = await prisma_1.default.user.findUnique({ where: { phone } });
    if (!user) {
        throw new ApiError_1.default(404, "User with this phone number does not exist");
    }
    const otpOptions = {
        upperCase: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
    };
    const otp = otp_generator_1.default.generate(6, otpOptions);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    try {
        await prisma_1.default.otp.create({
            data: {
                phone,
                otp,
                createdAt: new Date(),
                expiresAt: expires,
            },
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            throw new ApiError_1.default(400, "Failed to create OTP record");
        }
        throw error;
    }
    try {
        // send via SMS instead of email
        await (0, smsService_1.sendSMS)(phone, `Your OTP for BCFI Clinic Portal Password Reset is: ${otp}. It will expire in 10 minutes.`);
    }
    catch (error) {
        console.error("SMS send failed:", error);
        // In development, return the OTP in the response to make testing easier
        if (process.env.NODE_ENV !== "production") {
            console.warn("Development mode: returning OTP in response for testing");
            return { message: "OTP sent to your phone for password reset.", otp };
        }
        throw new ApiError_1.default(500, "There was an error sending the SMS. Please try again later.");
    }
    return { message: "OTP sent to your phone for password reset." };
};
exports.sendOtpForReset = sendOtpForReset;
const sendOtpForChange = async (phone, password) => {
    const user = await prisma_1.default.user.findUnique({ where: { phone } });
    if (!user) {
        throw new ApiError_1.default(404, "User with this phone number does not exist");
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!isValidPassword) {
        throw new ApiError_1.default(401, "Incorrect password");
    }
    const otpOptions = {
        upperCase: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
    };
    const otp = otp_generator_1.default.generate(6, otpOptions);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    try {
        await prisma_1.default.otp.create({
            data: {
                phone,
                otp,
                createdAt: new Date(),
                expiresAt: expires,
            },
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            throw new ApiError_1.default(400, "Failed to create OTP record");
        }
        throw error;
    }
    try {
        await (0, smsService_1.sendSMS)(phone, `Your OTP for BCFI Clinic Portal Password Change is: ${otp}. It will expire in 10 minutes.`);
    }
    catch (error) {
        console.error("SMS send failed:", error);
        if (process.env.NODE_ENV !== "production") {
            console.warn("Development mode: returning OTP in response for testing");
            return { message: "OTP sent to your phone for password change.", otp };
        }
        throw new ApiError_1.default(500, "There was an error sending the SMS. Please try again later.");
    }
    return { message: "OTP sent to your phone for password change." };
};
exports.sendOtpForChange = sendOtpForChange;
const verifyOtp = async (email, otp) => {
    const otpRecord = await prisma_1.default.otp.findFirst({
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
        throw new ApiError_1.default(400, "Invalid or expired OTP.");
    }
    // Mark this OTP as verified
    await prisma_1.default.otp.update({
        where: { id: otpRecord.id },
        data: { verified: true },
    });
    // Log verification (attach userId if user exists)
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    await prisma_1.default.activityLog.create({
        data: {
            userId: user ? user.id : null,
            action: "OTP_VERIFIED",
            details: `email:${email}`,
        },
    });
    return { message: "Email verified successfully.", verified: true };
};
exports.verifyOtp = verifyOtp;
const verifyOtpByPhone = async (phone, otp) => {
    const otpRecord = await prisma_1.default.otp.findFirst({
        where: {
            phone,
            otp,
            expiresAt: {
                gt: new Date(), // Not expired
            },
        },
        orderBy: { createdAt: "desc" },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "Invalid or expired OTP.");
    }
    // Mark this OTP as verified
    await prisma_1.default.otp.update({
        where: { id: otpRecord.id },
        data: { verified: true },
    });
    // Log verification (attach userId if user exists)
    const user = await prisma_1.default.user.findUnique({ where: { phone } });
    await prisma_1.default.activityLog.create({
        data: {
            userId: user ? user.id : null,
            action: "OTP_VERIFIED",
            details: `phone:${phone}`,
        },
    });
    return { message: "Phone verified successfully.", verified: true };
};
exports.verifyOtpByPhone = verifyOtpByPhone;
const register = async (userData) => {
    const { email, password, firstName, middleName, lastName, phone, useSmsOtp } = userData;
    // Check if OTP has been verified (either via email or phone based on useSmsOtp flag)
    let otpRecord;
    if (useSmsOtp) {
        otpRecord = await prisma_1.default.otp.findFirst({
            where: {
                phone,
                verified: true,
                expiresAt: {
                    gt: new Date(), // Not expired
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    else {
        otpRecord = await prisma_1.default.otp.findFirst({
            where: {
                email,
                verified: true,
                expiresAt: {
                    gt: new Date(), // Not expired
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    if (!otpRecord) {
        const verifyMethod = useSmsOtp ? "phone" : "email";
        throw new ApiError_1.default(400, `${verifyMethod.charAt(0).toUpperCase() + verifyMethod.slice(1)} not verified. Please verify your ${verifyMethod} with OTP first.`);
    }
    // Ensure phone or email do not already exist
    const existingByEmail = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingByEmail) {
        throw new ApiError_1.default(400, "Email already exists");
    }
    const existingByPhone = await prisma_1.default.user.findUnique({ where: { phone } });
    if (existingByPhone) {
        throw new ApiError_1.default(400, "Phone number already exists");
    }
    // Check current user count to determine initial roles
    const userCount = await prisma_1.default.user.count();
    // First user becomes CLINIC_STAFF, others default to PARENT_GUARDIAN
    let assignedRole = "PARENT_GUARDIAN";
    if (userCount === 0)
        assignedRole = "CLINIC_STAFF";
    else if (userCount === 1)
        assignedRole = "PARENT_GUARDIAN";
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    let user;
    try {
        user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                middleName: middleName || null,
                lastName,
                phone,
                role: assignedRole,
            },
        });
        // Delete the OTP after successful registration
        await prisma_1.default.otp.delete({ where: { id: otpRecord.id } });
        // Log registration
        await prisma_1.default.activityLog.create({
            data: {
                userId: user.id,
                action: "USER_REGISTERED",
                details: JSON.stringify({ email, phone }),
            },
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new ApiError_1.default(400, "Email or phone already exists");
            }
        }
        throw error;
    }
    const token = generateToken(user.id);
    return { user, token };
};
exports.register = register;
const loginByPhone = async (phone, password) => {
    const user = await prisma_1.default.user.findUnique({ where: { phone } });
    if (!user) {
        // Log failed login attempt with phone (no userId)
        await prisma_1.default.activityLog.create({
            data: {
                action: "USER_LOGIN_FAILED",
                details: `phone:${phone}`,
            },
        });
        throw new errors_1.AuthenticationError("Incorrect phone number or password");
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!isValidPassword) {
        // Log failed login attempt for existing user
        await prisma_1.default.activityLog.create({
            data: {
                userId: user.id,
                action: "USER_LOGIN_FAILED",
                details: `Incorrect password`,
            },
        });
        throw new errors_1.AuthenticationError("Incorrect phone number or password");
    }
    // Log successful login
    await prisma_1.default.activityLog.create({
        data: {
            userId: user.id,
            action: "USER_LOGIN_SUCCESS",
        },
    });
    const token = generateToken(user.id);
    return { user, token };
};
exports.loginByPhone = loginByPhone;
const login = async (email, password) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        // Log failed login attempt with email (no userId)
        await prisma_1.default.activityLog.create({
            data: {
                action: "USER_LOGIN_FAILED",
                details: `email:${email}`,
            },
        });
        throw new errors_1.AuthenticationError("Incorrect email or password");
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!isValidPassword) {
        // Log failed login attempt for existing user
        await prisma_1.default.activityLog.create({
            data: {
                userId: user.id,
                action: "USER_LOGIN_FAILED",
                details: `Incorrect password`,
            },
        });
        throw new errors_1.AuthenticationError("Incorrect email or password");
    }
    // Log successful login
    await prisma_1.default.activityLog.create({
        data: {
            userId: user.id,
            action: "USER_LOGIN_SUCCESS",
        },
    });
    const token = generateToken(user.id);
    return { user, token };
};
exports.login = login;
// Function to verify OTP specifically for password reset
const verifyOtpForReset = async (phone, otp) => {
    const user = await prisma_1.default.user.findUnique({ where: { phone } });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    const otpRecord = await prisma_1.default.otp.findFirst({
        where: {
            phone,
            otp,
            expiresAt: {
                gt: new Date(), // Not expired
            },
        },
        orderBy: { createdAt: "desc" },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "Invalid or expired OTP.");
    }
    // Mark this OTP as verified
    await prisma_1.default.otp.update({
        where: { id: otpRecord.id },
        data: { verified: true },
    });
    return {
        message: "OTP verified successfully for password reset.",
        verified: true,
    };
};
exports.verifyOtpForReset = verifyOtpForReset;
// Function to verify OTP specifically for password change
const verifyOtpForChange = async (phone, otp) => {
    const user = await prisma_1.default.user.findUnique({ where: { phone } });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    const otpRecord = await prisma_1.default.otp.findFirst({
        where: {
            phone,
            otp,
            expiresAt: {
                gt: new Date(), // Not expired
            },
        },
        orderBy: { createdAt: "desc" },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "Invalid or expired OTP.");
    }
    // Mark this OTP as verified
    await prisma_1.default.otp.update({
        where: { id: otpRecord.id },
        data: { verified: true },
    });
    return {
        message: "OTP verified successfully for password change.",
        verified: true,
    };
};
exports.verifyOtpForChange = verifyOtpForChange;
const resetPassword = async (phone, otp, newPassword) => {
    const user = await prisma_1.default.user.findUnique({ where: { phone } });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Check if OTP exists and has been verified
    const otpRecord = await prisma_1.default.otp.findFirst({
        where: {
            phone,
            otp,
            verified: true,
            expiresAt: {
                gt: new Date(), // Not expired
            },
        },
        orderBy: { createdAt: "desc" },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "OTP not verified or expired. Please verify OTP first.");
    }
    // Delete the OTP after successful password reset
    await prisma_1.default.otp.delete({ where: { id: otpRecord.id } });
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
    await prisma_1.default.user.update({
        where: { phone },
        data: { password: hashedPassword },
    });
    // Log password reset
    await prisma_1.default.activityLog.create({
        data: {
            userId: user.id,
            action: "PASSWORD_RESET",
        },
    });
    return { message: "Password reset successfully." };
};
exports.resetPassword = resetPassword;
const changePassword = async (phone, oldPassword, otp, newPassword) => {
    const user = await prisma_1.default.user.findUnique({ where: { phone } });
    if (!user || !(await bcryptjs_1.default.compare(oldPassword, user.password))) {
        throw new ApiError_1.default(401, "Incorrect phone number or old password");
    }
    // Check if OTP exists and is valid (no need to be pre-verified)
    const otpRecord = await prisma_1.default.otp.findFirst({
        where: {
            phone,
            otp,
            expiresAt: {
                gt: new Date(), // Not expired
            },
        },
        orderBy: { createdAt: "desc" },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "Invalid or expired OTP.");
    }
    // Delete the OTP after successful password change
    await prisma_1.default.otp.delete({ where: { id: otpRecord.id } });
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
    await prisma_1.default.user.update({
        where: { phone },
        data: { password: hashedPassword },
    });
    // Log password change
    await prisma_1.default.activityLog.create({
        data: {
            userId: user.id,
            action: "PASSWORD_CHANGED",
        },
    });
    return { message: "Password changed successfully." };
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.service.js.map
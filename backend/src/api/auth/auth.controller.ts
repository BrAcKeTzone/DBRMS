import { Request, Response } from "express";
import * as authService from "./auth.service";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.sendOtp(email);
  res.status(200).json(new ApiResponse(200, result));
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await authService.verifyOtp(email, otp);
  res
    .status(200)
    .json(new ApiResponse(200, result, "Email verified successfully"));
});

export const verifyOtpForReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await authService.verifyOtpForReset(email, otp);
    res.status(200).json(new ApiResponse(200, result));
  }
);

export const verifyOtpForChange = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await authService.verifyOtpForChange(email, otp);
    res.status(200).json(new ApiResponse(200, result));
  }
);

export const sendOtpForReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.sendOtpForReset(email);
    res.status(200).json(new ApiResponse(200, result));
  }
);

export const sendOtpForChange = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.sendOtpForChange(email, password);
    res.status(200).json(new ApiResponse(200, result));
  }
);

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, result, "User registered successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json(new ApiResponse(200, result, "Login successful"));
});

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp, password } = req.body;
    const result = await authService.resetPassword(email, otp, password);
    res.status(200).json(new ApiResponse(200, result));
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, oldPassword, otp, newPassword } = req.body;
    const result = await authService.changePassword(
      email,
      oldPassword,
      otp,
      newPassword
    );
    res.status(200).json(new ApiResponse(200, result));
  }
);

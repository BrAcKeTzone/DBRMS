import { Request, Response } from "express";
import * as smsService from "./sms.service";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";

export const sendSMS = asyncHandler(async (req: Request, res: Response) => {
  const result = await smsService.sendManualSMS({
    ...req.body,
    userId: (req as any).user?.id,
  });

  if (!result.success) {
    return res
      .status(500)
      .json(new ApiResponse(500, result, "Failed to send SMS"));
  }

  res.status(200).json(new ApiResponse(200, result, "SMS sent successfully"));
});

export const getLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await smsService.getSMSLogs(req.query, (req as any).user);
  res
    .status(200)
    .json(new ApiResponse(200, result, "SMS logs fetched successfully"));
});

export const resendSMS = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await smsService.resendSMS(Number(id));
  res
    .status(200)
    .json(new ApiResponse(200, result, "SMS resend attempt completed"));
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await smsService.markSMSAsRead(Number(id), (req as any).user);
  res.status(200).json(new ApiResponse(200, result, "SMS marked as read"));
});

export const getUnreadCount = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await smsService.getUnreadSMSCount((req as any).user);
    res
      .status(200)
      .json(new ApiResponse(200, result, "Unread SMS count fetched"));
  },
);

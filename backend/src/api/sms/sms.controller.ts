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
  const result = await smsService.getSMSLogs(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, result, "SMS logs fetched successfully"));
});

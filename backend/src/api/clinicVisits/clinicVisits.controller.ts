import { Request, Response } from "express";
import * as service from "./clinicVisits.service";
import ApiResponse from "../../utils/ApiResponse";
import asyncHandler from "../../utils/asyncHandler";

export const createClinicVisit = asyncHandler(
  async (req: Request, res: Response) => {
    const actorId = req.user?.id;
    const visit = await service.createClinicVisit(req.body, actorId);
    res
      .status(201)
      .json(new ApiResponse(201, visit, "Clinic visit logged successfully"));
  },
);

export const getAllClinicVisits = asyncHandler(
  async (req: Request, res: Response) => {
    const { search } = req.query;
    const visits = await service.getAllClinicVisits(search as string);
    res
      .status(200)
      .json(
        new ApiResponse(200, visits, "Clinic visits retrieved successfully"),
      );
  },
);

export const getClinicVisitStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await service.getClinicVisitStats();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          stats,
          "Clinic visit stats retrieved successfully",
        ),
      );
  },
);

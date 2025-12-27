import express from "express";
import * as controller from "./clinicVisits.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = express.Router();

router.use(authenticate);

router.post("/", controller.createClinicVisit);
router.get("/", controller.getAllClinicVisits);
router.get("/stats", controller.getClinicVisitStats);

export default router;

import express from "express";
import { dashboardController } from "../controller/DashboardController.js";

const router = express.Router();

router.get("/", dashboardController);

export default router;
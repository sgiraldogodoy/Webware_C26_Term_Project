import express from "express";
import { dashboardController } from "../controller/DashboardController.js";
import EmployeeAdminSupport from "../models/EmployeeAdminSupport.js";

const router = express.Router();

// GET /api/dashboard
router.get("/", dashboardController);

// GET /api/dashboard/years
router.get("/years", async (req, res) => {
    try {
        const schoolId = req.user.schoolId != null ? req.user.schoolId : Number(req.query.schoolId);

        const years = await EmployeeAdminSupport.distinct(
            "SCHOOL_YR_ID",
            { SCHOOL_ID: schoolId }
        );

        console.log("JWT schoolId:", req.user.schoolId)
        res.json(years.sort((a, b) => a - b));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
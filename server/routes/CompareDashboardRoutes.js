import express from "express";
import { compareDashboardController } from "../controller/CompareDashboardController.js";
import EmployeeAdminSupport from "../models/EmployeeAdminSupport.js";

const router = express.Router();

router.get("/", compareDashboardController);

router.get("/years", async (req, res) => {
    try {
        const schoolId = req.user.schoolId;

        const years = await EmployeeAdminSupport.distinct(
            "SCHOOL_YR_ID",
            { SCHOOL_ID: schoolId }
        );

        console.log("Compare JWT schoolId:", schoolId);

        res.json(years.sort((a, b) => a - b));

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
import express from "express";
import { dashboardController } from "../controller/DashboardController.js";
import EmployeeAdminSupport from "../models/EmployeeAdminSupport.js";
import schoolYear from "../models/SchoolYear.js";

const router = express.Router();

// GET /api/dashboard
router.get("/", dashboardController);

// GET /api/dashboard/years
router.get("/years", async (req, res) => {
    try {
        const schoolId = req.query.schoolId
            ? Number(req.query.schoolId)
            : req.user.schoolId;

        const yearIDs = await EmployeeAdminSupport.distinct(
            "SCHOOL_YR_ID",
            { SCHOOL_ID: schoolId }
        );

        const years = await schoolYear.find(
            { ID: { $in: yearIDs } },
            { _id: 0, ID: 1, SCHOOL_YEAR: 1 }
        );


        console.log("JWT schoolId:", req.user.schoolId)
        res.json(years.sort((a, b) => a.SCHOOL_YEAR - b.SCHOOL_YEAR));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
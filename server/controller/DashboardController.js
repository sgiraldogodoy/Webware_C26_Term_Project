import { getDashboardData } from "../services/dashboardService.js";

export async function dashboardController(req, res) {
    try {
        const { yearId, category } = req.query;
        const schoolId = req.user.schoolId;

        const data = await getDashboardData({
            schoolId,
            yearId: Number(yearId),
            category
        });

        console.log("Query params:", schoolId, yearId, category);
        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
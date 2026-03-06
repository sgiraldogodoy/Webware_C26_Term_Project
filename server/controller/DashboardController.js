import { getDashboardData } from "../services/DashboardService.js";

export async function dashboardController(req, res) {
    try {
        const { yearId, category} = req.query;
        const schoolId = req.query.schoolId
            ? Number(req.query.schoolId)
            : req.user.schoolId;

        const data = await getDashboardData({
            schoolId,
            yearId: Number(yearId),
            category
        });

        console.log("Dashboard response keys:", Object.keys(data || {}));
        console.log("KPIS isArray?", Array.isArray(data?.kpis), "type:", typeof data?.kpis);

        if (Array.isArray(data?.kpis)) {
            console.log("KPI count:", data.kpis.length);
            console.log("First KPI:", data.kpis[0]);
        } else {
            console.log("KPIS value:", data?.kpis);
        }

        console.log("Query params:", schoolId, yearId, category);
        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
import {getCompareData} from "../services/CompareDashboardService.js";

export async function compareDashboardController(req, res) {
    try {
        const { yearId, cluster } = req.query;
        const schoolId = req.user.schoolId;

        const parsedYearId = Number(yearId);

        const data = await getCompareData({
            schoolId,
            yearId: parsedYearId,
            cluster
        });

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
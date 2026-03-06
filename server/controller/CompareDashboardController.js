import {getCompareData} from "../services/CompareDashboardService.js";

export async function compareDashboardController(req, res) {
    try {
        const { yearId, cluster, schoolId } = req.query;
        // const schoolId = req.user.schoolId;

        const parsedYearId = Number(yearId);
        const parsedSchoolId = Number(schoolId);

        const data = await getCompareData({
            schoolId: parsedSchoolId,
            yearId: parsedYearId,
            cluster
        });

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
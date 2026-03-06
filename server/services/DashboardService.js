import EnrollAttrition from "../models/EnrollAttrition.js";
import EmployeePersonnel from "../models/EmployeePersonnel.js";
import EmployeeAdminSupport from "../models/EmployeeAdminSupport.js";

export async function getDashboardData({ schoolId, yearId, category }) {

    switch (category) {

        case "Enrollment":
            return await buildEnrollmentDashboard(schoolId, yearId);

        case "Personnel":
            return await buildPersonnelDashboard(schoolId, yearId);

        case "Admin support":
            return await buildAdminSupportDashboard(schoolId, yearId);

        default:
            throw new Error("Invalid category");
    }
}

async function buildEnrollmentDashboard(schoolId, yearId) {

    const result = await EnrollAttrition.aggregate([
        {
            $match: {
                SCHOOL_ID: schoolId,
                SCHOOL_YR_ID: yearId
            }
        },
        {
            $group: {
                _id: null,
                studentsAdded: { $sum: "$STUDENTS_ADDED_DURING_YEAR" },
                studentsGraduated: { $sum: "$STUDENTS_GRADUATED" },
                studentsNotReturning: { $sum: "$STUD_NOT_RETURN" }
            }
        }
    ]);

    const data = result[0] || {};

    return {
        kpis: [
            { label: "Students Added", value: data.studentsAdded || 0 },
            { label: "Students Not Returning", value: data.studentsNotReturning || 0 },
            { label: "Students Graduated", value: data.studentsGraduated || 0 }
        ],
        charts: {
            bar: {
                labels: ["Added", "Not Returning", "Graduated"],
                datasets: [
                    {
                        label: "Students",
                        data: [
                            data.studentsAdded || 0,
                            data.studentsNotReturning || 0,
                            data.studentsGraduated || 0
                        ]
                    }
                ]
            },

            // line: {
            //     labels: ["2021", "2022", "2023"],
            //     datasets: [
            //         {
            //             label: "Total Students",
            //             data: [100, 120, 130]
            //         }
            //     ]
            // }
        }
    };
}

async function buildPersonnelDashboard(schoolId, yearId) {

    const result = await EmployeePersonnel.aggregate([
        {
            $match: {
                SCHOOL_ID: schoolId,
                SCHOOL_YR_ID: yearId
            }
        },
        {
            $group: {
                _id: null,
                totalEmployees: { $sum: "$TOTAL_EMPLOYEES" },
                ftEmployees: { $sum: "$FT_EMPLOYEES" },
                subcontractors: { $sum: "$SUBCONTRACT_NUM" }
            }
        }
    ]);

    const data = result[0] || {};

    // get trend data for all years for this school
    const trend = await EmployeePersonnel.aggregate([
        { $match: { SCHOOL_ID: schoolId } }, // all years
        {
            $group: {
                _id: "$SCHOOL_YR_ID",
                totalEmployees: { $sum: "$TOTAL_EMPLOYEES" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // create custom line chart data structure for total employees trend
    const line = {
        labels: trend.map(r => String(r._id)),
        datasets: [
            {
                label: "Total Employees",
                data: trend.map(r => r.totalEmployees || 0)
            }
        ]
    };

    // create custom bar chart data structure for employees by category - get top categories by total employees
    const byCategory = await EmployeePersonnel.aggregate([
        { $match: { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId } },

        {
            $group: {
                _id: "$EMP_CAT_CD",
                totalEmployees: { $sum: "$TOTAL_EMPLOYEES" },
                ftEmployees: { $sum: "$FT_EMPLOYEES" },
            }
        },

        {
            $lookup: {
                from: "refCode",          // 🔁 change if show collections says different
                localField: "_id",
                foreignField: "CODE_CD",  // ✅ matches your refCode schema
                as: "category"
            }
        },

        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $match: { $or: [{ "category.DOMAIN_CD": "EmployeeCategory" }, { category: { $exists: false } }] } },

        // only keep the EmployeeCategory match (or keep fallback if none)
        {
            $addFields: {
                label: {
                    $cond: [
                        { $eq: ["$category.DOMAIN_CD", "EmployeeCategory"] },
                        "$category.DESCRIPTION_TX",
                        "$_id"
                    ]
                }
            }
        },

        { $sort: { totalEmployees: -1 } },
        { $limit: 10 }
    ]);

    const byCategoryBar = {
        labels: byCategory.map(r => r.label),
        datasets: [
            { label: "Total Employees", data: byCategory.map(r => r.totalEmployees || 0) },
            { label: "FT Employees", data: byCategory.map(r => r.ftEmployees || 0) },
        ]
    };

    // donut
    const compAgg = await EmployeePersonnel.aggregate([
        { $match: { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId } },
        {
            $group: {
                _id: null,
                total: { $sum: "$TOTAL_EMPLOYEES" },
                ft: { $sum: "$FT_EMPLOYEES" },
                poc: { $sum: "$POC_EMPLOYEES" },
                subcontract: {
                    $sum: {
                        $convert: { input: "$SUBCONTRACT_NUM", to: "double", onError: 0, onNull: 0 }
                    }
                }
            }
        }
    ]);

    const comp = compAgg[0] || {};

    const compositionDoughnut = {
        labels: ["Full-Time", "Part-Time"],
        datasets: [{
            label: "Count",
            data: [comp.ft || 0, Math.max(0, (comp.total || 0) - (comp.ft || 0))]
        }]
    };

    return {
        kpis: [
            { label: "Total Employees", value: data.totalEmployees || 0 },
            { label: "FTEs", value: data.ftEmployees || 0 },
            { label: "Subcontractors", value: data.subcontractors || 0 }
        ],
        charts: {
            bar: {
                labels: ["Total", "FTE", "Subcontractors"],
                datasets: [
                    {
                        label: "Your School",
                        data: [
                            data.totalEmployees || 0,
                            data.ftEmployees || 0,
                            data.subcontractors || 0
                        ]
                    }
                ]
            },
            line: line,
            bar2: byCategoryBar,
            donut: compositionDoughnut
        }
    };
}

async function buildAdminSupportDashboard(schoolId, yearId) {

    const result = await EmployeeAdminSupport.aggregate([
        {
            $match: {
                SCHOOL_ID: schoolId,
                SCHOOL_YR_ID: yearId
            }
        },
        {
            $group: {
                _id: null,
                exempt: { $sum: "$FTE_EXEMPT" },
                nonExempt: { $sum: "$FTE_NONEXEMPT" }
            }
        }
    ]);

    const data = result[0] || {};

    const totalFTE =
        (data.exempt || 0) + (data.nonExempt || 0);

    // Trend across ALL years for this school
    const trend = await EmployeeAdminSupport.aggregate([
        { $match: { SCHOOL_ID: schoolId } }, // all years
        {
            $group: {
                _id: "$SCHOOL_YR_ID",
                exempt: { $sum: "$FTE_EXEMPT" },
                nonExempt: { $sum: "$FTE_NONEXEMPT" },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const line = {
        labels: trend.map(r => String(r._id)),
        datasets: [
            {
                label: "Exempt FTE",
                data: trend.map(r => r.exempt || 0),
            },
            {
                label: "Non-Exempt FTE",
                data: trend.map(r => r.nonExempt || 0),
            },
            {
                label: "Total FTE",
                data: trend.map(r => (r.exempt || 0) + (r.nonExempt || 0)),
            },
        ],
    };

    return {
        kpis: [
            { label: "Admin Support FTE", value: totalFTE },
            { label: "Exempt FTE", value: data.exempt || 0 },
            { label: "Non-Exempt FTE", value: data.nonExempt || 0 }
        ],
        charts: {
            bar: {
                labels: ["Exempt", "Non-Exempt"],
                datasets: [
                    {
                        label: "Your School",
                        data: [
                            data.exempt || 0,
                            data.nonExempt || 0
                        ]
                    }
                ]
            },
            line: line
        }
    };
}
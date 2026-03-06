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

// helper to calculate trend between current and previous value
function calcTrend(curr, prev) {
    const diff = (curr || 0) - (prev || 0);
    const pct = prev ? ((diff / prev) * 100).toFixed(1) : 0;
    return { trend: diff, trendPct: `${diff >= 0 ? "+" : ""}${pct}%` };
}

async function buildEnrollmentDashboard(schoolId, yearId) {

    const [current, previous] = await Promise.all([
        EnrollAttrition.aggregate([
            { $match: { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId } },
            {
                $group: {
                    _id: null,
                    studentsAdded: { $sum: "$STUDENTS_ADDED_DURING_YEAR" },
                    studentsGraduated: { $sum: "$STUDENTS_GRADUATED" },
                    studentsNotReturning: { $sum: "$STUD_NOT_RETURN" }
                }
            }
        ]),
        EnrollAttrition.aggregate([
            { $match: { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId - 1 } },
            {
                $group: {
                    _id: null,
                    studentsAdded: { $sum: "$STUDENTS_ADDED_DURING_YEAR" },
                    studentsGraduated: { $sum: "$STUDENTS_GRADUATED" },
                    studentsNotReturning: { $sum: "$STUD_NOT_RETURN" }
                }
            }
        ])
    ]);

    const data = current[0] || {};
    const prev = previous[0] || {};

    // trend line — students added across all years
    const trend = await EnrollAttrition.aggregate([
        { $match: { SCHOOL_ID: schoolId } },
        {
            $group: {
                _id: "$SCHOOL_YR_ID",
                studentsAdded: { $sum: "$STUDENTS_ADDED_DURING_YEAR" },
                studentsGraduated: { $sum: "$STUDENTS_GRADUATED" },
                studentsNotReturning: { $sum: "$STUD_NOT_RETURN" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const line = {
        labels: trend.map(r => String(r._id)),
        datasets: [
            { label: "Students Added", data: trend.map(r => r.studentsAdded || 0) },
            { label: "Graduated", data: trend.map(r => r.studentsGraduated || 0) },
            { label: "Not Returning", data: trend.map(r => r.studentsNotReturning || 0) },
        ]
    };

    // bar2 — added vs graduated vs not returning for selected year
    const bar2 = {
        labels: ["Added", "Graduated", "Not Returning"],
        datasets: [
            {
                label: "Selected Year",
                data: [data.studentsAdded || 0, data.studentsGraduated || 0, data.studentsNotReturning || 0]
            },
            {
                label: "Previous Year",
                data: [prev.studentsAdded || 0, prev.studentsGraduated || 0, prev.studentsNotReturning || 0]
            }
        ]
    };

    // donut — retention: returned vs not returning
    // total students = added + not returning + graduated (approximation)
    const total = (data.studentsAdded || 0) + (data.studentsGraduated || 0) + (data.studentsNotReturning || 0);
    const returning = Math.max(0, total - (data.studentsNotReturning || 0) - (data.studentsGraduated || 0));

    const donut = {
        labels: ["Returned", "Graduated", "Not Returning"],
        datasets: [{
            label: "Students",
            data: [returning, data.studentsGraduated || 0, data.studentsNotReturning || 0]
        }]
    };

    return {
        kpis: [
            { label: "Students Added", value: data.studentsAdded || 0, ...calcTrend(data.studentsAdded, prev.studentsAdded) },
            { label: "Students Not Returning", value: data.studentsNotReturning || 0, ...calcTrend(data.studentsNotReturning, prev.studentsNotReturning) },
            { label: "Students Graduated", value: data.studentsGraduated || 0, ...calcTrend(data.studentsGraduated, prev.studentsGraduated) }
        ],
        charts: {
            bar: {
                labels: ["Added", "Not Returning", "Graduated"],
                datasets: [{
                    label: "Students",
                    data: [data.studentsAdded || 0, data.studentsNotReturning || 0, data.studentsGraduated || 0]
                }]
            },
            line,
            bar2,
            donut
        }
    };
}

async function buildPersonnelDashboard(schoolId, yearId) {

    const [current, previous] = await Promise.all([
        EmployeePersonnel.aggregate([
            { $match: { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId } },
            {
                $group: {
                    _id: null,
                    totalEmployees: { $sum: "$TOTAL_EMPLOYEES" },
                    ftEmployees: { $sum: "$FT_EMPLOYEES" },
                    subcontractors: { $sum: "$SUBCONTRACT_NUM" }
                }
            }
        ]),
        EmployeePersonnel.aggregate([
            { $match: { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId - 1 } },
            {
                $group: {
                    _id: null,
                    totalEmployees: { $sum: "$TOTAL_EMPLOYEES" },
                    ftEmployees: { $sum: "$FT_EMPLOYEES" },
                    subcontractors: { $sum: "$SUBCONTRACT_NUM" }
                }
            }
        ])
    ]);

    const data = current[0] || {};
    const prev = previous[0] || {};

    // trend line across all years
    const trend = await EmployeePersonnel.aggregate([
        { $match: { SCHOOL_ID: schoolId } },
        { $group: { _id: "$SCHOOL_YR_ID", totalEmployees: { $sum: "$TOTAL_EMPLOYEES" } } },
        { $sort: { _id: 1 } }
    ]);

    const line = {
        labels: trend.map(r => String(r._id)),
        datasets: [{ label: "Total Employees", data: trend.map(r => r.totalEmployees || 0) }]
    };

    // by category bar
    const byCategory = await EmployeePersonnel.aggregate([
        { $match: { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId } },
        { $group: { _id: "$EMP_CAT_CD", totalEmployees: { $sum: "$TOTAL_EMPLOYEES" }, ftEmployees: { $sum: "$FT_EMPLOYEES" } } },
        { $lookup: { from: "refCode", localField: "_id", foreignField: "CODE_CD", as: "category" } },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $match: { $or: [{ "category.DOMAIN_CD": "EmployeeCategory" }, { category: { $exists: false } }] } },
        { $addFields: { label: { $cond: [{ $eq: ["$category.DOMAIN_CD", "EmployeeCategory"] }, "$category.DESCRIPTION_TX", "$_id"] } } },
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
                subcontract: { $sum: { $convert: { input: "$SUBCONTRACT_NUM", to: "double", onError: 0, onNull: 0 } } }
            }
        }
    ]);

    const comp = compAgg[0] || {};

    const compositionDoughnut = {
        labels: ["Full-Time", "Part-Time"],
        datasets: [{ label: "Count", data: [comp.ft || 0, Math.max(0, (comp.total || 0) - (comp.ft || 0))] }]
    };

    return {
        kpis: [
            { label: "Total Employees", value: data.totalEmployees || 0, ...calcTrend(data.totalEmployees, prev.totalEmployees) },
            { label: "FTEs", value: data.ftEmployees || 0, ...calcTrend(data.ftEmployees, prev.ftEmployees) },
            { label: "Subcontractors", value: data.subcontractors || 0, ...calcTrend(data.subcontractors, prev.subcontractors) }
        ],
        charts: {
            bar: {
                labels: ["Total", "FTE", "Subcontractors"],
                datasets: [{ label: "Your School", data: [data.totalEmployees || 0, data.ftEmployees || 0, data.subcontractors || 0] }]
            },
            line,
            bar2: byCategoryBar,
            donut: compositionDoughnut
        }
    };
}

async function buildAdminSupportDashboard(schoolId, yearId) {

    const [current, previous] = await Promise.all([
        EmployeeAdminSupport.aggregate([
            { $match: { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId } },
            { $group: { _id: null, exempt: { $sum: "$FTE_EXEMPT" }, nonExempt: { $sum: "$FTE_NONEXEMPT" } } }
        ]),
        EmployeeAdminSupport.aggregate([
            { $match: { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId - 1 } },
            { $group: { _id: null, exempt: { $sum: "$FTE_EXEMPT" }, nonExempt: { $sum: "$FTE_NONEXEMPT" } } }
        ])
    ]);

    const data = current[0] || {};
    const prev = previous[0] || {};

    const totalFTE = (data.exempt || 0) + (data.nonExempt || 0);
    const prevTotalFTE = (prev.exempt || 0) + (prev.nonExempt || 0);

    const trend = await EmployeeAdminSupport.aggregate([
        { $match: { SCHOOL_ID: schoolId } },
        { $group: { _id: "$SCHOOL_YR_ID", exempt: { $sum: "$FTE_EXEMPT" }, nonExempt: { $sum: "$FTE_NONEXEMPT" } } },
        { $sort: { _id: 1 } }
    ]);

    const line = {
        labels: trend.map(r => String(r._id)),
        datasets: [
            { label: "Exempt FTE", data: trend.map(r => r.exempt || 0) },
            { label: "Non-Exempt FTE", data: trend.map(r => r.nonExempt || 0) },
            { label: "Total FTE", data: trend.map(r => (r.exempt || 0) + (r.nonExempt || 0)) },
        ]
    };

    const byFunction = await EmployeeAdminSupport.aggregate([
        { $match: { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId } },
        {
            $group: {
                _id: "$ADMIN_STAFF_FUNC_CD",
                exempt: { $sum: "$FTE_EXEMPT" },
                nonExempt: { $sum: "$FTE_NONEXEMPT" },
                nrExempt: { $sum: "$NR_EXEMPT" },
                nrNonExempt: { $sum: "$NR_NONEXEMPT" }
            }
        },
        {
            $lookup: {
                from: "refCode",
                localField: "_id",
                foreignField: "CODE_CD",
                as: "funcLabel"
            }
        },
        { $unwind: { path: "$funcLabel", preserveNullAndEmptyArrays: true } },
        {
            $match: {
                $or: [
                    { "funcLabel.DOMAIN_CD": "AdminStaffFunction" },
                    { funcLabel: { $exists: false } }
                ]
            }
        },
        {
            $addFields: {
                label: {
                    $cond: [
                        { $eq: ["$funcLabel.DOMAIN_CD", "AdminStaffFunction"] },
                        "$funcLabel.DESCRIPTION_TX",
                        "$_id"
                    ]
                }
            }
        },
        { $sort: { exempt: -1 } },
        { $limit: 10 }
    ]);

    const bar2 = {
        labels: byFunction.map(r => r.label),
        datasets: [
            { label: "Exempt FTE", data: byFunction.map(r => r.exempt || 0) },
            { label: "Non-Exempt FTE", data: byFunction.map(r => r.nonExempt || 0) },
        ]
    };

    // donut — staff composition by function code
    const donut = {
        labels: byFunction.map(r => r.label),
        datasets: [{
            label: "Total FTE",
            data: byFunction.map(r => (r.exempt || 0) + (r.nonExempt || 0))
        }]
    };

    return {
        kpis: [
            { label: "Admin Support FTE", value: totalFTE, ...calcTrend(totalFTE, prevTotalFTE) },
            { label: "Exempt FTE", value: data.exempt || 0, ...calcTrend(data.exempt, prev.exempt) },
            { label: "Non-Exempt FTE", value: data.nonExempt || 0, ...calcTrend(data.nonExempt, prev.nonExempt) }
        ],
        charts: {
            bar: {
                labels: ["Exempt", "Non-Exempt"],
                datasets: [{ label: "Your School", data: [data.exempt || 0, data.nonExempt || 0] }]
            },
            line,
            bar2,
            donut
        }
    };
}

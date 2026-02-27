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
        chartData: {
            labels: ["Added", "Not Returning", "Graduated"],
            values: [
                data.studentsAdded || 0,
                data.studentsNotReturning || 0,
                data.studentsGraduated || 0
            ]
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

    return {
        kpis: [
            { label: "Total Employees", value: data.totalEmployees || 0 },
            { label: "FTEs", value: data.ftEmployees || 0 },
            { label: "Subcontractors", value: data.subcontractors || 0 }
        ],
        chartData: {
            labels: ["Total", "FTE", "Subcontractors"],
            values: [
                data.totalEmployees || 0,
                data.ftEmployees || 0,
                data.subcontractors || 0
            ]
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

    return {
        kpis: [
            { label: "Admin Support FTE", value: totalFTE },
            { label: "Exempt FTE", value: data.exempt || 0 },
            { label: "Non-Exempt FTE", value: data.nonExempt || 0 }
        ],
        chartData: {
            labels: ["Exempt", "Non-Exempt"],
            values: [
                data.exempt || 0,
                data.nonExempt || 0
            ]
        }
    };
}
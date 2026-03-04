import School from "../models/School.js";
import EmployeeAdminSupport from "../models/EmployeeAdminSupport.js";
import EmployeePersonnel from "../models/EmployeePersonnel.js";
import EnrollAttrition from "../models/EnrollAttrition.js";

export async function getCompareData({schoolId, yearId, cluster}){
    //find current school
    const school = await School.findOne({ ID: schoolId });
    if (!school) throw new Error("School not found");

    //find match condition of compareBy
    let matchCondition = { ACTIVE_INT: "Y" };
    matchCondition.ID = { $ne: schoolId };

    // user control witch cluster to use
    switch (cluster) {
        case "region":
            matchCondition.REGION_CD = school.REGION_CD;
            break;
        case "group":
            matchCondition.GROUP_CD = school.GROUP_CD;
            break;
        case "gender":
            matchCondition.GENDER_COMPOSITION_CD = school.GENDER_COMPOSITION_CD;
            break;
        case "all":
            break;
        default:
            throw new Error("Invalid cluster type");
    }

    // find matched schools
    const peerSchools = await School.find(matchCondition);
    const peerSchoolId = peerSchools.map(s => s.ID);
    console.log("Matched peer schools:", peerSchoolId);

    const [peer, your] = await Promise.all([
        calculatePeerKpis(peerSchoolId, yearId),
        calculateYourKpis(schoolId, yearId)
    ]);
    console.log([peer, your]);

    return {
        your,
        peer
    };
}

async function calculatePeerKpis(peerSchoolId, yearId) {

    const [adminResult, personnelResult, enrollResult] = await Promise.all([

        EmployeeAdminSupport.aggregate([
            { $match:
                    {
                        SCHOOL_ID: { $in: peerSchoolId },
                        SCHOOL_YR_ID: Number(yearId)
                    }
            },
            {
                $group: {
                    _id: "$SCHOOL_ID",
                    exemptFte: { $sum: "$FTE_EXEMPT" },
                    nonExemptFte: { $sum: "$FTE_NONEXEMPT" }
                }
            },
            {
                $group: {
                    _id: null,
                    avgExemptFte: { $avg: "$exemptFte" },
                    avgNonExemptFte: { $avg: "$nonExemptFte" },
                    avgAdminSupportFte: { $avg: { $add: ["$exemptFte", "$nonExemptFte"] } }
                }
            }
        ]),

        EmployeePersonnel.aggregate([
            { $match:
                    {
                        SCHOOL_ID: { $in: peerSchoolId },
                        SCHOOL_YR_ID: Number(yearId)
                    }
            },
            {
                $group: {
                    _id: "$SCHOOL_ID",
                    totalEmployees: { $sum: "$TOTAL_EMPLOYEES" },
                    totalFTEmployees: { $sum: "$FT_EMPLOYEES" },
                    totalFTEOnly: { $sum: "$FTE_ONLY_NUM" }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTotalEmployees: { $avg: "$totalEmployees" },
                    avgFTEmployees: { $avg: "$totalFTEmployees" },
                    avgFTEOnly: { $avg: "$totalFTEOnly" }
                }
            }
        ]),

        EnrollAttrition.aggregate([
            { $match:
                    {
                        SCHOOL_ID: { $in: peerSchoolId },
                        SCHOOL_YR_ID: Number(yearId)
                    }
            },
            {
                $group: {
                    _id: "$SCHOOL_ID",
                    added: { $sum: "$STUDENTS_ADDED_DURING_YEAR" },
                    graduated: { $sum: "$STUDENTS_GRADUATED" },
                    notReturn: { $sum: "$STUD_NOT_RETURN" }
                }
            },
            {
                $group: {
                    _id: null,
                    avgStudentsAdded: {$avg: "$added"},
                    avgStudentsGraduated: {$avg: "$graduated"},
                    avgStudentsNotReturn: {$avg: "$notReturn"}
                }
            }
        ])

    ]);

    return {
        adminSupport: adminResult[0] || {},
        personnel: personnelResult[0] || {},
        enrollment: enrollResult[0] || {}
    };
}

async function calculateYourKpis(schoolId, yearId) {
    const y = Number(yearId);

    const toNum = (fieldPath) => ({
        $convert: {
            input: fieldPath,
            to: "double",
            onError: 0,
            onNull: 0,
        },
    });

    const [adminResult, personnelResult, enrollResult] = await Promise.all([
        // Admin Support
        EmployeeAdminSupport.aggregate([
            {
                $match: {
                    SCHOOL_ID: schoolId,
                    SCHOOL_YR_ID: y,
                },
            },
            {
                $group: {
                    _id: null,
                    exemptFte: { $sum: toNum("$FTE_EXEMPT") },
                    nonExemptFte: { $sum: toNum("$FTE_NONEXEMPT") },
                },
            },
            {
                $project: {
                    _id: 0,
                    exemptFte: 1,
                    nonExemptFte: 1,
                    totalAdminSupportFte: { $add: ["$exemptFte", "$nonExemptFte"] },
                },
            },
        ]),

        // Personnel
        EmployeePersonnel.aggregate([
            {
                $match: {
                    SCHOOL_ID: schoolId,
                    SCHOOL_YR_ID: y,
                },
            },
            {
                $group: {
                    _id: null,
                    totalEmployees: { $sum: toNum("$TOTAL_EMPLOYEES") },
                    ftEmployees: { $sum: toNum("$FT_EMPLOYEES") },
                    fteOnly: { $sum: toNum("$FTE_ONLY_NUM") },
                },
            },
            { $project: { _id: 0 } },
        ]),

        // Enrollment
        EnrollAttrition.aggregate([
            {
                $match: {
                    SCHOOL_ID: schoolId,
                    SCHOOL_YR_ID: y,
                },
            },
            {
                $group: {
                    _id: null,
                    studentsAdded: { $sum: toNum("$STUDENTS_ADDED_DURING_YEAR") },
                    studentsGraduated: { $sum: toNum("$STUDENTS_GRADUATED") },
                    studentsNotReturn: { $sum: toNum("$STUD_NOT_RETURN") },
                },
            },
            { $project: { _id: 0 } },
        ]),
    ]);

    return {
        adminSupport: adminResult?.[0] ?? {},
        personnel: personnelResult?.[0] ?? {},
        enrollment: enrollResult?.[0] ?? {},
    };
}
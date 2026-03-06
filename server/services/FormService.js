import Submission from "../models/Submission.js";
import EmployeePersonnel from "../models/EmployeePersonnel.js";
import EmployeeAdminSupport from "../models/EmployeeAdminSupport.js";
import SchoolYear from "../models/SchoolYear.js";
import RefCode from "../models/RefCode.js";
import mongoose from "mongoose";

function mustBeSchoolUser(user) {
    if (!user || user.role !== "SCHOOL" || !user.schoolId) {
        return { ok: false, status: 403, error: "Only school users can access the form." };
    }
    return { ok: true };
}
async function getNextNumericId(Model) {
    const last = await Model.findOne({}, { ID: 1 }).sort({ ID: -1 }).lean();
    return (last?.ID ?? 0) + 1;
}
function asDecimal(value) {
    if (value === null || value === undefined || value === "") return null;
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    return mongoose.Types.Decimal128.fromString(String(num));
}
function asInt(value) {
    if (value === null || value === undefined || value === "") return 0;
    const num = Number(value);
    return Number.isFinite(num) ? Math.trunc(num) : 0;
}
function isValidNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0;
}

function isZero(value) {
    return Number(value) === 0;
}
function normalizeDecimal(value) {
    if (!value) return 0;

    if (typeof value === "object" && value.$numberDecimal) {
        return Number(value.$numberDecimal);
    }

    if (value._bsontype === "Decimal128") {
        return Number(value.toString());
    }

    return Number(value);
}

function isPersonnelRowEmpty(row) {
    return (
        isZero(row.TOTAL_EMPLOYEES) &&
        isZero(row.FT_EMPLOYEES) &&
        isZero(row.POC_EMPLOYEES) &&
        isZero(row.SUBCONTRACT_NUM) &&
        isZero(row.SUBCONTRACT_FTE) &&
        isZero(row.FTE_ONLY_NUM)
    );
}

function isAdminSupportRowEmpty(row) {
    return (
        isZero(row.NR_EXEMPT) &&
        isZero(row.NR_NONEXEMPT) &&
        isZero(row.FTE_EXEMPT) &&
        isZero(row.FTE_NONEXEMPT)
    );
}

function validatePersonnelRow(row) {
    const errors = {};

    const total = Number(row?.TOTAL_EMPLOYEES);
    const ft = Number(row?.FT_EMPLOYEES);
    const poc = Number(row?.POC_EMPLOYEES);
    const subcontractNum = Number(row?.SUBCONTRACT_NUM);
    const subcontractFte = Number(row?.SUBCONTRACT_FTE);
    const fteOnlyNum = Number(row?.FTE_ONLY_NUM);

    if (!row?.EMP_CAT_CD) {
        errors.EMP_CAT_CD = "Employee category is required.";
    }

    if (isPersonnelRowEmpty(row)) {
        return {
            ok: true,
            errors,
            cleaned: {
                EMP_CAT_CD: row?.EMP_CAT_CD,
                TOTAL_EMPLOYEES: 0,
                FT_EMPLOYEES: 0,
                POC_EMPLOYEES: 0,
                SUBCONTRACT_NUM: 0,
                SUBCONTRACT_FTE: 0,
                FTE_ONLY_NUM: 0,
            }
        };
    }

    if (!isValidNumber(row.TOTAL_EMPLOYEES)) {
        errors.TOTAL_EMPLOYEES = "Total employees must be a valid number (≥ 0).";
    } else if (total < 1) {
        errors.TOTAL_EMPLOYEES = "Total employees must be at least 1 when this category is used.";
    }

    if (!isValidNumber(row.FT_EMPLOYEES)) {
        errors.FT_EMPLOYEES = "Full-time employees must be a valid number (≥ 0).";
    } else if (ft > total) {
        errors.FT_EMPLOYEES = "Full-time employees cannot exceed total employees.";
    }

    if (!isValidNumber(row.POC_EMPLOYEES)) {
        errors.POC_EMPLOYEES = "Employees identifying as People of Color must be a valid number (≥ 0).";
    } else if (poc > total) {
        errors.POC_EMPLOYEES = "Employees identifying as People of Color cannot exceed total employees.";
    }

    if (!isValidNumber(row.SUBCONTRACT_NUM)) {
        errors.SUBCONTRACT_NUM = "Subcontractors must be a valid number (≥ 0).";
    } else if (subcontractNum > total) {
        errors.SUBCONTRACT_NUM = "Subcontractors cannot exceed total employees.";
    }

    if (!isValidNumber(row.SUBCONTRACT_FTE)) {
        errors.SUBCONTRACT_FTE = "Subcontractor full-time equivalent must be a valid number (≥ 0).";
    } else if (subcontractFte > subcontractNum) {
        errors.SUBCONTRACT_FTE = "Subcontractor full-time equivalent cannot exceed subcontractor headcount.";
    }

    if (!isValidNumber(row.FTE_ONLY_NUM)) {
        errors.FTE_ONLY_NUM = "Employee full-time equivalent must be a valid number (≥ 0).";
    } else if (fteOnlyNum > total) {
        errors.FTE_ONLY_NUM = "Employee full-time equivalent cannot exceed total employees.";
    }

    return {
        ok: Object.keys(errors).length === 0,
        errors,
        cleaned: {
            EMP_CAT_CD: row?.EMP_CAT_CD,
            TOTAL_EMPLOYEES: isValidNumber(row.TOTAL_EMPLOYEES) ? total : 0,
            FT_EMPLOYEES: isValidNumber(row.FT_EMPLOYEES) ? ft : 0,
            POC_EMPLOYEES: isValidNumber(row.POC_EMPLOYEES) ? poc : 0,
            SUBCONTRACT_NUM: isValidNumber(row.SUBCONTRACT_NUM) ? subcontractNum : 0,
            SUBCONTRACT_FTE: isValidNumber(row.SUBCONTRACT_FTE) ? subcontractFte : 0,
            FTE_ONLY_NUM: isValidNumber(row.FTE_ONLY_NUM) ? fteOnlyNum : 0,
        }
    };
}

function validateAdminSupportRow(row) {
    const errors = {};

    const nrEx = Number(row?.NR_EXEMPT);
    const nrNon = Number(row?.NR_NONEXEMPT);
    const fteEx = Number(row?.FTE_EXEMPT);
    const fteNon = Number(row?.FTE_NONEXEMPT);

    if (!row?.ADMIN_STAFF_FUNC_CD) {
        errors.ADMIN_STAFF_FUNC_CD = "Administrative staff function is required.";
    }

    if (isAdminSupportRowEmpty(row)) {
        return {
            ok: true,
            errors,
            cleaned: {
                ADMIN_STAFF_FUNC_CD: row?.ADMIN_STAFF_FUNC_CD,
                NR_EXEMPT: 0,
                NR_NONEXEMPT: 0,
                FTE_EXEMPT: 0,
                FTE_NONEXEMPT: 0,
            }
        };
    }

    if (!isValidNumber(row.NR_EXEMPT)) {
        errors.NR_EXEMPT = "Exempt employees must be a valid number (≥ 0).";
    }

    if (!isValidNumber(row.NR_NONEXEMPT)) {
        errors.NR_NONEXEMPT = "Non-exempt employees must be a valid number (≥ 0).";
    }

    if (!isValidNumber(row.FTE_EXEMPT)) {
        errors.FTE_EXEMPT = "Exempt full-time equivalent must be a valid number (≥ 0).";
    }

    if (!isValidNumber(row.FTE_NONEXEMPT)) {
        errors.FTE_NONEXEMPT = "Non-exempt full-time equivalent must be a valid number (≥ 0).";
    }

    return {
        ok: Object.keys(errors).length === 0,
        errors,
        cleaned: {
            ADMIN_STAFF_FUNC_CD: row?.ADMIN_STAFF_FUNC_CD,
            NR_EXEMPT: isValidNumber(row.NR_EXEMPT) ? nrEx : 0,
            NR_NONEXEMPT: isValidNumber(row.NR_NONEXEMPT) ? nrNon : 0,
            FTE_EXEMPT: isValidNumber(row.FTE_EXEMPT) ? fteEx : 0,
            FTE_NONEXEMPT: isValidNumber(row.FTE_NONEXEMPT) ? fteNon : 0,
        }
    };
}

export async function getFormOptionsService({ user }) {
    const chk = mustBeSchoolUser(user);
    if (!chk.ok) return chk;

    const [personnelCodes, adminCodes] = await Promise.all([
        EmployeePersonnel.distinct("EMP_CAT_CD", { EMP_CAT_CD: { $ne: null } }),
        EmployeeAdminSupport.distinct("ADMIN_STAFF_FUNC_CD", { ADMIN_STAFF_FUNC_CD: { $ne: null } }),
    ]);

    const allCodes = [...new Set([...personnelCodes, ...adminCodes].filter(Boolean))];

    const refCodes = await RefCode.find(
        { CODE_CD: { $in: allCodes } },
        { _id: 0, CODE_CD: 1, DESCRIPTION_TX: 1 }
    ).lean();

    const refMap = new Map(refCodes.map((r) => [r.CODE_CD, r.DESCRIPTION_TX]));

    return {
        status: 200,
        data: {
            personnelCategories: personnelCodes
                .filter(Boolean)
                .sort()
                .map((code) => ({
                    value: code,
                    label: refMap.get(code) || code,
                })),
            adminFunctions: adminCodes
                .filter(Boolean)
                .sort()
                .map((code) => ({
                    value: code,
                    label: refMap.get(code) || code,
                })),
        },
    };
}

export async function getYearsService({ user }) {
    //const chk = mustBeSchoolUser(user);
    //if (!chk.ok) return chk;

    const years = await SchoolYear.find()
        .select({ _id: 0, ID: 1, SCHOOL_YEAR: 1 })
        .sort({ SCHOOL_YEAR: 1 })
        .lean();

    return {
        status: 200,
        data: years,
    };
}

export async function getFormService({ user, yearId }) {
    const chk = mustBeSchoolUser(user);
    if (!chk.ok) return chk;
    if (!Number.isInteger(yearId) || yearId <= 0) {
        return { status: 400, error: "yearId is required." };
    }

    const schoolId = user.schoolId;

    const [submission, personnelRows, adminRows] = await Promise.all([
        Submission.findOne({ schoolId, yearId }).lean(),
        EmployeePersonnel.find({ SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId }).lean(),
        EmployeeAdminSupport.find({ SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId }).lean(),
    ]);

    return {
        status: 200,
        data: {
            yearId,
            schoolId,
            status: submission?.status ?? "draft",
            personnelRows: personnelRows.map((row) => ({
                EMP_CAT_CD: row.EMP_CAT_CD,
                TOTAL_EMPLOYEES: normalizeDecimal(row.TOTAL_EMPLOYEES),
                FT_EMPLOYEES: normalizeDecimal(row.FT_EMPLOYEES),
                POC_EMPLOYEES: normalizeDecimal(row.POC_EMPLOYEES),
                SUBCONTRACT_NUM: normalizeDecimal(row.SUBCONTRACT_NUM),
                SUBCONTRACT_FTE: normalizeDecimal(row.SUBCONTRACT_FTE),
                FTE_ONLY_NUM: normalizeDecimal(row.FTE_ONLY_NUM),
            })),
            adminSupportRows: adminRows.map((row) => ({
                ADMIN_STAFF_FUNC_CD: row.ADMIN_STAFF_FUNC_CD,
                NR_EXEMPT: normalizeDecimal(row.NR_EXEMPT),
                NR_NONEXEMPT: normalizeDecimal(row.NR_NONEXEMPT),
                FTE_EXEMPT: normalizeDecimal(row.FTE_EXEMPT),
                FTE_NONEXEMPT: normalizeDecimal(row.FTE_NONEXEMPT),
            })),
        },
    };
}

export async function saveDraftService({ user, body }) {
    const chk = mustBeSchoolUser(user);
    if (!chk.ok) return chk;

    const yearId = Number(body?.yearId);
    if (!Number.isInteger(yearId) || yearId <= 0) {
        return { status: 400, error: "yearId is required." };
    }

    const schoolId = user.schoolId;
    const personnelRows = body?.personnelRows ?? [];
    const adminSupportRows = body?.adminSupportRows ?? [];

    const personnelValidation = [];
    const adminValidation = [];

    for (const row of personnelRows) {
        const v = validatePersonnelRow(row);
        personnelValidation.push(v.errors);

        const existing = await EmployeePersonnel.findOne({
            SCHOOL_ID: schoolId,
            SCHOOL_YR_ID: yearId,
            EMP_CAT_CD: row.EMP_CAT_CD,
        }).lean();

        const idToUse = existing?.ID ?? await getNextNumericId(EmployeePersonnel);

        await EmployeePersonnel.findOneAndUpdate(
            {
                SCHOOL_ID: schoolId,
                SCHOOL_YR_ID: yearId,
                EMP_CAT_CD: row.EMP_CAT_CD,
            },
            {
                $set: {
                    ID: idToUse,
                    SCHOOL_ID: schoolId,
                    SCHOOL_YR_ID: yearId,
                    EMP_CAT_CD: v.cleaned.EMP_CAT_CD,

                    TOTAL_EMPLOYEES: asInt(v.cleaned.TOTAL_EMPLOYEES),
                    FT_EMPLOYEES: asDecimal(v.cleaned.FT_EMPLOYEES),
                    POC_EMPLOYEES: asInt(v.cleaned.POC_EMPLOYEES),
                    SUBCONTRACT_NUM: asInt(v.cleaned.SUBCONTRACT_NUM),
                    SUBCONTRACT_FTE: asDecimal(v.cleaned.SUBCONTRACT_FTE),
                    FTE_ONLY_NUM: asInt(v.cleaned.FTE_ONLY_NUM),

                    LOCK_ID: 0,
                    UPDATE_USER_TX: String(user.id ?? "system"),
                    UPDATE_DT: new Date(),
                },
            },
            { upsert: true, new: true }
        );
    }

    for (const row of adminSupportRows) {
        const v = validateAdminSupportRow(row);
        adminValidation.push(v.errors);

        const existing = await EmployeeAdminSupport.findOne({
            SCHOOL_ID: schoolId,
            SCHOOL_YR_ID: yearId,
            ADMIN_STAFF_FUNC_CD: row.ADMIN_STAFF_FUNC_CD,
        }).lean();

        const idToUse = existing?.ID ?? await getNextNumericId(EmployeeAdminSupport);

        await EmployeeAdminSupport.findOneAndUpdate(
            {
                SCHOOL_ID: schoolId,
                SCHOOL_YR_ID: yearId,
                ADMIN_STAFF_FUNC_CD: row.ADMIN_STAFF_FUNC_CD,
            },
            {
                $set: {
                    ID: idToUse,
                    SCHOOL_ID: schoolId,
                    SCHOOL_YR_ID: yearId,
                    ADMIN_STAFF_FUNC_CD: v.cleaned.ADMIN_STAFF_FUNC_CD,

                    NR_EXEMPT: asInt(v.cleaned.NR_EXEMPT),
                    NR_NONEXEMPT: asInt(v.cleaned.NR_NONEXEMPT),
                    FTE_EXEMPT: asDecimal(v.cleaned.FTE_EXEMPT),
                    FTE_NONEXEMPT: asDecimal(v.cleaned.FTE_NONEXEMPT),

                    LOCK_ID: 0,
                    UPDATE_USER_TX: String(user.id ?? "system"),
                    UPDATE_DT: new Date(),
                },
            },
            { upsert: true, new: true }
        );
    }

    await Submission.findOneAndUpdate(
        { schoolId, yearId },
        { $set: { status: "draft" } },
        { upsert: true, new: true }
    );

    return {
        status: 200,
        message: "Draft saved.",
        validation: {
            personnel: personnelValidation,
            adminSupport: adminValidation,
        },
    };
}

export async function submitService({ user, body }) {
    const chk = mustBeSchoolUser(user);
    if (!chk.ok) return chk;

    const yearId = Number(body?.yearId);
    if (!Number.isInteger(yearId) || yearId <= 0) {
        return { status: 400, error: "yearId is required." };
    }

    const schoolId = user.schoolId;
    const personnelRows = body?.personnelRows ?? [];
    const adminSupportRows = body?.adminSupportRows ?? [];

    const personnelValidation = personnelRows.map((row) => validatePersonnelRow(row));
    const adminValidation = adminSupportRows.map((row) => validateAdminSupportRow(row));

    const hasErrors =
        personnelValidation.some((v) => !v.ok) ||
        adminValidation.some((v) => !v.ok);

    if (hasErrors) {
        return {
            status: 400,
            error: "Fix validation errors before submitting.",
            validation: {
                personnel: personnelValidation.map((v) => v.errors),
                adminSupport: adminValidation.map((v) => v.errors),
            },
        };
    }

    for (const v of personnelValidation) {
        const existing = await EmployeePersonnel.findOne({
            SCHOOL_ID: schoolId,
            SCHOOL_YR_ID: yearId,
            EMP_CAT_CD: v.cleaned.EMP_CAT_CD,
        }).lean();

        const idToUse = existing?.ID ?? await getNextNumericId(EmployeePersonnel);

        await EmployeePersonnel.findOneAndUpdate(
            {
                SCHOOL_ID: schoolId,
                SCHOOL_YR_ID: yearId,
                EMP_CAT_CD: v.cleaned.EMP_CAT_CD,
            },
            {
                $set: {
                    ID: idToUse,
                    SCHOOL_ID: schoolId,
                    SCHOOL_YR_ID: yearId,
                    EMP_CAT_CD: v.cleaned.EMP_CAT_CD,

                    TOTAL_EMPLOYEES: asInt(v.cleaned.TOTAL_EMPLOYEES),
                    FT_EMPLOYEES: asDecimal(v.cleaned.FT_EMPLOYEES),
                    POC_EMPLOYEES: asInt(v.cleaned.POC_EMPLOYEES),
                    SUBCONTRACT_NUM: asInt(v.cleaned.SUBCONTRACT_NUM),
                    SUBCONTRACT_FTE: asDecimal(v.cleaned.SUBCONTRACT_FTE),
                    FTE_ONLY_NUM: asInt(v.cleaned.FTE_ONLY_NUM),

                    LOCK_ID: 0,
                    UPDATE_USER_TX: String(user.id ?? "system"),
                    UPDATE_DT: new Date(),
                },
            },
            { upsert: true, new: true }
        );
    }

    for (const row of adminSupportRows) {
        const v = validateAdminSupportRow(row);
        adminValidation.push(v.errors);

        const existing = await EmployeeAdminSupport.findOne({
            SCHOOL_ID: schoolId,
            SCHOOL_YR_ID: yearId,
            ADMIN_STAFF_FUNC_CD: row.ADMIN_STAFF_FUNC_CD,
        }).lean();

        const idToUse = existing?.ID ?? await getNextNumericId(EmployeeAdminSupport);

        await EmployeeAdminSupport.findOneAndUpdate(
            {
                SCHOOL_ID: schoolId,
                SCHOOL_YR_ID: yearId,
                ADMIN_STAFF_FUNC_CD: row.ADMIN_STAFF_FUNC_CD,
            },
            {
                $set: {
                    ID: idToUse,
                    SCHOOL_ID: schoolId,
                    SCHOOL_YR_ID: yearId,
                    ADMIN_STAFF_FUNC_CD: v.cleaned.ADMIN_STAFF_FUNC_CD,

                    NR_EXEMPT: asInt(v.cleaned.NR_EXEMPT),
                    NR_NONEXEMPT: asInt(v.cleaned.NR_NONEXEMPT),
                    FTE_EXEMPT: asDecimal(v.cleaned.FTE_EXEMPT),
                    FTE_NONEXEMPT: asDecimal(v.cleaned.FTE_NONEXEMPT),

                    LOCK_ID: 0,
                    UPDATE_USER_TX: String(user.id ?? "system"),
                    UPDATE_DT: new Date(),
                },
            },
            { upsert: true, new: true }
        );
    }

    await Submission.findOneAndUpdate(
        { schoolId, yearId },
        { $set: { status: "submitted", submittedAt: new Date() } },
        { upsert: true, new: true }
    );

    return { status: 200, message: "Submitted successfully." };
}
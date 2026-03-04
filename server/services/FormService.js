import Submission from "../models/Submission.js";
import EmployeePersonnel from "../models/EmployeePersonnel.js";
import EmployeeAdminSupport from "../models/EmployeeAdminSupport.js";
import schoolYear from "../models/SchoolYear.js";

function mustBeSchoolUser(user) {
    if (!user || user.role !== "SCHOOL" || !user.schoolId) {
        return { ok: false, status: 403, error: "Only school users can access the form." };
    }
    return { ok: true };
}

function validatePersonnel(p) {
    const errors = {};

    const total = Number(p?.TOTAL_EMPLOYEES);
    const ft = Number(p?.FT_EMPLOYEES);
    const poc = p?.POC_EMPLOYEES === "" || p?.POC_EMPLOYEES === undefined ? null : Number(p?.POC_EMPLOYEES);

    if (!Number.isInteger(total) || total < 0) errors.TOTAL_EMPLOYEES = "Total employees must be a whole number ≥ 0.";
    if (!Number.isInteger(ft) || ft < 0) errors.FT_EMPLOYEES = "Full-time employees must be a whole number ≥ 0.";
    if (Number.isInteger(total) && Number.isInteger(ft) && ft > total) errors.FT_EMPLOYEES = "Full-time employees cannot exceed total employees.";

    if (poc !== null) {
        if (!Number.isInteger(poc) || poc < 0) errors.POC_EMPLOYEES = "POC employees must be a whole number ≥ 0.";
        if (Number.isInteger(total) && Number.isInteger(poc) && poc > total) errors.POC_EMPLOYEES = "POC employees cannot exceed total employees.";
    }

    return { ok: Object.keys(errors).length === 0, errors, cleaned: { TOTAL_EMPLOYEES: total, FT_EMPLOYEES: ft, POC_EMPLOYEES: poc } };
}

function validateAdminSupport(a) {
    const errors = {};
    const nrEx = Number(a?.NR_EXEMPT);
    const nrNon = Number(a?.NR_NONEXEMPT);
    const fteEx = Number(a?.FTE_EXEMPT);
    const fteNon = Number(a?.FTE_NONEXEMPT);

    const intFields = [
        ["NR_EXEMPT", nrEx],
        ["NR_NONEXEMPT", nrNon],
    ];
    for (const [k, v] of intFields) {
        if (!Number.isInteger(v) || v < 0) errors[k] = "Must be a whole number ≥ 0.";
    }

    const numFields = [
        ["FTE_EXEMPT", fteEx],
        ["FTE_NONEXEMPT", fteNon],
    ];
    for (const [k, v] of numFields) {
        if (!Number.isFinite(v) || v < 0) errors[k] = "Must be a number ≥ 0.";
    }

    return {
        ok: Object.keys(errors).length === 0,
        errors,
        cleaned: { NR_EXEMPT: nrEx, NR_NONEXEMPT: nrNon, FTE_EXEMPT: fteEx, FTE_NONEXEMPT: fteNon }
    };
}

export async function getYearsService({ user }) {
    const chk = mustBeSchoolUser(user);
    if (!chk.ok) return chk;

    const years = await schoolYear.find().select({ _id: 0, ID: 1, SCHOOL_YEAR: 1 }).sort({ SCHOOL_YEAR: 1 }).lean();

    return {
        status: 200,
        data: years//.sort((a, b) => a.SCHOOL_YEAR - b.SCHOOL_YEAR)
    };

}

export async function getFormService({ user, yearId }) {
    const chk = mustBeSchoolUser(user);
    if (!chk.ok) return chk;
    if (!Number.isInteger(yearId) || yearId <= 0) return { status: 400, error: "yearId is required." };

    const schoolId = user.schoolId;

    const submission = await Submission.findOne({ schoolId, yearId }).lean();
    const personnel = await EmployeePersonnel.findOne({ SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId }).lean();
    const admin = await EmployeeAdminSupport.findOne({ SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId }).lean();

    return {
        status: 200,
        data: {
            yearId,
            schoolId,
            status: submission?.status ?? "draft",
            personnel: personnel ? {
                TOTAL_EMPLOYEES: personnel.TOTAL_EMPLOYEES ?? 0,
                FT_EMPLOYEES: personnel.FT_EMPLOYEES ?? 0,
                POC_EMPLOYEES: personnel.POC_EMPLOYEES ?? 0,
            } : { TOTAL_EMPLOYEES: 0, FT_EMPLOYEES: 0, POC_EMPLOYEES: 0 },
            adminSupport: admin ? {
                NR_EXEMPT: admin.NR_EXEMPT ?? 0,
                NR_NONEXEMPT: admin.NR_NONEXEMPT ?? 0,
                FTE_EXEMPT: admin.FTE_EXEMPT ?? 0,
                FTE_NONEXEMPT: admin.FTE_NONEXEMPT ?? 0,
            } : { NR_EXEMPT: 0, NR_NONEXEMPT: 0, FTE_EXEMPT: 0, FTE_NONEXEMPT: 0 }
        }
    };
}

export async function saveDraftService({ user, body }) {
    const chk = mustBeSchoolUser(user);
    if (!chk.ok) return chk;

    const yearId = Number(body?.yearId);
    if (!Number.isInteger(yearId) || yearId <= 0) return { status: 400, error: "yearId is required." };

    const schoolId = user.schoolId;

    // validate (draft can allow incomplete, but we’ll still type-check)
    const v1 = validatePersonnel(body?.personnel ?? {});
    const v2 = validateAdminSupport(body?.adminSupport ?? {});

    // For drafts: allow save even if invalid, but return errors so UI can show
    await EmployeePersonnel.findOneAndUpdate(
        { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId },
        { $set: { ...v1.cleaned } },
        { upsert: true, new: true }
    );

    await EmployeeAdminSupport.findOneAndUpdate(
        { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId },
        { $set: { ...v2.cleaned } },
        { upsert: true, new: true }
    );

    await Submission.findOneAndUpdate(
        { schoolId, yearId },
        { $set: { status: "draft" } },
        { upsert: true, new: true }
    );

    return {
        status: 200,
        message: "Draft saved.",
        validation: { personnel: v1.errors, adminSupport: v2.errors }
    };
}

export async function submitService({ user, body }) {
    const chk = mustBeSchoolUser(user);
    if (!chk.ok) return chk;

    const yearId = Number(body?.yearId);
    if (!Number.isInteger(yearId) || yearId <= 0) return { status: 400, error: "yearId is required." };

    const schoolId = user.schoolId;

    const v1 = validatePersonnel(body?.personnel ?? {});
    const v2 = validateAdminSupport(body?.adminSupport ?? {});

    const hasErrors = !v1.ok || !v2.ok;
    if (hasErrors) {
        return {
            status: 400,
            error: "Fix validation errors before submitting.",
            validation: { personnel: v1.errors, adminSupport: v2.errors }
        };
    }

    await EmployeePersonnel.findOneAndUpdate(
        { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId },
        { $set: { ...v1.cleaned } },
        { upsert: true, new: true }
    );

    await EmployeeAdminSupport.findOneAndUpdate(
        { SCHOOL_ID: schoolId, SCHOOL_YR_ID: yearId },
        { $set: { ...v2.cleaned } },
        { upsert: true, new: true }
    );

    await Submission.findOneAndUpdate(
        { schoolId, yearId },
        { $set: { status: "submitted", submittedAt: new Date() } },
        { upsert: true, new: true }
    );

    return { status: 200, message: "Submitted successfully." };
}
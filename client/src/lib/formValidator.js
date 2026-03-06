function isValidNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0;
}

function isZero(value) {
    return Number(value) === 0;
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

export function validatePersonnelRow(row) {
    const errors = {};

    if (!row?.EMP_CAT_CD) {
        errors.EMP_CAT_CD = "Employee category is required.";
        return errors;
    }

    // allow completely unused rows
    if (isPersonnelRowEmpty(row)) {
        return errors;
    }

    if (!isValidNumber(row.TOTAL_EMPLOYEES)) {
        errors.TOTAL_EMPLOYEES = "Total employees must be a valid number (≥ 0).";
    } else if (Number(row.TOTAL_EMPLOYEES) < 1) {
        errors.TOTAL_EMPLOYEES = "Total employees must be at least 1 when this category is used.";
    }

    if (!isValidNumber(row.FT_EMPLOYEES)) {
        errors.FT_EMPLOYEES = "Full-time employees must be a valid number (≥ 0).";
    } else if (Number(row.FT_EMPLOYEES) > Number(row.TOTAL_EMPLOYEES)) {
        errors.FT_EMPLOYEES = "Full-time employees cannot exceed total employees.";
    }

    if (!isValidNumber(row.POC_EMPLOYEES)) {
        errors.POC_EMPLOYEES = "Employees identifying as People of Color must be a valid number (≥ 0).";
    } else if (Number(row.POC_EMPLOYEES) > Number(row.TOTAL_EMPLOYEES)) {
        errors.POC_EMPLOYEES = "Employees identifying as People of Color cannot exceed total employees.";
    }

    if (!isValidNumber(row.SUBCONTRACT_NUM)) {
        errors.SUBCONTRACT_NUM = "Subcontractors must be a valid number (≥ 0).";
    } else if (Number(row.SUBCONTRACT_NUM) > Number(row.TOTAL_EMPLOYEES)) {
        errors.SUBCONTRACT_NUM = "Subcontractors cannot exceed total employees.";
    }

    if (!isValidNumber(row.SUBCONTRACT_FTE)) {
        errors.SUBCONTRACT_FTE = "Subcontractor full-time equivalent must be a valid number (≥ 0).";
    } else if (Number(row.SUBCONTRACT_FTE) > Number(row.SUBCONTRACT_NUM)) {
        errors.SUBCONTRACT_FTE = "Subcontractor full-time equivalent cannot exceed subcontractor headcount.";
    }

    if (!isValidNumber(row.FTE_ONLY_NUM)) {
        errors.FTE_ONLY_NUM = "Employee full-time equivalent must be a valid number (≥ 0).";
    } else if (Number(row.FTE_ONLY_NUM) > Number(row.TOTAL_EMPLOYEES)) {
        errors.FTE_ONLY_NUM = "Employee full-time equivalent cannot exceed total employees.";
    }

    return errors;
}

export function validateAdminSupportRow(row) {
    const errors = {};

    if (!row?.ADMIN_STAFF_FUNC_CD) {
        errors.ADMIN_STAFF_FUNC_CD = "Administrative staff function is required.";
        return errors;
    }

    // allow completely unused rows
    if (isAdminSupportRowEmpty(row)) {
        return errors;
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

    return errors;
}

export function validateForm(personnelRows, adminSupportRows) {
    const personnel = personnelRows.map(validatePersonnelRow);
    const adminSupport = adminSupportRows.map(validateAdminSupportRow);

    const hasErrors =
        personnel.some((rowErrors) => Object.keys(rowErrors).length > 0) ||
        adminSupport.some((rowErrors) => Object.keys(rowErrors).length > 0);

    return {
        personnel,
        adminSupport,
        hasErrors,
    };
}
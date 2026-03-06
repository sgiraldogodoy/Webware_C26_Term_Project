// validator for form

export function validatePersonnel(personnel) {
        const errors = {};

        // Number Validator
        const isValidNumber = (number) => {
            const num = Number(number);
            return Number.isFinite(num) && num >= 0;
        }

        //total employees
        if (!isValidNumber(personnel.TOTAL_EMPLOYEES)) {
            errors.TOTAL_EMPLOYEES = "Total employees must be a valid number (≥ 0)";
        } else if (Number(personnel.TOTAL_EMPLOYEES) < 1) {
            errors.TOTAL_EMPLOYEES = "Total employees must be at least 1";
        }

        //full time employees
        if (!isValidNumber(personnel.FT_EMPLOYEES)) {
            errors.FT_EMPLOYEES = "Full-time employees must be a valid number (≥ 0)";
        } else if (Number(personnel.FT_EMPLOYEES) > Number(personnel.TOTAL_EMPLOYEES)) {
            errors.FT_EMPLOYEES = "Full-time employees cannot exceed total employees";
        }

        //poc employees
        if (!isValidNumber(personnel.POC_EMPLOYEES)) {
            errors.POC_EMPLOYEES = "POC employees must be a valid number (≥ 0)";
        } else if (Number(personnel.POC_EMPLOYEES) > Number(personnel.TOTAL_EMPLOYEES)) {
            errors.POC_EMPLOYEES = "POC employees cannot exceed total employees";
        }

        //subcontractors
        if (!isValidNumber(personnel.SUBCONTRACT_NUM)) {
            errors.SUBCONTRACT_NUM = "Subcontractors must be a valid number (≥ 0)";
        } else if (Number(personnel.SUBCONTRACT_NUM) > Number(personnel.TOTAL_EMPLOYEES)) {
            errors.SUBCONTRACT_NUM = "Subcontractors cannot exceed total employees";
        }

        //fte subcontractors
        if (!isValidNumber(personnel.SUBCONTRACT_FTE)) {
            errors.SUBCONTRACT_FTE = "FTE subcontractors must be a valid number (≥ 0)";
        } else if (Number(personnel.SUBCONTRACT_FTE) > Number(personnel.SUBCONTRACT_NUM)) {
            errors.SUBCONTRACT_FTE = "FTE subcontractors cannot exceed total subcontractors";
        }

        //fte only employees
        if (!isValidNumber(personnel.FTE_ONLY_NUM)) {
            errors.FTE_ONLY_NUM = "FTE employees must be a valid number (≥ 0)";
        } else if (Number(personnel.FTE_ONLY_NUM) > Number(personnel.TOTAL_EMPLOYEES)) {
            errors.FTE_ONLY_NUM = "FTE employees cannot exceed total employees";
        }

    return errors;

}




export function validateAdminSupport(adminSupport) {
    const errors = {};

    const isValidNumber = (number) => {
        const num = Number(number);
        return Number.isFinite(num) && num >= 0;
    }

    // NR_EXEMPT - Required, non-negative
    if (!isValidNumber(adminSupport.NR_EXEMPT)) {
        errors.NR_EXEMPT = "NR Exempt must be a valid number (≥ 0)";
    }

     // NR_NONEXEMPT - Required, non-negative
     if (!isValidNumber(adminSupport.NR_NONEXEMPT)) {
        errors.NR_NONEXEMPT = "NR Non-Exempt must be a valid number (≥ 0)";
    }

     if(!isValidNumber(adminSupport.FTE_EXEMPT)){
        errors.FTE_EXEMPT = "FTE Exempt must be a valid number (≥ 0)";

     }

     if (!isValidNumber(adminSupport.FTE_NONEXEMPT)){
        errors.FTE_NONEXEMPT = "FTE Non-Exempt must be a valid number (≥ 0)";
     }

return errors;
}

export function validateForm(personnel, adminSupport) {
    const personnelErrors = validatePersonnel(personnel);
    const adminSupportErrors = validateAdminSupport(adminSupport);

    return {
        personnel: personnelErrors,
        adminSupport: adminSupportErrors,
        hasErrors: Object.keys(personnelErrors).length > 0 || Object.keys(adminSupportErrors).length > 0
    };
}
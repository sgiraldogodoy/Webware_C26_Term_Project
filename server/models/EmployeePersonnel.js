import mongoose from "mongoose";

const employeePersonnelSchema = new mongoose.Schema(
    {
        SCHOOL_ID: {
            type: Number,
            required: true,
            index: true
        },

        SCHOOL_YR_ID: {
            type: Number,
            required: true,
            index: true
        },

        EMP_CAT_CD: String,

        SUBCONTRACT_NUM: Number,
        SUBCONTRACT_FTE: Number,

        FTE_ONLY_NUM: Number,
        FTE_ONLY_SALARY_MIN: Number,
        FTE_ONLY_SALARY_MAX: Number,

        TOTAL_EMPLOYEES: Number,
        FT_EMPLOYEES: Number,
        POC_EMPLOYEES: Number,

        LOCK_ID: Number,
        UPDATE_USER_TX: String,
        UPDATE_DT: Date
    },
    { collection: "employeePersonnel" }
);

export default mongoose.model("EmployeePersonnel", employeePersonnelSchema, "employeePersonnel");
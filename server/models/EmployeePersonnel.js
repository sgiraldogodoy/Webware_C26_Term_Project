import mongoose from "mongoose";

const employeePersonnelSchema = new mongoose.Schema(
    {
        ID: {
            type: Number,
            required: true,
            index: true
        },

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

        EMP_CAT_CD: {
            type: String,
            required: true
        },

        SUBCONTRACT_NUM: Number,
        SUBCONTRACT_FTE: mongoose.Schema.Types.Decimal128,

        FTE_ONLY_NUM: Number,
        FTE_ONLY_SALARY_MIN: mongoose.Schema.Types.Decimal128,
        FTE_ONLY_SALARY_MAX: mongoose.Schema.Types.Decimal128,

        TOTAL_EMPLOYEES: Number,
        FT_EMPLOYEES: mongoose.Schema.Types.Decimal128,
        POC_EMPLOYEES: Number,

        LOCK_ID: Number,
        UPDATE_USER_TX: String,
        UPDATE_DT: Date
    },
    { collection: "employeePersonnel" }
);

export default mongoose.model("EmployeePersonnel", employeePersonnelSchema, "employeePersonnel");
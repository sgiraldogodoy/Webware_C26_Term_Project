import mongoose from "mongoose";

const employeeAdminSupportSchema = new mongoose.Schema(
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

        ADMIN_STAFF_FUNC_CD: {
            type: String,
            required: true
        },

        NR_EXEMPT: Number,
        NR_NONEXEMPT: Number,

        FTE_EXEMPT: mongoose.Schema.Types.Decimal128,
        FTE_NONEXEMPT: mongoose.Schema.Types.Decimal128,

        LOCK_ID: Number,
        UPDATE_USER_TX: String,
        UPDATE_DT: Date
    },
    { collection: "employeeAdminSupport" }
);

export default mongoose.model("EmployeeAdminSupport", employeeAdminSupportSchema, "employeeAdminSupport");
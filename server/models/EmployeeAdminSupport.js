import mongoose from "mongoose";

const employeeAdminSupportSchema = new mongoose.Schema(
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

        ADMIN_STAFF_FUNC_CD: String,

        NR_EXEMPT: Number,
        NR_NONEXEMPT: Number,

        FTE_EXEMPT: Number,
        FTE_NONEXEMPT: Number,

        LOCK_ID: Number,
        UPDATE_USER_TX: String,
        UPDATE_DT: Date
    },
    { collection: "employeeAdminSupport" }
);

export default mongoose.model("EmployeeAdminSupport", employeeAdminSupportSchema, "employeeAdminSupport");
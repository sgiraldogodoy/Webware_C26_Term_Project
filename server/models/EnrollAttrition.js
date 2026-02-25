import mongoose from "mongoose";

const enrollAttritionSchema = new mongoose.Schema(
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

        STUDENTS_ADDED_DURING_YEAR: Number,
        STUDENTS_GRADUATED: Number,
        EXCH_STUD_REPTS: Number,
        STUD_DISS_WTHD: Number,
        STUD_NOT_INV: Number,
        STUD_NOT_RETURN: Number,

        GRADE_DEF_ID: Number,

        LOCK_ID: Number,
        UPDATE_USER_TX: String,
        UPDATE_DT: Date
    },
    { collection: "enrollAttrition" }
);

export default mongoose.model("EnrollAttrition", enrollAttritionSchema);
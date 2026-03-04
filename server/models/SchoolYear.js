import mongoose from "mongoose";

const schoolYearSchema = new mongoose.Schema(
    {
        ID: {type: Number, required: true, unique: true, index: true},
        SCHOOL_YEAR: Number,
        CURRENT_YEAR_IN: String,
        PRIOR_YEAR_IN: String,
    },
    {collection: "schoolYear"}
);

export default mongoose.model("SchoolYear", schoolYearSchema, "schoolYear");
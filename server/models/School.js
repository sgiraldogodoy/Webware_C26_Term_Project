import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
    {
        NAME_TX: String,
        GENDER_COMPOSITION_CD: String,
        GROUP_CD: String,
        REGION_CD: String,
        ACTIVE_INT: String,
    },
    { collection: "school" }
);

export default mongoose.model("School", schoolSchema);
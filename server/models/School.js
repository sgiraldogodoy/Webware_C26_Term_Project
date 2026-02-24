import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
    {
        ID: {type: Number, required: true, unique: true, index: true},
        NAME_TX: String,
        GENDER_COMPOSITION_CD: String,
        GROUP_CD: String,
        REGION_CD: String,
        ACTIVE_INT: String,
    },
    {collection: "school"}
);

export default mongoose.model("School", schoolSchema);
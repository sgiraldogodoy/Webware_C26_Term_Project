import mongoose from "mongoose";

const refCodeSchema = new mongoose.Schema(
    {
        DOMAIN_CD: String,
        CODE_CD: String,
        DESCRIPTION_TX: String,
    },
    { collection: "refCode" }
);

export default mongoose.model("RefCode", refCodeSchema, "refCode");
import mongoose from "mongoose";
const peerGroupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },

        criteria: {
            region: String,
            groupCode: String,
            gender: String
        },

        schoolIds: [Number]
    },
    { collection: "peergroups" }
);

export default mongoose.model("PeerGroup", peerGroupSchema, "peergroups");
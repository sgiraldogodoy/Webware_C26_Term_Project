import mongoose from "mongoose";

const peerGroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        region: {
            type: String
        },

        groupCode: {
            type: String
        },

        gender: {
            type: String
        },

        schoolIds: [
            {
                type: Number
            }
        ]
    },
    { collection: "peergroups", timestamps: true }
);

export default mongoose.model("PeerGroup", peerGroupSchema, "peergroups");

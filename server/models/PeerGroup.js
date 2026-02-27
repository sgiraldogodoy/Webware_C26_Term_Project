import mongoose from "mongoose";

const peerGroupSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  schoolIds: [
    {
      type: Number
    }
  ]
},
{ collection: "peergroups", timestamps: true }
);

export default mongoose.model("PeerGroup", peerGroupSchema);
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String, // we'll hash later
    role: { type: String, enum: ["SCHOOL", "ADMIN"], required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null }
});

export default mongoose.model("User", userSchema);
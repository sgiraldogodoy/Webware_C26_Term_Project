import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3,
            maxlength: 20
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["SCHOOL", "ADMIN"],
            required: true
        },
        schoolId: {
            type: Number,
            default: null
        }
    },
    { timestamps: true }
);


export default mongoose.model("User", userSchema);
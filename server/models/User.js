import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            default: null
        }
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});

export default mongoose.model("User", userSchema);
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        schoolId: {
            type: Number,
            required: true,
            index: true
        },

        yearId: {
            type: Number,
            required: true,
            index: true
        },

        category: {
            type: String,
            required: true
        },

        metricKey: {
            type: String,
            required: true
        },

        metricValue: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["draft", "submitted"],
            default: "draft"
        },

        submittedAt: Date
    },
    { collection: "submissions", timestamps: true }
);

export default mongoose.model("Submission", submissionSchema, "submissions");

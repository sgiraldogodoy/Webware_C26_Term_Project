import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
    {
        schoolId: { type: String, required: true, index: true },
        year: { type: Number, required: true, index: true },
        status: { type: String, enum: ["draft", "submitted"], default: "submitted" },
        values: { type: Object, default: {} }, // metricKey -> number
    },
    { timestamps: true }
);

SubmissionSchema.index({ schoolId: 1, year: 1 }, { unique: true });

export default mongoose.model("Submission", SubmissionSchema);
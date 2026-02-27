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

        status: {
            type: String,
            enum: ["draft", "submitted"],
            default: "draft"
        },

        submittedAt: Date,

        categories: [
            {
                name: String,
                metrics: [
                    {
                        key: String,
                        value: Number
                    }
                ]
            }
        ]
    },
    { collection: "submissions", timestamps: true }
);

export default mongoose.model("Submission", submissionSchema, "submissions");
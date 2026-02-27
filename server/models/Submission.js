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

    submittedAt: {
      type: Date
    }
  },
  { collection: "submissions", timestamps: true }
);

submissionSchema.index({ schoolId: 1, yearId: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);

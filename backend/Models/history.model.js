import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    // Connects this record to a specific user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    // The full conversation array (role: 'user'/'assistant', content: '...')
    transcript: {
      type: Array,
      required: true,
    },
    // The AI-generated analysis
    feedback: {
      score: { type: Number, default: 0},
      summary: { type: String },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const History = mongoose.model("History", historySchema);
export default History;
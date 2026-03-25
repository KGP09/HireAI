import mongoose from "mongoose";

const scoresSchema = new mongoose.Schema(
  {
    clarity: { type: Number, default: 0 },
    structure: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    conciseness: { type: Number, default: 0 },
  },
  { _id: false }
);

const speechPracticeSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Behavioral", "Technical Explanation", "Product Thinking", "Debate", "Random"],
      required: true,
    },
    transcript: {
      type: String,
      required: true,
    },
    scores: scoresSchema,
    fillerWords: [
      {
        word: { type: String },
        count: { type: Number, default: 0 },
      },
    ],
    duration: {
      type: Number,
      default: 0, // duration in seconds
    },
  },
  { timestamps: true }
);

const SpeechPracticeSession = mongoose.model(
  "SpeechPracticeSession",
  speechPracticeSessionSchema
);

export default SpeechPracticeSession;


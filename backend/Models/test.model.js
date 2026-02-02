import mongoose from "mongoose";

const qnASchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
});

const roundSchema = new mongoose.Schema({
  roundType: String,
  description: String,
  isScorable: Boolean,
  score: { type: Number, default: 0 },
  feedback: { type: String, default: "" },
  qnASchema: [qnASchema], // Array of questions
});

const testSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  testName: String,
  numberOfRounds: Number,
  rounds: [roundSchema], // This is what the frontend .find() looks for!
}, { timestamps: true });

const Test = mongoose.model("Test", testSchema);
export default Test;
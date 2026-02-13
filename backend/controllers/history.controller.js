import History from "../Models/history.model";

export const saveInterviewSession = async (req, res) => {
  try {
    const { transcript, feedback, jobDescription } = req.body;
    const userId = req.user._id; // Taken from your protectRoute middleware

    const newHistory = new History({
      userId,
      jobDescription,
      transcript,
      feedback
    });

    await newHistory.save();
    res.status(201).json({ message: "History saved successfully", data: newHistory });
  } catch (error) {
    console.error("Save History Error:", error);
    res.status(500).json({ message: "Failed to save history" });
  }
};

export const getMyHistory = async (req, res) => {
  try {
    // Find all history records where userId matches the logged-in user
    const history = await History.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
};
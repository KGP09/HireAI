import User from "../models/user.model.js";
export const getTests = async (req, res) => {
  try {
    console.log("r", req.body);
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Invalid Request" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const tests = user.tests;
    res.status(200).json(tests);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRounds = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Invalid Request" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const tests = user.tests;
    if (!tests || tests.length === 0) {
      return res.status(404).json({ message: "No tests found for this user" });
    }
    const rounds = tests.flatMap((test) => test.rounds);
    if (!rounds || rounds.length === 0) {
      return res.status(404).json({ message: "No rounds found for this user" });
    }
    res.status(200).json(rounds);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const evalTest = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      testIndex,
      roundIndex,
      roundType,
      questions,
      answers,
      score,
      feedback,
    } = req.body;
    const user = await User.findById(userId);
    const round = user.tests[testIndex].rounds[roundIndex];
    if (round.status === true) {
      return res.status(400).json({ message: "Round already completed" });
    }
    if (round.isScorable) {
      // if (roundType === "Aptitude Round") {
      //   score = 0;
      //   round.questions.forEach((q) => {
      //     if (answers[q._id] === q.correctAnswer) {
      //       score += 1;
      //     }
      //   });
      // }
      // if (roundType === "DSA Round") {
      //   score = Object.values(answers).filter((v) => v === true).length;
      // }
      round.score = score;
    } else {
      if (roundType === "Telephonic Round") {
        const aiResponse = await axios.post(
          "http://ai-backend/evaluate-telephonic",
          { questions, answers },
        );

        feedback = aiResponse.data.feedback;
        round.feedback = feedback;
      }
    }

    round.status = true;
    await user.save();

    res.json({
      success: true,
      score,
      feedback,
    });
  } catch (error) {
    console.log("eval test controller", error);
  }
};
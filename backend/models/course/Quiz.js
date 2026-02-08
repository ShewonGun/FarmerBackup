import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    title: { type: String, required: true },
    passingScore: { type: Number, default: 70 },
    createdAt: { type: Date, default: Date.now }
});

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
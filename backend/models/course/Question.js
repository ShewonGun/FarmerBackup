import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    questionText: { type: String, required: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.model("Question", questionSchema);

export default Question;

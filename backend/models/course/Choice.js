import mongoose from "mongoose";

const choiceSchema = new mongoose.Schema({
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    choiceText: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Choice = mongoose.model("Choice", choiceSchema);

export default Choice;

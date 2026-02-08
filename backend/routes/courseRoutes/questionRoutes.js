import express from "express";
import {
    addQuestion,
    getQuestionsByQuiz,
    updateQuestion,
    deleteQuestion
} from "../../controllers/courseControllers/questionController.js";

const router = express.Router();

// Question routes
router.post("/quiz/:quizId/question", addQuestion);
router.get("/quiz/:quizId/questions", getQuestionsByQuiz);
router.put("/question/:id", updateQuestion);
router.delete("/question/:id", deleteQuestion);

export default router;

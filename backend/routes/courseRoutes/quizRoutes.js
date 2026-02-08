import { addQuiz, getQuizByLesson, updateQuiz, deleteQuiz } from "../../controllers/courseControllers/quizController.js";
import express from "express";

const router = express.Router();

// Quiz routes
router.post("/lessons/:lessonId/quiz", addQuiz);
router.get("/lessons/:lessonId/quiz", getQuizByLesson);
router.put("/quiz/:id", updateQuiz);
router.delete("/quiz/:id", deleteQuiz);

export default router;
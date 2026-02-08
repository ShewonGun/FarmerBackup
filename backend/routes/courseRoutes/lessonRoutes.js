import express from "express";
import {
    addLesson,
    getLessonsByCourse,
    getLessonById,
    updateLesson,
    deleteLesson
} from "../../controllers/courseControllers/lessonController.js";

const router = express.Router();

// Lesson routes
router.get("/course/:courseId/lessons", getLessonsByCourse);
router.post("/course/:courseId/lessons", addLesson);
router.get("/lessons/:id", getLessonById);
router.put("/lessons/:id", updateLesson);
router.delete("/lessons/:id", deleteLesson);

export default router;



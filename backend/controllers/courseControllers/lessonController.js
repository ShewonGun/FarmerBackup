import Course from "../../models/course/Course.js";
import Lesson from "../../models/course/Lesson.js";
import mongoose from "mongoose";

//Add lesson to a course
export const addLesson = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, content, assetUrl } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID" });
        }
        
        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required" });
        }
        
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        
        const lesson = new Lesson({
            course: courseId,
            title,
            content,
            assetUrl
        });
        await lesson.save();
        
        course.noOfLessons += 1;
        await course.save();
        
        res.status(201).json({ success: true, lesson });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get lessons for a course
export const getLessonsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID" });
        }
        
        const lessons = await Lesson.find({ course: courseId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, lessons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single lesson by ID
export const getLessonById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid lesson ID" });
        }
        
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }
        res.status(200).json({ success: true, lesson });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}; 

// Update a lesson
export const updateLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, assetUrl } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid lesson ID" });
        }
        
        const lesson = await Lesson.findByIdAndUpdate(
            id,
            { title, content, assetUrl },
            { new: true, runValidators: true }
        );
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }
        res.status(200).json({ success: true, lesson });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a lesson
export const deleteLesson = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid lesson ID" });
        }
        
        const lesson = await Lesson.findByIdAndDelete(id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }
        // Decrement the lesson count in the course
        const course = await Course.findByIdAndUpdate(lesson.course, { $inc: { noOfLessons: -1 } });
        if (!course) {
            console.error(`Course ${lesson.course} not found when deleting lesson ${id}`);
        }
        res.status(200).json({ success: true, message: "Lesson deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

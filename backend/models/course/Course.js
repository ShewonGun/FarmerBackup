import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String },
    enrollmentCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    noOfLessons: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
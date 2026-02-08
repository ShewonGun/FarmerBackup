import Quiz from "../../models/course/Quiz.js";
import Question from "../../models/course/Question.js";
import Choice from "../../models/course/Choice.js";
import Lesson from "../../models/course/Lesson.js";
import mongoose from "mongoose";

// Add a new quiz to a lesson with questions and choices
export const addQuiz = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { title, passingScore, timeLimit, questions } = req.body;
        
        // Validate lessonId
        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({ success: false, message: "Invalid lesson ID" });
        }
        
        // Validate required fields
        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }
        
        // Validate questions array
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ success: false, message: "At least one question is required" });
        }
        
        // Check if lesson exists
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Lesson not found" });
        }
        
        // Create quiz
        const quiz = new Quiz({
            lesson: lessonId,
            title,
            passingScore: passingScore || 70,
            timeLimit
        });
        await quiz.save();
        
        // Create questions and choices
        const createdQuestions = [];
        
        for (let i = 0; i < questions.length; i++) {
            const questionData = questions[i];
            
            // Validate question
            if (!questionData.questionText) {
                await Quiz.findByIdAndDelete(quiz._id); // Rollback quiz creation
                return res.status(400).json({ 
                    success: false, 
                    message: `Question ${i + 1}: questionText is required` 
                });
            }
            
            if (!questionData.choices || !Array.isArray(questionData.choices) || questionData.choices.length < 2) {
                await Quiz.findByIdAndDelete(quiz._id);
                return res.status(400).json({ 
                    success: false, 
                    message: `Question ${i + 1}: At least 2 choices are required` 
                });
            }
            
            // Check if at least one choice is correct
            const hasCorrectAnswer = questionData.choices.some(choice => choice.isCorrect === true);
            if (!hasCorrectAnswer) {
                await Quiz.findByIdAndDelete(quiz._id);
                return res.status(400).json({ 
                    success: false, 
                    message: `Question ${i + 1}: At least one choice must be marked as correct` 
                });
            }
            
            // Create question
            const question = new Question({
                quiz: quiz._id,
                questionText: questionData.questionText,
                order: questionData.order || i + 1
            });
            await question.save();
            
            // Create choices for this question
            const createdChoices = [];
            for (let j = 0; j < questionData.choices.length; j++) {
                const choiceData = questionData.choices[j];
                
                if (!choiceData.choiceText) {
                    await Quiz.findByIdAndDelete(quiz._id);
                    return res.status(400).json({ 
                        success: false, 
                        message: `Question ${i + 1}, Choice ${j + 1}: choiceText is required` 
                    });
                }
                
                const choice = new Choice({
                    question: question._id,
                    choiceText: choiceData.choiceText,
                    isCorrect: choiceData.isCorrect || false,
                    order: choiceData.order || j + 1
                });
                await choice.save();
                createdChoices.push(choice);
            }
            
            createdQuestions.push({
                ...question.toObject(),
                choices: createdChoices
            });
        }
        
        lesson.isQuizAvailable = true;
        await lesson.save();
        
        res.status(201).json({ 
            success: true, 
            quiz: {
                ...quiz.toObject(),
                questions: createdQuestions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get quiz details for a lesson
export const getQuizByLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        
        // Validate lessonId
        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({ success: false, message: "Invalid lesson ID" });
        }
        
        // Find quiz for the lesson
        const quiz = await Quiz.findOne({ lesson: lessonId });
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found for this lesson" });
        }
        
        // Find all questions for this quiz
        const questions = await Question.find({ quiz: quiz._id }).sort({ order: 1 });
        
        // For each question, find all choices
        const questionsWithChoices = await Promise.all(
            questions.map(async (question) => {
                const choices = await Choice.find({ question: question._id }).sort({ order: 1 });
                return {
                    ...question.toObject(),
                    choices
                };
            })
        );
        
        res.status(200).json({
            success: true,
            quiz: {
                ...quiz.toObject(),
                questions: questionsWithChoices
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update quiz
export const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, passingScore, timeLimit, questions } = req.body;
        
        // Validate quizId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid quiz ID" });
        }
        
        // Find quiz
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // Update quiz basic info
        if (title) quiz.title = title;
        if (passingScore !== undefined) quiz.passingScore = passingScore;
        if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
        await quiz.save();
        
        // If questions are provided, update them
        if (questions && Array.isArray(questions)) {
            // Delete all old questions and their choices
            const oldQuestions = await Question.find({ quiz: id });
            for (const oldQuestion of oldQuestions) {
                await Choice.deleteMany({ question: oldQuestion._id });
            }
            await Question.deleteMany({ quiz: id });
            
            // Create new questions and choices
            const createdQuestions = [];
            
            for (let i = 0; i < questions.length; i++) {
                const questionData = questions[i];
                
                // Validate question
                if (!questionData.questionText) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Question ${i + 1}: questionText is required` 
                    });
                }
                
                if (!questionData.choices || !Array.isArray(questionData.choices) || questionData.choices.length < 2) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Question ${i + 1}: At least 2 choices are required` 
                    });
                }
                
                // Check if at least one choice is correct
                const hasCorrectAnswer = questionData.choices.some(choice => choice.isCorrect === true);
                if (!hasCorrectAnswer) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Question ${i + 1}: At least one choice must be marked as correct` 
                    });
                }
                
                // Create question
                const question = new Question({
                    quiz: id,
                    questionText: questionData.questionText,
                    order: questionData.order || i + 1
                });
                await question.save();
                
                // Create choices for this question
                const createdChoices = [];
                for (let j = 0; j < questionData.choices.length; j++) {
                    const choiceData = questionData.choices[j];
                    
                    if (!choiceData.choiceText) {
                        return res.status(400).json({ 
                            success: false, 
                            message: `Question ${i + 1}, Choice ${j + 1}: choiceText is required` 
                        });
                    }
                    
                    const choice = new Choice({
                        question: question._id,
                        choiceText: choiceData.choiceText,
                        isCorrect: choiceData.isCorrect || false,
                        order: choiceData.order || j + 1
                    });
                    await choice.save();
                    createdChoices.push(choice);
                }
                
                createdQuestions.push({
                    ...question.toObject(),
                    choices: createdChoices
                });
            }
            
            return res.status(200).json({
                success: true,
                message: "Quiz updated successfully",
                quiz: {
                    ...quiz.toObject(),
                    questions: createdQuestions
                }
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Quiz updated successfully",
            quiz
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate quizId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid quiz ID" });
        }
        
        // Find quiz
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // Find and delete all questions and their choices
        const questions = await Question.find({ quiz: id });
        for (const question of questions) {
            await Choice.deleteMany({ question: question._id });
        }
        await Question.deleteMany({ quiz: id });
        
        // Delete the quiz
        await Quiz.findByIdAndDelete(id);
        
        // Update lesson isQuizAvailable to false
        const lesson = await Lesson.findById(quiz.lesson);
        if (lesson) {
            lesson.isQuizAvailable = false;
            await lesson.save();
        }
        
        res.status(200).json({
            success: true,
            message: "Quiz deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

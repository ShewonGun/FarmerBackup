import Question from "../../models/course/Question.js";
import Quiz from "../../models/course/Quiz.js";
import mongoose from "mongoose";
import Choice from "../../models/course/Choice.js";

// Add a question to a quiz
export const addQuestion = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { questionText, choices, order } = req.body;
        
        // Validate quizId
        if (!mongoose.Types.ObjectId.isValid(quizId)) {
            return res.status(400).json({ success: false, message: "Invalid quiz ID" });
        }
        
        // Validate required fields
        if (!questionText) {
            return res.status(400).json({ success: false, message: "questionText is required" });
        }
        
        if (!choices || !Array.isArray(choices) || choices.length < 2) {
            return res.status(400).json({ success: false, message: "At least 2 choices are required" });
        }
        
        // Check if at least one choice is correct
        const hasCorrectAnswer = choices.some(choice => choice.isCorrect === true);
        if (!hasCorrectAnswer) {
            return res.status(400).json({ success: false, message: "At least one choice must be marked as correct" });
        }
        
        // Check if quiz exists
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // Get the next order number if not provided
        let questionOrder = order;
        if (!questionOrder) {
            const lastQuestion = await Question.findOne({ quiz: quizId }).sort({ order: -1 });
            questionOrder = lastQuestion ? lastQuestion.order + 1 : 1;
        }
        
        // Create question
        const question = new Question({
            quiz: quizId,
            questionText,
            order: questionOrder
        });
        await question.save();
        
        // Create choices
        const createdChoices = [];
        for (let i = 0; i < choices.length; i++) {
            const choiceData = choices[i];
            
            if (!choiceData.choiceText) {
                await Question.findByIdAndDelete(question._id); // Rollback
                return res.status(400).json({ 
                    success: false, 
                    message: `Choice ${i + 1}: choiceText is required` 
                });
            }
            
            const choice = new Choice({
                question: question._id,
                choiceText: choiceData.choiceText,
                isCorrect: choiceData.isCorrect || false,
                order: choiceData.order || i + 1
            });
            await choice.save();
            createdChoices.push(choice);
        }
        
        res.status(201).json({
            success: true,
            question: {
                ...question.toObject(),
                choices: createdChoices
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all questions for a quiz
export const getQuestionsByQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        // Validate quizId
        if (!mongoose.Types.ObjectId.isValid(quizId)) {
            return res.status(400).json({ success: false, message: "Invalid quiz ID" });
        }
        
        // Check if quiz exists
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // Find all questions for this quiz
        const questions = await Question.find({ quiz: quizId }).sort({ order: 1 });
        
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
            count: questionsWithChoices.length,
            questions: questionsWithChoices
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a question
export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionText, choices, order } = req.body;
        
        // Validate id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid question ID" });
        }
        
        // Find question
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }
        
        // Update question text and order
        if (questionText) question.questionText = questionText;
        if (order !== undefined) question.order = order;
        await question.save();
        
        // If choices are provided, update them
        if (choices && Array.isArray(choices)) {
            if (choices.length < 2) {
                return res.status(400).json({ success: false, message: "At least 2 choices are required" });
            }
            
            // Check if at least one choice is correct
            const hasCorrectAnswer = choices.some(choice => choice.isCorrect === true);
            if (!hasCorrectAnswer) {
                return res.status(400).json({ success: false, message: "At least one choice must be marked as correct" });
            }
            
            // Delete old choices
            await Choice.deleteMany({ question: id });
            
            // Create new choices
            const createdChoices = [];
            for (let i = 0; i < choices.length; i++) {
                const choiceData = choices[i];
                
                if (!choiceData.choiceText) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Choice ${i + 1}: choiceText is required` 
                    });
                }
                
                const choice = new Choice({
                    question: id,
                    choiceText: choiceData.choiceText,
                    isCorrect: choiceData.isCorrect || false,
                    order: choiceData.order || i + 1
                });
                await choice.save();
                createdChoices.push(choice);
            }
            
            return res.status(200).json({
                success: true,
                message: "Question updated successfully",
                question: {
                    ...question.toObject(),
                    choices: createdChoices
                }
            });
        }
        
        // If no choices provided, just return updated question with existing choices
        const existingChoices = await Choice.find({ question: id }).sort({ order: 1 });
        res.status(200).json({
            success: true,
            message: "Question updated successfully",
            question: {
                ...question.toObject(),
                choices: existingChoices
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a question
export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid question ID" });
        }
        
        // Find question
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }
        
        // Delete all choices for this question
        await Choice.deleteMany({ question: id });
        
        // Delete the question
        await Question.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: "Question deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

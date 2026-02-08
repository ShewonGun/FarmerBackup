import Certificate from "../../models/course/Certificate.js";
import Course from "../../models/course/Course.js";
import User from "../../models/user/User.js";
import Lesson from "../../models/course/Lesson.js";
import Quiz from "../../models/course/Quiz.js";
import Enroll from "../../models/course/Enroll.js";
import mongoose from "mongoose";
import puppeteer from "puppeteer";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";
import path from "path";

// Generate certificate HTML template
const generateCertificateHTML = (userName, courseName, completionDate, certificateNumber, averageScore) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                width: 1056px;
                height: 816px;
                font-family: 'Georgia', 'Times New Roman', serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            
            .certificate-container {
                width: 1000px;
                height: 750px;
                background: white;
                border: 20px solid #f0e68c;
                box-shadow: 
                    0 0 0 5px #d4af37,
                    0 20px 60px rgba(0, 0, 0, 0.3),
                    inset 0 0 40px rgba(212, 175, 55, 0.1);
                position: relative;
                padding: 60px 80px;
            }
            
            .certificate-header {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .certificate-title {
                font-size: 48px;
                color: #2c3e50;
                font-weight: bold;
                letter-spacing: 3px;
                text-transform: uppercase;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .certificate-subtitle {
                font-size: 20px;
                color: #7f8c8d;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            
            .certificate-body {
                text-align: center;
                margin: 50px 0;
            }
            
            .awarded-to {
                font-size: 18px;
                color: #7f8c8d;
                margin-bottom: 20px;
                letter-spacing: 1px;
            }
            
            .recipient-name {
                font-size: 56px;
                color: #2c3e50;
                font-weight: bold;
                margin: 20px 0;
                padding: 20px;
                border-bottom: 3px solid #d4af37;
                display: inline-block;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .achievement-text {
                font-size: 20px;
                color: #34495e;
                line-height: 1.8;
                margin: 30px auto;
                max-width: 700px;
            }
            
            .course-name {
                font-weight: bold;
                color: #667eea;
                font-size: 24px;
            }
            
            .score-section {
                margin: 30px 0;
                font-size: 18px;
                color: #27ae60;
                font-weight: bold;
            }
            
            .certificate-footer {
                display: flex;
                justify-content: space-between;
                margin-top: 60px;
                padding-top: 30px;
                border-top: 2px solid #ecf0f1;
            }
            
            .footer-item {
                text-align: center;
                flex: 1;
            }
            
            .footer-label {
                font-size: 14px;
                color: #7f8c8d;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
            }
            
            .footer-value {
                font-size: 18px;
                color: #2c3e50;
                font-weight: bold;
            }
            
            .signature-line {
                border-top: 2px solid #2c3e50;
                width: 200px;
                margin: 0 auto 10px;
            }
            
            .decorative-corner {
                position: absolute;
                width: 100px;
                height: 100px;
            }
            
            .top-left {
                top: 40px;
                left: 40px;
                border-top: 5px solid #d4af37;
                border-left: 5px solid #d4af37;
            }
            
            .top-right {
                top: 40px;
                right: 40px;
                border-top: 5px solid #d4af37;
                border-right: 5px solid #d4af37;
            }
            
            .bottom-left {
                bottom: 40px;
                left: 40px;
                border-bottom: 5px solid #d4af37;
                border-left: 5px solid #d4af37;
            }
            
            .bottom-right {
                bottom: 40px;
                right: 40px;
                border-bottom: 5px solid #d4af37;
                border-right: 5px solid #d4af37;
            }
            
            .seal {
                position: absolute;
                bottom: 60px;
                right: 100px;
                width: 100px;
                height: 100px;
                border: 5px solid #d4af37;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-size: 12px;
                font-weight: bold;
                text-align: center;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
        </style>
    </head>
    <body>
        <div class="certificate-container">
            <div class="decorative-corner top-left"></div>
            <div class="decorative-corner top-right"></div>
            <div class="decorative-corner bottom-left"></div>
            <div class="decorative-corner bottom-right"></div>
            
            <div class="certificate-header">
                <div class="certificate-title">Certificate</div>
                <div class="certificate-subtitle">Of Achievement</div>
            </div>
            
            <div class="certificate-body">
                <div class="awarded-to">This certificate is proudly presented to</div>
                
                <div class="recipient-name">${userName}</div>
                
                <div class="achievement-text">
                    For successfully completing the course
                    <br>
                    <span class="course-name">${courseName}</span>
                    <br>
                    with dedication and excellence
                </div>
                
                <div class="score-section">
                    Average Score: ${averageScore}%
                </div>
            </div>
            
            <div class="certificate-footer">
                <div class="footer-item">
                    <div class="footer-label">Certificate Number</div>
                    <div class="footer-value">${certificateNumber}</div>
                </div>
                
                <div class="footer-item">
                    <div class="footer-label">Completion Date</div>
                    <div class="footer-value">${new Date(completionDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</div>
                </div>
                
                <div class="footer-item">
                    <div class="signature-line"></div>
                    <div class="footer-label">Authorized Signature</div>
                </div>
            </div>
            
            <div class="seal">
                VERIFIED<br>CERTIFICATE
            </div>
        </div>
    </body>
    </html>
    `;
};

// Generate Certificate
export const generateCertificate = async (req, res) => {
    let browser;
    let tempFilePath;
    
    try {
        const { userId, courseId } = req.params;
        
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid user or course ID" });
        }
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        
        // Check if user is enrolled and get enrollment data
        const enrollment = await Enroll.findOne({ user: userId, course: courseId })
            .populate('completedLessons', 'title');
        if (!enrollment) {
            return res.status(404).json({ success: false, message: "User is not enrolled in this course" });
        }
        
        // Check if user has completed the course (optional validation)
        // You can uncomment this if you want to require course completion before certificate generation
        // if (enrollment.progress < 100) {
        //     return res.status(400).json({ 
        //         success: false, 
        //         message: "User has not completed the course yet",
        //         progress: enrollment.progress
        //     });
        // }
        
        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({ user: userId, course: courseId });
        if (existingCertificate) {
            return res.status(200).json({ 
                success: true, 
                message: "Certificate already exists",
                certificate: existingCertificate 
            });
        }
        
        // Get all lessons with quizzes in the course
        const lessonsWithQuizzes = await Lesson.find({ 
            course: courseId, 
            isQuizAvailable: true 
        });
        
        if (lessonsWithQuizzes.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "This course has no quizzes to complete" 
            });
        }
        
        // Get all quizzes for these lessons
        const quizzes = await Quiz.find({ 
            lesson: { $in: lessonsWithQuizzes.map(l => l._id) } 
        });
        
        // TODO: Check if user completed all quizzes with passing scores
        // This would require a QuizAttempt or QuizResult model to track user's quiz scores
        // For now, we'll assume the user completed all quizzes
        
        const averageScore = 85; // TODO: Calculate from quiz attempts
        const completionDate = new Date();
        
        // Generate unique certificate number
        const year = new Date().getFullYear();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const certificateNumber = `CERT-${year}-${random}`;
        
        // Generate HTML
        const html = generateCertificateHTML(
            user.name || user.username || "Student",
            course.title,
            completionDate,
            certificateNumber,
            averageScore
        );
        
        // Launch puppeteer and generate PDF
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        // Create temp directory if it doesn't exist
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Generate PDF to temp file
        tempFilePath = path.join(tempDir, `certificate-${certificateNumber}.pdf`);
        await page.pdf({
            path: tempFilePath,
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });
        
        await browser.close();
        browser = null;
        
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
            folder: 'certificates',
            resource_type: 'raw',
            public_id: certificateNumber,
            format: 'pdf'
        });
        
        // Delete temp file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        
        // Create certificate record
        const certificate = new Certificate({
            user: userId,
            course: courseId,
            certificateNumber,
            certificateUrl: uploadResult.secure_url,
            issueDate: new Date(),
            completionDate,
            averageScore
        });
        await certificate.save();
        
        res.status(201).json({
            success: true,
            message: "Certificate generated successfully",
            certificate
        });
        
    } catch (error) {
        // Cleanup
        if (browser) {
            await browser.close();
        }
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get certificate by user and course
export const getCertificate = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid user or course ID" });
        }
        
        const certificate = await Certificate.findOne({ user: userId, course: courseId })
            .populate('user', 'name username email')
            .populate('course', 'title');
        
        if (!certificate) {
            return res.status(404).json({ success: false, message: "Certificate not found" });
        }
        
        res.status(200).json({
            success: true,
            certificate
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all certificates for a user
export const getUserCertificates = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        
        const certificates = await Certificate.find({ user: userId })
            .populate('course', 'title description')
            .sort({ issueDate: -1 });
        
        res.status(200).json({
            success: true,
            count: certificates.length,
            certificates
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

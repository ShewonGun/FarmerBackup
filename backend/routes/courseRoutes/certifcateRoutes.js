import express from "express";
import {
    generateCertificate,
    getCertificate,
    getUserCertificates
} from "../../controllers/courseControllers/certificateController.js";

const router = express.Router();

// Certificate routes
router.post("/user/:userId/course/:courseId/certificate", generateCertificate);
router.get("/user/:userId/course/:courseId/certificate", getCertificate);
router.get("/user/:userId/certificates", getUserCertificates);

export default router;

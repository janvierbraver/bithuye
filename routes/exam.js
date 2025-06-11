import express from 'express';
import {
    createExam,
    getInstructorExams,
    getExamById,
    updateExam,
    deleteExam,
    createQuestion,
    getQuestionsByExamId,
    updateQuestion,
    deleteQuestion,
    getExamsForCourse,
    getExamForTaking, // <-- ADDED THIS IMPORT
    submitExam,
    getLatestExamAttemptForLearner,
    getExamAttemptDetails,
    getMyExamAttempts
} from '../controllers/examController.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Exam Routes ---
// Instructor-specific exams (e.g., for Instructor Dashboard)
router.route('/instructor').get(authenticateToken, authorizeRole(['instructor']), getInstructorExams);

// Get exams for a specific course (learner-facing)
router.route('/course/:courseId').get(authenticateToken, authorizeRole(['learner', 'instructor', 'admin']), getExamsForCourse);

// Exam creation (only instructors can create exams)
router.route('/').post(authenticateToken, authorizeRole(['instructor']), createExam);

// Get exam by ID, update, delete (instructor-specific)
router.route('/:id')
    .get(authenticateToken, authorizeRole(['instructor']), getExamById)
    .put(authenticateToken, authorizeRole(['instructor']), updateExam)
    .delete(authenticateToken, authorizeRole(['instructor']), deleteExam);


// --- Question Routes ---
// Get all questions for a specific exam (instructor-specific)
router.route('/questions/:examId').get(authenticateToken, authorizeRole(['instructor']), getQuestionsByExamId);

// Create a new question for an exam (instructor-specific)
router.route('/questions').post(authenticateToken, authorizeRole(['instructor']), createQuestion);

// Update and delete a specific question (instructor-specific)
router.route('/questions/:id')
    .put(authenticateToken, authorizeRole(['instructor']), updateQuestion)
    .delete(authenticateToken, authorizeRole(['instructor']), deleteQuestion);


// --- Learner Exam Taking & Submission Routes ---
// Get exam details for taking (learner-facing)
router.route('/:examId/take').get(authenticateToken, authorizeRole(['learner']), getExamForTaking);

// Submit an exam (learner-facing)
router.route('/:examId/submit').post(authenticateToken, authorizeRole(['learner']), submitExam);

// Get learner's latest attempt for a specific exam
router.route('/:examId/my-attempts').get(authenticateToken, authorizeRole(['learner']), getLatestExamAttemptForLearner);

// Get details of a specific exam attempt (for review)
router.route('/attempts/:attemptId').get(authenticateToken, authorizeRole(['learner']), getExamAttemptDetails);

// Get all exam attempts for the logged-in learner
router.route('/attempts/my-attempts').get(authenticateToken, authorizeRole(['learner']), getMyExamAttempts);


export default router;

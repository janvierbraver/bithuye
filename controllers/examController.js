    // D:\E learning\server\controllers\examController.js
    import { Exam } from '../models/Exam.js';
    import { Question } from '../models/Question.js';
    import { User } from '../models/User.js';
    import { Course } from '../models/courses.js'; // Corrected import
    import { ExamAttempt } from '../models/ExamAttempt.js';
    import path from 'path';
    import fs from 'fs';

    const getBaseUrl = (req) => {
        return `${req.protocol}://${req.get('host')}`;
    };

    // --- Instructor Exam Management ---
    export const getInstructorExams = async (req, res) => {
        try {
            const instructorId = req.user.id;
            const exams = await Exam.findAll({
                where: { instructorId },
                include: [{ model: Course, as: 'Course', attributes: ['title'] }]
            });
            res.status(200).json({ success: true, exams });
        } catch (error) {
            console.error('Error getting instructor exams:', error);
            res.status(500).json({ message: 'Failed to retrieve exams.' });
        }
    };

    export const getExamById = async (req, res) => {
        const { id } = req.params;
        const instructorId = req.user.id;
        try {
            const exam = await Exam.findOne({
                where: { id, instructorId },
                include: [{ model: User, as: 'Instructor', attributes: ['name', 'email'] }, { model: Course, as: 'Course', attributes: ['title'] }]
            });
            if (!exam) {
                return res.status(404).json({ message: 'Exam not found or you do not have permission.' });
            }
            res.status(200).json({ success: true, exam });
        } catch (error) {
            console.error('Error getting exam by ID:', error);
            res.status(500).json({ message: 'Failed to retrieve exam.' });
        }
    };

    export const createExam = async (req, res) => {
        const { title, description, durationMinutes, passingScore, courseId } = req.body;
        const instructorId = req.user.id;
        try {
            const newExam = await Exam.create({
                title,
                description,
                durationMinutes: parseInt(durationMinutes, 10),
                passingScore: parseInt(passingScore, 10),
                instructorId,
                courseId: courseId ? parseInt(courseId, 10) : null
            });
            res.status(201).json({ success: true, message: 'Exam created successfully!', exam: newExam });
        } catch (error) {
            console.error('Error creating exam:', error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ message: 'An exam with this title already exists.' });
            }
            res.status(500).json({ message: 'Failed to create exam.' });
        }
    };

    export const updateExam = async (req, res) => {
        const { id } = req.params;
        const { title, description, durationMinutes, passingScore, courseId } = req.body;
        const instructorId = req.user.id;
        try {
            const exam = await Exam.findOne({ where: { id, instructorId } });
            if (!exam) {
                return res.status(404).json({ message: 'Exam not found or you do not have permission.' });
            }
            await exam.update({
                title,
                description,
                durationMinutes: parseInt(durationMinutes, 10),
                passingScore: parseInt(passingScore, 10),
                courseId: courseId ? parseInt(courseId, 10) : null
            });
            res.status(200).json({ success: true, message: 'Exam updated successfully!', exam });
        } catch (error) {
            console.error('Error updating exam:', error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ message: 'An exam with this title already exists.' });
            }
            res.status(500).json({ message: 'Failed to update exam.' });
        }
    };

    export const deleteExam = async (req, res) => {
        const { id } = req.params;
        const instructorId = req.user.id;
        try {
            const exam = await Exam.findOne({ where: { id, instructorId } });
            if (!exam) {
                return res.status(404).json({ message: 'Exam not found or you do not have permission.' });
            }
            await exam.destroy();
            res.status(200).json({ success: true, message: 'Exam deleted successfully.' });
        } catch (error) {
            console.error('Error deleting exam:', error);
            res.status(500).json({ message: 'Failed to delete exam.' });
        }
    };

    // --- Question Management ---
    export const getQuestionsByExamId = async (req, res) => {
        const { examId } = req.params;
        const instructorId = req.user.id;
        try {
            const exam = await Exam.findOne({ where: { id: examId, instructorId } });
            if (!exam) {
                return res.status(404).json({ message: 'Exam not found or you do not have permission to view its questions.' });
            }

            const questions = await Question.findAll({
                where: { examId: examId },
                order: [['id', 'ASC']]
            });
            res.status(200).json({ success: true, questions });
        } catch (error) {
            console.error('Error getting questions by exam ID:', error);
            res.status(500).json({ message: 'Failed to retrieve questions.' });
        }
    };

    export const createQuestion = async (req, res) => {
        const { examId, questionText, questionType, options, correctAnswer, points } = req.body;
        const instructorId = req.user.id;

        try {
            const exam = await Exam.findOne({ where: { id: examId, instructorId } });
            if (!exam) {
                return res.status(403).json({ message: 'Permission denied. You can only add questions to your own exams.' });
            }

            const newQuestion = await Question.create({
                examId,
                questionText,
                questionType, // <--- This line sets the questionType
                options: questionType === 'multiple-choice' ? JSON.stringify(options) : null,
                correctAnswer,
                points: parseInt(points, 10)
            });
            res.status(201).json({ success: true, message: 'Question created successfully.', question: newQuestion });
        } catch (error) {
            console.error('Error creating question:', error);
            res.status(500).json({ message: 'Failed to create question.' });
        }
    };

    export const updateQuestion = async (req, res) => {
        const { id } = req.params;
        const { questionText, questionType, options, correctAnswer, points } = req.body;
        const instructorId = req.user.id;

        try {
            const question = await Question.findByPk(id, {
                include: [{ model: Exam, as: 'Exam', where: { instructorId } }]
            });

            if (!question) {
                return res.status(404).json({ message: 'Question not found or you do not have permission to update it.' });
            }

            await question.update({
                questionText,
                questionType, // <--- This line updates the questionType
                options: questionType === 'multiple-choice' ? JSON.stringify(options) : null,
                correctAnswer,
                points: parseInt(points, 10)
            });
            res.status(200).json({ success: true, message: 'Question updated successfully.', question });
        } catch (error) {
            console.error('Error updating question:', error);
            res.status(500).json({ message: 'Failed to update question.' });
        }
    };

    export const deleteQuestion = async (req, res) => {
        const { id } = req.params;
        const instructorId = req.user.id;

        try {
            const question = await Question.findByPk(id, {
                include: [{ model: Exam, as: 'Exam', where: { instructorId } }]
            });

            if (!question) {
                return res.status(404).json({ message: 'Question not found or you do not have permission to delete it.' });
            }

            await question.destroy();
            res.status(200).json({ success: true, message: 'Question deleted successfully.' });
        } catch (error) {
            console.error('Error deleting question:', error);
            res.status(500).json({ message: 'Failed to delete question.' });
        }
    };

    // --- Learner-Facing Exam Functions ---

    // GET /api/exams/course/:courseId
    export const getExamsForCourse = async (req, res) => {
        const { courseId } = req.params;
        console.log(`examController: getExamsForCourse called for courseId (string): ${courseId}`);
        const parsedCourseId = parseInt(courseId, 10);
        console.log(`examController: getExamsForCourse called for courseId (integer): ${parsedCourseId}`);

        if (isNaN(parsedCourseId)) {
            console.log('examController: Invalid Course ID provided for getExamsForCourse.');
            return res.status(400).json({ message: 'Invalid Course ID provided.' });
        }

        try {
            console.log(`examController: Querying for exams with courseId: ${parsedCourseId}`);

            const exams = await Exam.findAll({
                where: { courseId: parsedCourseId },
                attributes: ['id', 'title', 'description', 'durationMinutes', 'passingScore'],
                include: [{ model: User, as: 'Instructor', attributes: ['name'] }]
            });

            console.log(`examController: Found ${exams.length} exams for courseId: ${parsedCourseId}`);

            if (!exams || exams.length === 0) {
                console.log(`examController: No exams found for courseId ${parsedCourseId}. Sending 404.`);
                return res.status(404).json({ message: 'No exams found for this course.' });
            }
            res.status(200).json({ success: true, exams });
        } catch (error) {
            console.error('Error getting exams for course:', error);
            res.status(500).json({ message: 'Failed to retrieve exams for course.' });
        }
    };

    // GET /api/exams/:examId/take
    export const getExamForTaking = async (req, res) => {
        const { examId } = req.params;
        const parsedExamId = parseInt(examId, 10);
        if (isNaN(parsedExamId)) {
            return res.status(400).json({ message: 'Invalid Exam ID provided.' });
        }

        try {
            const exam = await Exam.findByPk(parsedExamId, {
                attributes: ['id', 'title', 'description', 'durationMinutes', 'passingScore'],
                include: [{
                    model: Question,
                    as: 'Questions',
                    attributes: ['id', 'questionText', 'questionType', 'options', 'points', 'correctAnswer'] // Also fetch correctAnswer for client-side display in results
                }, {
                    model: Course, // Include Course model to get Course title for Certificate
                    as: 'Course',
                    attributes: ['title']
                }]
            });

            if (!exam) {
                return res.status(404).json({ message: 'Exam not found.' });
            }

            // --- CRITICAL FIX: Parse options from JSON string to array for all questions ---
            // This ensures the frontend receives the options as an actual array.
            const questionsWithParsedOptions = exam.Questions.map(q => {
                let optionsData = q.options; // Get the raw options data
                let questionType = q.questionType; // Get the question type

                // Only attempt to parse if it's a multiple-choice question AND options is a non-empty string
                if (questionType === 'multiple-choice' && typeof optionsData === 'string' && optionsData.trim() !== '') {
                    try {
                        optionsData = JSON.parse(optionsData);
                    } catch (e) {
                        console.error(`ERROR: Failed to parse options JSON for question ${q.id} (exam ${exam.id}):`, optionsData, e);
                        // Fallback to null or an empty array if parsing fails
                        optionsData = null;
                    }
                } else if (questionType !== 'multiple-choice') {
                    // For non-multiple-choice questions, ensure optionsData is explicitly null
                    optionsData = null;
                }

                return {
                    ...q.toJSON(), // Convert Sequelize instance to plain JSON object
                    options: optionsData // Assign the potentially parsed (or null) options
                };
            });

            const examWithParsedQuestions = {
                ...exam.toJSON(), // Convert Sequelize instance to plain JSON object
                Questions: questionsWithParsedOptions // Assign the questions with parsed options
            };

            res.status(200).json({ success: true, exam: examWithParsedQuestions });
        } catch (error) {
            console.error('Error getting exam for taking:', error);
            res.status(500).json({ message: 'Failed to retrieve exam for taking.' });
        }
    };

    // POST /api/exams/:examId/submit
    export const submitExam = async (req, res) => {
        const { examId } = req.params;
        const { submittedAnswers } = req.body;
        const learnerId = req.user.id;
        const parsedExamId = parseInt(examId, 10);
        if (isNaN(parsedExamId)) {
            return res.status(400).json({ message: 'Invalid Exam ID provided.' });
        }

        try {
            const exam = await Exam.findByPk(parsedExamId, {
                include: [{
                    model: Question,
                    as: 'Questions',
                    attributes: ['id', 'correctAnswer', 'points']
                }, {
                    model: Course, // Include Course model to get Course title for Certificate
                    as: 'Course',
                    attributes: ['title']
                }]
            });

            if (!exam) {
                return res.status(404).json({ message: 'Exam not found.' });
            }

            let score = 0;
            // Calculate totalPossiblePoints from ALL questions in the exam
            let totalPossiblePoints = exam.Questions.reduce((sum, question) => sum + question.points, 0);

            const questionsMap = new Map(exam.Questions.map(q => [q.id, q]));

            for (const questionId in submittedAnswers) {
                const parsedQuestionId = parseInt(questionId, 10);
                // Only process answers for questions that actually exist in the exam
                if (questionsMap.has(parsedQuestionId)) {
                    const question = questionsMap.get(parsedQuestionId);

                    // IMPORTANT: Normalize answers before comparison (case-insensitive, trim whitespace)
                    const learnerAnswer = String(submittedAnswers[questionId] || '').toLowerCase().trim(); // Handle undefined/null submittedAnswer
                    const correctAnswer = String(question.correctAnswer || '').toLowerCase().trim(); // Handle undefined/null correctAnswer

                    if (learnerAnswer === correctAnswer) {
                        score += question.points;
                    }
                }
            }

            const percentageScore = totalPossiblePoints > 0 ? (score / totalPossiblePoints) * 100 : 0;
            const passed = percentageScore >= exam.passingScore;

            const newAttempt = await ExamAttempt.create({
                learnerId,
                examId: parsedExamId,
                score,
                percentageScore: parseFloat(percentageScore.toFixed(2)),
                passed,
                totalPointsPossible: totalPossiblePoints,
                submittedAnswers: JSON.stringify(submittedAnswers)
            });

            res.status(200).json({
                success: true,
                message: 'Exam submitted and marked successfully!',
                result: {
                    score,
                    percentageScore: parseFloat(percentageScore.toFixed(2)),
                    passed,
                    examTitle: exam.title,
                    passingScoreRequired: exam.passingScore
                },
                attemptId: newAttempt.id
            });

        } catch (error) {
            console.error('Error submitting exam:', error);
            res.status(500).json({ message: 'Failed to submit exam.' });
        }
    };

    // GET /api/exams/:examId/my-attempts
    export const getLatestExamAttemptForLearner = async (req, res) => {
        const { examId } = req.params;
        const learnerId = req.user.id;
        const parsedExamId = parseInt(examId, 10);
        if (isNaN(parsedExamId)) {
            return res.status(400).json({ message: 'Invalid Exam ID provided.' });
        }
        console.log(`examController: getLatestExamAttemptForLearner called for examId (integer): ${parsedExamId}, learnerId: ${learnerId}`);

        try {
            const latestAttempt = await ExamAttempt.findOne({
                where: { learnerId, examId: parsedExamId },
                order: [['attemptDate', 'DESC']],
                limit: 1
            });

            if (!latestAttempt) {
                console.log(`examController: No attempts found for examId ${parsedExamId} by learner ${learnerId}. Sending 404.`);
                return res.status(404).json({ message: 'No attempts found for this exam by this learner.' });
            }

            res.status(200).json({ success: true, latestAttempt });
        } catch (error) {
            console.error('Error fetching latest exam attempt:', error);
            res.status(500).json({ message: 'Failed to retrieve latest exam attempt.' });
        }
    };

    // GET /api/exams/attempts/my-attempts
    export const getMyExamAttempts = async (req, res) => {
        const learnerId = req.user.id;
        try {
            const attempts = await ExamAttempt.findAll({
                where: { learnerId },
                include: [
                    { model: Exam, as: 'Exam', attributes: ['title', 'description', 'durationMinutes', 'passingScore'] },
                    { model: User, as: 'Learner', attributes: ['name', 'email'] }
                ],
                order: [['attemptDate', 'DESC']]
            });
            res.status(200).json({ success: true, attempts });
        } catch (error) {
            console.error('Error fetching my exam attempts:', error);
            res.status(500).json({ message: 'Failed to retrieve your exam attempts.' });
        }
    };

    // GET /api/exams/attempts/:attemptId
    export const getExamAttemptDetails = async (req, res) => {
        const { attemptId } = req.params;
        const learnerId = req.user.id;
        const parsedAttemptId = parseInt(attemptId, 10);
        if (isNaN(parsedAttemptId)) {
            return res.status(400).json({ message: 'Invalid Attempt ID provided.' });
        }

        try {
            const attempt = await ExamAttempt.findOne({
                where: { id: parsedAttemptId, learnerId },
                include: [
                    {
                        model: Exam,
                        as: 'Exam',
                        attributes: ['id', 'title', 'description', 'durationMinutes', 'passingScore'],
                        include: [{
                            model: Question,
                            as: 'Questions',
                            attributes: ['id', 'questionText', 'questionType', 'options', 'correctAnswer', 'points']
                        }, {
                            model: Course, // Include Course model for certificate data
                            as: 'Course',
                            attributes: ['title']
                        }]
                    },
                    { model: User, as: 'Learner', attributes: ['name', 'email'] }
                ]
            });

            if (!attempt) {
                return res.status(404).json({ message: 'Exam attempt not found or you do not have permission.' });
            }

            // Parse options from JSON string to array for all questions in the attempt details
            const normalizedQuestions = attempt.Exam.Questions.map(q => {
                let optionsData = q.options;
                let questionType = q.questionType;

                if (questionType === 'multiple-choice' && typeof optionsData === 'string' && optionsData.trim() !== '') {
                    try {
                        optionsData = JSON.parse(optionsData);
                    } catch (e) {
                        console.error(`ERROR: Failed to parse options JSON for question ${q.id} in attempt details:`, optionsData, e);
                        optionsData = null;
                    }
                } else if (questionType !== 'multiple-choice') {
                    optionsData = null;
                }
                return {
                    ...q.toJSON(),
                    options: optionsData
                };
            });

            const parsedSubmittedAnswers = (typeof attempt.submittedAnswers === 'string' && attempt.submittedAnswers.trim() !== '')
                ? JSON.parse(attempt.submittedAnswers)
                : attempt.submittedAnswers;

            const attemptDetails = {
                ...attempt.toJSON(),
                submittedAnswers: parsedSubmittedAnswers,
                Exam: {
                    ...attempt.Exam.toJSON(),
                    Questions: normalizedQuestions
                }
            };

            res.status(200).json({ success: true, attempt: attemptDetails });
        } catch (error) {
            console.error('Error fetching exam attempt details:', error);
            res.status(500).json({ message: 'Failed to retrieve exam attempt details.' });
        }
    };
    
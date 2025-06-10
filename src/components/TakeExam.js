// client/src/components/TakeExam.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// --- Styling (moved outside the component to prevent re-creation on every render) ---
const pageStyle = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '40px auto',
    padding: '30px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'left'
};

const headerStyle = {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px'
};

const questionCardStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '5px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const optionStyle = {
    marginBottom: '8px'
};

const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    marginTop: '20px',
    marginRight: '10px',
    transition: 'background-color 0.3s ease'
};

const submitButton = {
    ...buttonStyle,
    backgroundColor: '#28a745'
};

const downloadCertButton = {
    ...buttonStyle,
    backgroundColor: '#17a2b8'
};

const backButton = {
    ...buttonStyle,
    backgroundColor: '#6c757d'
};

const resultSectionStyle = {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#e9f7ef',
    border: '1px solid #28a745',
    borderRadius: '8px',
    textAlign: 'center',
    animation: 'fadeIn 0.5s ease-out'
};

const resultScoreStyle = {
    fontSize: '2.5em',
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: '10px'
};

const resultStatusStyle = {
    fontSize: '1.5em',
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: '20px'
};

const answersSectionStyle = {
    marginTop: '20px',
    textAlign: 'left',
    borderTop: '1px dashed #ccc',
    paddingTop: '20px'
};

const answerQuestionStyle = {
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333'
};

const userAnswerStyle = {
    color: '#007bff',
    fontStyle: 'italic',
    marginBottom: '3px'
};

const correctAnswerStyle = {
    color: '#28a745',
    fontWeight: 'bold'
};

const wrongAnswerStyle = {
    color: '#dc3545',
    fontWeight: 'bold'
};
// --- END Styling ---


function TakeExam({ user, onLogout }) {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAnswers, setUserAnswers] = useState({}); // {questionId: "answer"}
    const [submissionStatus, setSubmissionStatus] = useState(null); // 'submitting', 'success', 'error'
    const [examResult, setExamResult] = useState(null); // Stores result after submission
    const [attemptDetails, setAttemptDetails] = useState(null); // Stores detailed attempt (submitted/correct answers)
    const [showResults, setShowResults] = useState(false); // To toggle between exam and results view

    useEffect(() => {
        const fetchExam = async () => {
            setLoading(true);
            setError(null);
            setSubmissionStatus(null);
            setExamResult(null);
            setAttemptDetails(null);
            setShowResults(false); // Reset state when examId changes

            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                onLogout();
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/api/exams/${examId}/take`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const fetchedExam = response.data.exam;

                // --- IMPORTANT DEBUGGING LOGS (keep for now, remove later) ---
                console.log("TakeExam: Fetched exam data:", fetchedExam);
                if (fetchedExam && fetchedExam.Questions) {
                    fetchedExam.Questions.forEach(q => {
                        console.log(`Question ID: ${q.id}, Type: ${q.questionType}, Options (raw from API):`, q.options);
                        console.log(`Options (type from API):`, typeof q.options);
                        // If 'options' is a string, it means backend didn't parse it for some reason
                        if (typeof q.options === 'string') {
                            try {
                                const parsed = JSON.parse(q.options);
                                console.log(`Options (parsed on frontend):`, parsed);
                                console.log(`Options (parsed type on frontend):`, typeof parsed);
                                // Optional: Update the question object directly in fetchedExam to use parsed options
                                // This would fix if backend parsing sometimes fails, but backend fix is better.
                                // q.options = parsed;
                            } catch (e) {
                                console.error(`FRONTEND ERROR: Failed to parse options for question ${q.id} on frontend:`, e);
                            }
                        }
                    });
                }
                // --- END DEBUGGING LOGS ---

                setExam(fetchedExam);
            } catch (err) {
                console.error('Error fetching exam:', err);
                setError(err.response?.data?.message || 'Failed to load exam.');
                if (err.response?.status === 401 || err.response?.status === 403) {
                    onLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        if (user && examId) {
            fetchExam();
        }
    }, [user, examId, onLogout]);

    const handleAnswerChange = (questionId, value) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmitExam = async () => {
        setSubmissionStatus('submitting');
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) { onLogout(); return; }

        try {
            const response = await axios.post(`http://localhost:5000/api/exams/${examId}/submit`, {
                submittedAnswers: userAnswers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSubmissionStatus('success');
            setExamResult(response.data.result);

            const attemptDetailsResponse = await axios.get(`http://localhost:5000/api/exams/attempts/${response.data.attemptId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttemptDetails(attemptDetailsResponse.data.attempt);

            setShowResults(true);

        } catch (err) {
            console.error('Error submitting exam:', err);
            setSubmissionStatus('error');
            setError(err.response?.data?.message || 'Failed to submit exam.');
            setShowResults(false);
        }
    };

    const handleDownloadCertificate = () => {
        if (!examResult || !exam || !user) return;

        navigate(`/learner/certificate/${exam.id}`, {
            state: {
                examTitle: exam.title,
                learnerName: user.name,
                score: examResult.percentageScore.toFixed(2),
                // Ensure course is available in attemptDetails for certificate
                courseTitle: attemptDetails?.Exam?.Course?.title || 'N/A'
            }
        });
    };

    if (loading) {
        return <div style={pageStyle}><p>Loading exam...</p></div>;
    }

    if (error) {
        return <div style={pageStyle}><p style={{ color: 'red' }}>Error: {error}</p></div>;
    }

    if (!exam) {
        return <div style={pageStyle}><p>Exam not found.</p></div>;
    }

    return (
        <div style={pageStyle}>
            {!showResults ? (
                // --- Exam Taking View ---
                <>
                    <h2 style={headerStyle}>{exam.title}</h2>
                    <p style={{ textAlign: 'center' }}>{exam.description}</p>
                    <p style={{ textAlign: 'center' }}>Duration: {exam.durationMinutes} minutes | Passing Score: {exam.passingScore}%</p>
                    <hr style={{ margin: '20px 0' }} />

                    {exam.Questions && exam.Questions.length > 0 ? (
                        exam.Questions.map(question => (
                            <div key={question.id} style={questionCardStyle}>
                                <p><strong>{question.questionText}</strong> ({question.points} points)</p>

                                {/* Conditional Rendering based on questionType */}
                                {question.questionType === 'multiple-choice' && (
                                    <div>
                                        {Array.isArray(question.options) && question.options.length > 0 ? (
                                            question.options.map((option, index) => (
                                                <div key={index} style={optionStyle}>
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name={`question-${question.id}`}
                                                            value={option}
                                                            checked={userAnswers[question.id] === option}
                                                            onChange={() => handleAnswerChange(question.id, option)}
                                                        />
                                                        {option}
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            // This warning is for MULTIPLE-CHOICE questions that have no valid options
                                            <p style={{color: 'orange'}}>Warning: Multiple-choice question has no options or invalid format.</p>
                                        )}
                                    </div>
                                )}
                                {/* Render textarea for 'text' (short-answer) questions */}
                                {question.questionType === 'text' && (
                                    <div>
                                        <textarea
                                            value={userAnswers[question.id] || ''}
                                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                            style={{ width: '100%', minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            placeholder="Your answer..."
                                        ></textarea>
                                    </div>
                                )}
                                {/* Render True/False radio buttons for 'true-false' questions */}
                                {question.questionType === 'true-false' && (
                                    <div>
                                        <div style={optionStyle}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value="True"
                                                    checked={userAnswers[question.id] === 'True'}
                                                    onChange={() => handleAnswerChange(question.id, 'True')}
                                                />
                                                True
                                            </label>
                                        </div>
                                        <div style={optionStyle}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value="False"
                                                    checked={userAnswers[question.id] === 'False'}
                                                    onChange={() => handleAnswerChange(question.id, 'False')}
                                                />
                                                False
                                            </label>
                                        </div>
                                    </div>
                                )}
                                {/* Add more question types here if needed (e.g., 'fill-in-the-blank') */}
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center' }}>No questions available for this exam yet.</p>
                    )}

                    {submissionStatus === 'submitting' && <p style={{ textAlign: 'center', color: '#007bff' }}>Submitting exam...</p>}
                    {submissionStatus === 'error' && <p style={{ textAlign: 'center', color: 'red' }}>Submission failed: {error}</p>}

                    <div style={{ textAlign: 'center' }}>
                        <button
                            onClick={handleSubmitExam}
                            disabled={submissionStatus === 'submitting'}
                            style={submitButton}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                        >
                            Submit Exam
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            style={backButton}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                        >
                            Back to Course
                        </button>
                    </div>
                </>
            ) : (
                // --- Exam Results View ---
                <div style={resultSectionStyle}>
                    <h2 style={headerStyle}>Exam Results: {exam.title}</h2>
                    {examResult && (
                        <>
                            <p style={resultScoreStyle}>Your Score: {examResult.percentageScore}%</p>
                            <p style={{ ...resultStatusStyle, color: examResult.passed ? '#28a745' : '#dc3545' }}>
                                {examResult.passed ? 'You Passed!' : 'You Did Not Pass.'}
                            </p>
                            <p>Passing Score: {exam.passingScore}%</p>

                            {/* Download Certificate Button */}
                            {examResult.passed && (
                                <button
                                    onClick={handleDownloadCertificate}
                                    style={downloadCertButton}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
                                >
                                    Download Certificate
                                </button>
                            )}
                            <button
                                onClick={() => navigate(`/learner/courses/${attemptDetails.Exam.courseId}`)}
                                style={backButton}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                            >
                                Go Back to Course Details
                            </button>
                        </>
                    )}

                    {attemptDetails && attemptDetails.Exam && attemptDetails.Exam.Questions && (
                        <div style={answersSectionStyle}>
                            <h3>Review Your Answers</h3>
                            {attemptDetails.Exam.Questions.map(question => {
                                const submittedAns = attemptDetails.submittedAnswers?.[question.id];
                                const correctAns = question.correctAnswer;
                                const isCorrect = String(submittedAns).toLowerCase().trim() === String(correctAns).toLowerCase().trim();

                                return (
                                    <div key={question.id} style={{ ...questionCardStyle, borderColor: isCorrect ? '#d4edda' : '#f8d7da' }}>
                                        <p style={answerQuestionStyle}>{question.questionText} ({question.points} points)</p>
                                        <p style={userAnswerStyle}>Your Answer: "{submittedAns || 'No Answer'}"</p>
                                        <p style={correctAnswerStyle}>Correct Answer: "{correctAns}"</p>
                                        <p style={isCorrect ? correctAnswerStyle : wrongAnswerStyle}>
                                            {isCorrect ? 'Status: Correct' : 'Status: Incorrect'}
                                        </p>
                                        {question.questionType === 'multiple-choice' && Array.isArray(question.options) && (
                                            <div>
                                                <strong>Options:</strong>
                                                <ul>
                                                    {question.options.map((option, idx) => (
                                                        <li key={idx} style={{
                                                            color: option === correctAns ? 'green' : (option === submittedAns && !isCorrect ? 'red' : 'inherit'),
                                                            fontWeight: option === correctAns ? 'bold' : 'normal'
                                                        }}>
                                                            {option}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {question.questionType === 'true-false' && (
                                            <div>
                                                <strong>Choices:</strong> True / False
                                            </div>
                                        )}
                                        {question.questionType === 'text' && (
                                            <div>
                                                {/* No options to display for text questions */}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TakeExam;
// client/src/components/LearnerCourseDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// --- Styling (moved outside the component to prevent re-creation on every render) ---
const detailStyle = {
    border: '1px solid #007bff',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '900px',
    margin: '40px auto',
    backgroundColor: '#f0f8ff',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'left'
};

const headerStyle = {
    color: '#0056b3',
    marginBottom: '20px'
};

const sectionStyle = {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#ffffff',
    borderRadius: '5px',
    border: '1px solid #eee'
};

const courseMaterialLinkStyle = {
    display: 'inline-block',
    marginTop: '10px',
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease'
};

const examCardStyle = {
    border: '1px solid #cce5ff',
    borderRadius: '5px',
    padding: '15px',
    marginBottom: '10px',
    backgroundColor: '#e0f2ff',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const buttonStyle = {
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'background-color 0.3s ease'
};

const backButton = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    marginBottom: '20px'
};

const takeExamButton = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    marginTop: '10px'
};

const viewResultsButton = {
    ...buttonStyle,
    backgroundColor: '#ffc107',
    color: '#333',
    marginTop: '10px'
};

const downloadCertificateButton = {
    ...buttonStyle,
    backgroundColor: '#17a2b8',
    marginTop: '10px'
};
// --- END Styling ---


function LearnerCourseDetail({ user, onLogout }) {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [exams, setExams] = useState([]);
    const [examAttempts, setExamAttempts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchCourseDetailsAndExams = async () => {
            setLoading(true);
            setError(null);
            setMessage('');
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                onLogout(); // Ensure onLogout is called if no token
                return;
            }

            console.log(`LearnerCourseDetail: Attempting to fetch details for courseId: ${courseId}`);

            try {
                // 1. Fetch course details
                const courseResponse = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourse(courseResponse.data.course);
                console.log(`LearnerCourseDetail: Successfully fetched course details for ID: ${courseId}`);


                // 2. Fetch exams for this course
                const examsResponse = await axios.get(`http://localhost:5000/api/exams/course/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const fetchedExams = examsResponse.data.exams;
                setExams(fetchedExams);
                console.log(`LearnerCourseDetail: Successfully fetched ${fetchedExams.length} exams for course ID: ${courseId}`);


                // 3. For each exam, fetch the learner's attempts (if any)
                const attemptsPromises = fetchedExams.map(async (exam) => {
                    try {
                        const attemptResponse = await axios.get(`http://localhost:5000/api/exams/${exam.id}/my-attempts`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log(`LearnerCourseDetail: Fetched attempt for exam ${exam.id}:`, attemptResponse.data.latestAttempt);
                        return { examId: exam.id, attempt: attemptResponse.data.latestAttempt || null };
                    } catch (attemptErr) {
                        if (attemptErr.response?.status === 404) {
                            console.log(`LearnerCourseDetail: No attempts found for exam ${exam.id} (404 response).`);
                            return { examId: exam.id, attempt: null };
                        }
                        console.error(`LearnerCourseDetail: Error fetching attempt for exam ${exam.id}:`, attemptErr);
                        return { examId: exam.id, attempt: null };
                    }
                });

                const results = await Promise.all(attemptsPromises);
                const newExamAttempts = {};
                results.forEach(item => {
                    newExamAttempts[item.examId] = item.attempt;
                });
                setExamAttempts(newExamAttempts);
                console.log(`LearnerCourseDetail: All exam attempt fetches completed. Final attempts state:`, newExamAttempts); // <-- NEW LOG

            } catch (err) {
                console.error('LearnerCourseDetail: Error fetching course details or exams:', err);
                setError(err.response?.data?.message || 'Failed to fetch course details or exams.');
                if (err.response?.status === 401 || err.response?.status === 403) {
                    onLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        if (user && courseId) {
            fetchCourseDetailsAndExams();
        }
    }, [user, courseId, onLogout]);

    const handleTakeExam = (examId) => {
        navigate(`/learner/exams/${examId}/take`);
    };

    const handleViewResults = (examId) => {
        // You might want to navigate to a dedicated results page, or re-use TakeExam component
        // for viewing results by passing an attemptId. For simplicity, we keep it as alert.
        alert('Viewing exam results functionality to be implemented! (Consider navigating to /learner/exams/:examId/results/:attemptId)');
    };

    const handleDownloadCertificate = (examId, examTitle, score, learnerName, courseTitle) => {
        navigate(`/learner/certificate/${examId}`, {
            state: {
                examTitle,
                learnerName,
                score,
                courseTitle // Pass the course title directly
            }
        });
    };

    return (
        <div style={detailStyle}>
            <button onClick={() => navigate(-1)} style={backButton}>← Back to My Courses</button>
            {loading && <p style={{ textAlign: 'center' }}>Loading course details...</p>}
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>Error: {error}</p>}
            {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red', textAlign: 'center', marginBottom: '15px' }}>{message}</p>}

            {course && (
                <>
                    <h2 style={headerStyle}>{course.title}</h2>
                    <p><strong>Description:</strong> {course.description}</p>
                    <p><strong>Price:</strong> ${parseFloat(course.price).toFixed(2)}</p>
                    {course.documentPath && (
                        <p>
                            <strong>Course Material:</strong>
                            <a
                                href={`http://localhost:5000/${course.documentPath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={courseMaterialLinkStyle}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                            >
                                View Document
                            </a>
                        </p>
                    )}
                    <p><strong>Instructor:</strong> {course.Instructor?.name || 'N/A'}</p>

                    <div style={sectionStyle}>
                        <h3>Available Exams for this Course</h3>
                        {!loading && exams.length > 0 ? (
                            exams.map(exam => {
                                const latestAttempt = examAttempts[exam.id];
                                // Log the attempt data to inspect it
                                console.log(`Exam ID: ${exam.id}, Latest Attempt:`, latestAttempt);

                                const hasAttempted = latestAttempt !== null;
                                // Ensure latestAttempt.passed is a boolean and exists
                                const passed = hasAttempted && latestAttempt && latestAttempt.passed === true;

                                return (
                                    <div key={exam.id} style={examCardStyle}>
                                        <h4>{exam.title}</h4>
                                        <p>{exam.description}</p>
                                        <p>Duration: {exam.durationMinutes} minutes | Passing Score: {exam.passingScore}%</p>
                                        {hasAttempted ? (
                                            <>
                                                <p style={{ fontWeight: 'bold', color: passed ? 'green' : 'red' }}>
                                                    Your Last Score: {latestAttempt.percentageScore ? latestAttempt.percentageScore.toFixed(2) : 'N/A'}% ({passed ? 'Passed' : 'Failed'})
                                                </p>
                                                <button
                                                    onClick={() => handleViewResults(exam.id)}
                                                    style={viewResultsButton}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0a800'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffc107'}
                                                >
                                                    View Results
                                                </button>
                                                {passed && ( // Only show if passed is true
                                                    <button
                                                        onClick={() => handleDownloadCertificate(exam.id, exam.title, latestAttempt.percentageScore.toFixed(2), user.name, course.title)}
                                                        style={downloadCertificateButton}
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
                                                    >
                                                        Download Certificate
                                                    </button>
                                                )}
                                                {!passed && ( // Show retake if not passed
                                                    <button
                                                        onClick={() => handleTakeExam(exam.id)}
                                                        style={takeExamButton}
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                                                    >
                                                        Retake Exam
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleTakeExam(exam.id)}
                                                style={takeExamButton}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                                            >
                                                Take Exam
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        ) : !loading && <p style={{ textAlign: 'center' }}>No exams available for this course yet.</p>}
                    </div>
                </>
            )}
        </div>
    );
}

export default LearnerCourseDetail;
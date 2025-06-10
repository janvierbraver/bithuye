import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InstructorQuestionForm from './InstructorQuestionForm'; // Import the InstructorQuestionForm

function ExamManagement({ user, onLogout }) {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    // State for exam form
    const [showExamForm, setShowExamForm] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [examTitle, setExamTitle] = useState('');
    const [examDescription, setExamDescription] = useState('');
    const [examDurationMinutes, setExamDurationMinutes] = useState('');
    const [examPassingScore, setExamPassingScore] = useState('');
    const [examCourseId, setExamCourseId] = useState(''); // To link exam to a course
    const [availableCourses, setAvailableCourses] = useState([]); // Courses for dropdown

    // State for question management
    const [managingQuestionsForExam, setManagingQuestionsForExam] = useState(null); // Stores the exam object whose questions are being managed
    const [questions, setQuestions] = useState([]);

    // State for question form (within managing questions view)
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    // --- Fetch Exams and Courses for Exam Creation ---
    useEffect(() => {
        const fetchExamsAndCourses = async () => {
            setLoading(true);
            setError(null);
            setMessage('');
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                onLogout();
                return;
            }

            try {
                // Fetch exams created by this instructor
                const examsResponse = await axios.get('http://localhost:5000/api/exams/instructor', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setExams(examsResponse.data.exams);

                // Fetch courses to populate the dropdown for linking exams
                const coursesResponse = await axios.get('http://localhost:5000/api/courses/my-courses', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAvailableCourses(coursesResponse.data.courses);

            } catch (err) {
                console.error('Error fetching exams or courses:', err);
                setError(err.response?.data?.message || 'Failed to fetch exams or courses.');
                if (err.response?.status === 401 || err.response?.status === 403) {
                    onLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchExamsAndCourses();
        }
    }, [user, onLogout]);


    // --- Fetch Questions for a specific exam when managingQuestionsForExam changes ---
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!managingQuestionsForExam) {
                setQuestions([]); // Clear questions if no exam is selected
                return;
            }

            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) { onLogout(); return; }

            try {
                const response = await axios.get(`http://localhost:5000/api/exams/questions/${managingQuestionsForExam.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // The backend examController.js is responsible for parsing options into an array here
                setQuestions(response.data.questions);
            } catch (err) {
                console.error('Error fetching questions:', err);
                setError(err.response?.data?.message || 'Failed to fetch questions.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [managingQuestionsForExam, onLogout]);


    // --- Exam Form Functions ---
    const handleAddExamClick = () => {
        setEditingExam(null);
        setExamTitle('');
        setExamDescription('');
        setExamDurationMinutes('');
        setExamPassingScore('');
        setExamCourseId(availableCourses.length > 0 ? availableCourses[0].id : ''); // Default to first course if available
        setShowExamForm(true);
        setMessage('');
    };

    const handleEditExamClick = (examToEdit) => {
        setEditingExam(examToEdit);
        setExamTitle(examToEdit.title);
        setExamDescription(examToEdit.description);
        setExamDurationMinutes(examToEdit.durationMinutes);
        setExamPassingScore(examToEdit.passingScore);
        setExamCourseId(examToEdit.courseId || (availableCourses.length > 0 ? availableCourses[0].id : ''));
        setShowExamForm(true);
        setMessage('');
    };

    const handleSubmitExamForm = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('token');
        if (!token) { onLogout(); return; }

        try {
            let response;
            const examData = {
                title: examTitle,
                description: examDescription,
                durationMinutes: parseInt(examDurationMinutes, 10),
                passingScore: parseInt(examPassingScore, 10),
                courseId: examCourseId || null, // Allow null if no course selected
                instructorId: user.id // Ensure instructorId is sent
            };

            if (editingExam) {
                response = await axios.put(`http://localhost:5000/api/exams/${editingExam.id}`, examData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Exam updated successfully!');
            } else {
                response = await axios.post('http://localhost:5000/api/exams', examData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Exam created successfully!');
            }
            console.log('Exam API response:', response.data);
            setShowExamForm(false);
            // Re-fetch exams to update the list
            const updatedExamsResponse = await axios.get('http://localhost:5000/api/exams/instructor', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExams(updatedExamsResponse.data.exams);
        } catch (err) {
            console.error('Error submitting exam form:', err);
            setMessage(err.response?.data?.message || 'Failed to save exam.');
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!window.confirm('Are you sure you want to delete this exam and all its questions? This action cannot be undone.')) return;
        setMessage('');
        const token = localStorage.getItem('token');
        if (!token) { onLogout(); return; }

        try {
            await axios.delete(`http://localhost:5000/api/exams/${examId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Exam deleted successfully!');
            setExams(exams.filter(e => e.id !== examId));
            // If the deleted exam was the one whose questions were being managed, clear that state
            if (managingQuestionsForExam && managingQuestionsForExam.id === examId) {
                setManagingQuestionsForExam(null);
                setQuestions([]);
            }
        } catch (err) {
            console.error('Error deleting exam:', err);
            setMessage(err.response?.data?.message || 'Failed to delete exam.');
        }
    };

    // --- Question Management Functions ---
    const handleManageQuestionsClick = (exam) => {
        setManagingQuestionsForExam(exam);
        setShowQuestionForm(false); // Hide question form when switching exams
        setEditingQuestion(null); // Clear any editing state for questions
    };

    const handleBackToExamsList = () => {
        setManagingQuestionsForExam(null);
        setQuestions([]);
        setShowQuestionForm(false);
        setEditingQuestion(null);
    };

    const handleAddQuestionClick = () => {
        setEditingQuestion(null); // Clear editing state for adding new
        setShowQuestionForm(true);
    };

    const handleEditQuestionClick = (question) => {
        setEditingQuestion(question);
        setShowQuestionForm(true);
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        setMessage('');
        const token = localStorage.getItem('token');
        if (!token) { onLogout(); return; }

        try {
            await axios.delete(`http://localhost:5000/api/exams/questions/${questionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Question deleted successfully!');
            // Update questions list immediately
            setQuestions(questions.filter(q => q.id !== questionId));
        } catch (err) {
            console.error('Error deleting question:', err);
            setMessage(err.response?.data?.message || 'Failed to delete question.');
        }
    };

    const handleQuestionFormSaveSuccess = () => {
        setShowQuestionForm(false);
        setEditingQuestion(null);
        // Re-fetch questions after save/update
        if (managingQuestionsForExam) {
            const token = localStorage.getItem('token');
            if (!token) { onLogout(); return; }
            axios.get(`http://localhost:5000/api/exams/questions/${managingQuestionsForExam.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => setQuestions(response.data.questions))
            .catch(err => {
                console.error('Error re-fetching questions after save:', err);
                setError('Failed to refresh questions after save.');
            });
        }
    };


    // --- Styling (shared with InstructorDashboard) ---
    const sectionStyle = {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '5px',
        border: '1px solid #eee'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '15px'
    };

    const thTdStyle = {
        border: '1px solid #ddd',
        padding: '8px',
        textAlign: 'left',
        verticalAlign: 'top'
    };

    const formGroupStyle = {
        marginBottom: '10px'
    };

    const inputStyle = {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd'
    };

    const formButtonStyle = {
        padding: '8px 15px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '10px'
    };

    const cancelButton = {
        ...formButtonStyle,
        backgroundColor: '#6c757d'
    };

    const deleteButton = {
        padding: '5px 10px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8em',
        marginLeft: '5px'
    };

    const editButton = {
        ...deleteButton,
        backgroundColor: '#ffc107',
        color: '#333',
    };

    const manageQuestionsButton = {
        ...formButtonStyle,
        backgroundColor: '#007bff'
    };


    // --- Render Logic ---
    return (
        <div style={sectionStyle}>
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>Error: {error}</p>}
            {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red', textAlign: 'center', marginBottom: '15px' }}>{message}</p>}
            {loading && <p style={{ textAlign: 'center' }}>Loading exams...</p>}

            {!managingQuestionsForExam ? ( // Show exams list if not managing questions for a specific exam
                <>
                    <h3>Exam Management</h3>
                    <button onClick={handleAddExamClick} style={formButtonStyle}>Add New Exam</button>

                    {showExamForm && (
                        <div style={{ ...sectionStyle, marginTop: '15px', border: '1px dashed #007bff' }}>
                            <h4>{editingExam ? 'Edit Exam' : 'Create New Exam'}</h4>
                            <form onSubmit={handleSubmitExamForm}>
                                <div style={formGroupStyle}>
                                    <label>Title:</label>
                                    <input type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} style={inputStyle} required />
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Description:</label>
                                    <textarea value={examDescription} onChange={(e) => setExamDescription(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} required></textarea>
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Duration (Minutes):</label>
                                    <input type="number" value={examDurationMinutes} onChange={(e) => setExamDurationMinutes(e.target.value)} style={inputStyle} min="1" required />
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Passing Score (%):</label>
                                    <input type="number" value={examPassingScore} onChange={(e) => setExamPassingScore(e.target.value)} style={inputStyle} min="0" max="100" required />
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Link to Course:</label>
                                    <select value={examCourseId} onChange={(e) => setExamCourseId(e.target.value)} style={inputStyle}>
                                        <option value="">No Course (Standalone)</option>
                                        {availableCourses.map(course => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" style={formButtonStyle}>{editingExam ? 'Update Exam' : 'Create Exam'}</button>
                                <button type="button" onClick={() => setShowExamForm(false)} style={cancelButton}>Cancel</button>
                            </form>
                        </div>
                    )}

                    {!loading && exams.length > 0 ? (
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thTdStyle}>ID</th>
                                    <th style={thTdStyle}>Title</th>
                                    <th style={thTdStyle}>Description</th>
                                    <th style={thTdStyle}>Duration</th>
                                    <th style={thTdStyle}>Pass Score</th>
                                    <th style={thTdStyle}>Course</th>
                                    <th style={thTdStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map(exam => (
                                    <tr key={exam.id}>
                                        <td style={thTdStyle}>{exam.id}</td>
                                        <td style={thTdStyle}>{exam.title}</td>
                                        <td style={thTdStyle}>{exam.description.substring(0, 50)}{exam.description.length > 50 ? '...' : ''}</td>
                                        <td style={thTdStyle}>{exam.durationMinutes} min</td>
                                        <td style={thTdStyle}>{exam.passingScore}%</td>
                                        <td style={thTdStyle}>{exam.Course?.title || 'Standalone'}</td>
                                        <td style={thTdStyle}>
                                            <button onClick={() => handleEditExamClick(exam)} style={editButton}>Edit</button>
                                            <button onClick={() => handleDeleteExam(exam.id)} style={deleteButton}>Delete</button>
                                            <button onClick={() => handleManageQuestionsClick(exam)} style={manageQuestionsButton}>Manage Questions</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : !loading && <p style={{ textAlign: 'center' }}>No exams found. Add one to get started!</p>}
                </>
            ) : ( // Show question management view
                <>
                    <button onClick={handleBackToExamsList} style={cancelButton}>← Back to Exams</button>
                    <h3 style={{ marginTop: '10px' }}>Manage Questions for: {managingQuestionsForExam.title}</h3>
                    <p>Description: {managingQuestionsForExam.description} | Duration: {managingQuestionsForExam.durationMinutes} min | Pass Score: {managingQuestionsForExam.passingScore}%</p>

                    <button onClick={handleAddQuestionClick} style={formButtonStyle}>Add New Question</button>

                    {showQuestionForm && (
                        <InstructorQuestionForm
                            examId={managingQuestionsForExam.id}
                            questionToEdit={editingQuestion}
                            onSaveSuccess={handleQuestionFormSaveSuccess}
                            onCancel={() => setShowQuestionForm(false)}
                            user={user}
                            onLogout={onLogout}
                        />
                    )}

                    {!loading && questions.length > 0 ? (
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thTdStyle}>ID</th>
                                    <th style={thTdStyle}>Question</th>
                                    <th style={thTdStyle}>Type</th>
                                    <th style={thTdStyle}>Options</th>
                                    <th style={thTdStyle}>Correct Answer</th>
                                    <th style={thTdStyle}>Points</th>
                                    <th style={thTdStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map(question => (
                                    <tr key={question.id}>
                                        <td style={thTdStyle}>{question.id}</td>
                                        <td style={thTdStyle}>{question.questionText}</td>
                                        <td style={thTdStyle}>{question.questionType}</td>
                                        {/* CRITICAL FIX: Conditionally render options for multiple-choice */}
                                        <td style={thTdStyle}>
                                            {question.questionType === 'multiple-choice' && Array.isArray(question.options)
                                                ? question.options.join(', ')
                                                : 'N/A'}
                                        </td>
                                        <td style={thTdStyle}>{question.correctAnswer}</td>
                                        <td style={thTdStyle}>{question.points}</td>
                                        <td style={thTdStyle}>
                                            <button onClick={() => handleEditQuestionClick(question)} style={editButton}>Edit</button>
                                            <button onClick={() => handleDeleteQuestion(question.id)} style={deleteButton}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : !loading && <p style={{ textAlign: 'center' }}>No questions found for this exam. Add some to get started!</p>}
                </>
            )}
        </div>
    );
}

export default ExamManagement;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function QuestionManagement({ user, onLogout }) {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState('multiple-choice');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [points, setPoints] = useState(1);

    useEffect(() => {
        const fetchExamAndQuestions = async () => {
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
                const examResponse = await axios.get(`http://localhost:5000/api/exams/${examId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setExam(examResponse.data.exam);
                console.log('Fetched exam details:', examResponse.data.exam);

                const questionsResponse = await axios.get(`http://localhost:5000/api/exams/${examId}/questions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // --- FIX START: Normalize options to be an array ---
                const normalizedQuestions = questionsResponse.data.questions.map(q => ({
                    ...q,
                    options: Array.isArray(q.options)
                        ? q.options // Already an array
                        : (typeof q.options === 'string' && q.options.trim() !== '')
                            ? JSON.parse(q.options) // Try parsing if it's a non-empty string
                            : [] // Default to empty array if null, undefined, or empty string
                }));
                setQuestions(normalizedQuestions);
                // --- FIX END ---

                console.log('Fetched and normalized questions:', normalizedQuestions);

            } catch (err) {
                console.error('Error fetching exam/questions:', err);
                setError(err.response?.data?.message || 'Failed to fetch exam or questions.');
                if (err.response?.status === 401 || err.response?.status === 403) {
                    onLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        if (user && examId) {
            fetchExamAndQuestions();
        }
    }, [user, examId, onLogout]);

    const handleAddQuestionClick = () => {
        setEditingQuestion(null);
        setQuestionText('');
        setQuestionType('multiple-choice');
        setOptions(['', '', '', '']);
        setCorrectAnswer('');
        setPoints(1);
        setShowQuestionForm(true);
        setMessage('');
    };

    const handleEditQuestionClick = (questionToEdit) => {
        setEditingQuestion(questionToEdit);
        setQuestionText(questionToEdit.questionText);
        setQuestionType(questionToEdit.questionType);
        // Ensure options are always an array when setting for editing
        setOptions(Array.isArray(questionToEdit.options) ? questionToEdit.options : ['', '', '', '']);
        setCorrectAnswer(questionToEdit.correctAnswer);
        setPoints(questionToEdit.points);
        setShowQuestionForm(true);
        setMessage('');
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmitQuestionForm = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('token');
        if (!token) { onLogout(); return; }

        try {
            let response;
            const questionData = {
                examId,
                questionText,
                questionType,
                // Ensure options are sent as an array or null based on type
                options: questionType === 'multiple-choice' ? options.filter(opt => opt.trim() !== '') : null,
                correctAnswer,
                points: parseInt(points, 10)
            };

            if (editingQuestion) {
                response = await axios.put(`http://localhost:5000/api/exams/questions/${editingQuestion.id}`, questionData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Question updated successfully!');
            } else {
                response = await axios.post('http://localhost:5000/api/exams/questions', questionData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Question created successfully!');
            }
            console.log('Question API response:', response.data);
            setShowQuestionForm(false);
            const updatedQuestionsResponse = await axios.get(`http://localhost:5000/api/exams/${examId}/questions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // --- FIX START: Normalize options again after re-fetching ---
            const reNormalizedQuestions = updatedQuestionsResponse.data.questions.map(q => ({
                ...q,
                options: Array.isArray(q.options)
                    ? q.options
                    : (typeof q.options === 'string' && q.options.trim() !== '')
                        ? JSON.parse(q.options)
                        : []
            }));
            setQuestions(reNormalizedQuestions);
            // --- FIX END ---
        } catch (err) {
            console.error('Error submitting question form:', err);
            setMessage(err.response?.data?.message || 'Failed to save question.');
        }
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
            setQuestions(questions.filter(q => q.id !== questionId));
        } catch (err) {
            console.error('Error deleting question:', err);
            setMessage(err.response?.data?.message || 'Failed to delete question.');
        }
    };

    // --- Styling (reusing some from InstructorDashboard for consistency) ---
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
        color: '#333'
    };

    const backButton = {
        padding: '8px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '15px'
    };

    return (
        <div style={sectionStyle}>
            <button onClick={() => navigate(-1)} style={backButton}>← Back to Exams</button>
            <h3>Manage Questions for: {exam?.title || 'Loading Exam...'}</h3>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
                Description: {exam?.description || 'N/A'} | Duration: {exam?.durationMinutes} min | Pass Score: {exam?.passingScore}%
            </p>
            <button onClick={handleAddQuestionClick} style={formButtonStyle}>Add New Question</button>

            {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red', textAlign: 'center', marginBottom: '15px' }}>{message}</p>}
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>Error: {error}</p>}
            {loading && <p style={{ textAlign: 'center' }}>Loading questions...</p>}

            {showQuestionForm && (
                <div style={{ ...sectionStyle, marginTop: '15px', border: '1px dashed #007bff' }}>
                    <h4>{editingQuestion ? 'Edit Question' : 'Create New Question'}</h4>
                    <form onSubmit={handleSubmitQuestionForm}>
                        <div style={formGroupStyle}>
                            <label>Question Text:</label>
                            <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} required></textarea>
                        </div>
                        <div style={formGroupStyle}>
                            <label>Question Type:</label>
                            <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} style={inputStyle} required>
                                <option value="multiple-choice">Multiple Choice</option>
                                <option value="true-false">True/False</option>
                                <option value="short-answer">Short Answer</option>
                            </select>
                        </div>

                        {questionType === 'multiple-choice' && (
                            <div style={formGroupStyle}>
                                <label>Options (4 options):</label>
                                {options.map((option, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        placeholder={`Option ${index + 1}`}
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        style={{ ...inputStyle, marginBottom: '5px' }}
                                        required
                                    />
                                ))}
                            </div>
                        )}

                        <div style={formGroupStyle}>
                            <label>Correct Answer:</label>
                            {questionType === 'multiple-choice' ? (
                                <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} style={inputStyle} required>
                                    <option value="">Select Correct Option</option>
                                    {options.filter(opt => opt.trim() !== '').map((opt, index) => (
                                        <option key={index} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : questionType === 'true-false' ? (
                                <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} style={inputStyle} required>
                                    <option value="">Select Correct Answer</option>
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            ) : ( // Short Answer
                                <input type="text" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} style={inputStyle} required />
                            )}
                        </div>
                        <div style={formGroupStyle}>
                            <label>Points:</label>
                            <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} style={inputStyle} required min="1" />
                        </div>
                        <button type="submit" style={formButtonStyle}>{editingQuestion ? 'Update Question' : 'Create Question'}</button>
                        <button type="button" onClick={() => setShowQuestionForm(false)} style={cancelButton}>Cancel</button>
                    </form>
                </div>
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
                        {questions.map(q => (
                            <tr key={q.id}>
                                <td style={thTdStyle}>{q.id}</td>
                                <td style={thTdStyle}>{q.questionText.substring(0, 70)}{q.questionText.length > 70 ? '...' : ''}</td>
                                <td style={thTdStyle}>{q.questionType}</td>
                                <td style={thTdStyle}>
                                    {/* --- FIX START: Ensure q.options is an array before mapping --- */}
                                    {Array.isArray(q.options) && q.options.length > 0 ? (
                                        <ul>
                                            {q.options.map((opt, idx) => <li key={idx}>{opt}</li>)}
                                        </ul>
                                    ) : 'N/A'}
                                    {/* --- FIX END --- */}
                                </td>
                                <td style={thTdStyle}>{q.correctAnswer}</td>
                                <td style={thTdStyle}>{q.points}</td>
                                <td style={thTdStyle}>
                                    <button onClick={() => handleEditQuestionClick(q)} style={editButton}>Edit</button>
                                    <button onClick={() => handleDeleteQuestion(q.id)} style={deleteButton}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : !loading && <p style={{ textAlign: 'center' }}>No questions found for this exam. Add one to get started!</p>}
        </div>
    );
}

export default QuestionManagement;
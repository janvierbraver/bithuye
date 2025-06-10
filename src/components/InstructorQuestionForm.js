import React, { useState, useEffect } from 'react';
import axios from 'axios';

function InstructorQuestionForm({ examId, questionToEdit, onSaveSuccess, onCancel, user, onLogout }) {
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState('multiple-choice'); // Default to multiple-choice
    const [optionsInput, setOptionsInput] = useState(''); // Raw string for multiple-choice options (e.g., "A, B, C")
    const [parsedOptions, setParsedOptions] = useState([]); // NEW: Array of parsed options for the select dropdown
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [points, setPoints] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (questionToEdit) {
            // Populate form if editing an existing question
            setQuestionText(questionToEdit.questionText);
            setQuestionType(questionToEdit.questionType);
            setCorrectAnswer(questionToEdit.correctAnswer);
            setPoints(questionToEdit.points);

            // If it's a multiple-choice question, set optionsInput from the parsed options array
            if (questionToEdit.questionType === 'multiple-choice' && Array.isArray(questionToEdit.options)) {
                const joinedOptions = questionToEdit.options.join(', ');
                setOptionsInput(joinedOptions);
                setParsedOptions(questionToEdit.options); // Set parsed options for dropdown
            } else {
                setOptionsInput(''); // Clear options for non-multiple-choice
                setParsedOptions([]); // Clear parsed options for non-multiple-choice
            }
        } else {
            // Reset form for new question
            setQuestionText('');
            setQuestionType('multiple-choice');
            setOptionsInput('');
            setParsedOptions([]); // Reset parsed options
            setCorrectAnswer('');
            setPoints(10);
        }
    }, [questionToEdit]);

    // NEW useEffect to update parsedOptions whenever optionsInput changes
    useEffect(() => {
        if (questionType === 'multiple-choice' && optionsInput.trim()) {
            const newParsedOptions = optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
            setParsedOptions(newParsedOptions);

            // If the current correctAnswer is no longer in the new options, clear it
            if (correctAnswer && !newParsedOptions.includes(correctAnswer)) {
                setCorrectAnswer('');
            }
        } else {
            setParsedOptions([]);
            // setCorrectAnswer(''); // Optionally clear correctAnswer if options are removed entirely
        }
    }, [optionsInput, questionType, correctAnswer]); // Depend on correctAnswer to avoid infinite loop on clearing

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage('');

        const token = localStorage.getItem('token');
        if (!token) {
            onLogout(); // Redirect to login if no token
            setLoading(false);
            return;
        }

        let optionsArray = null;
        if (questionType === 'multiple-choice') {
            if (!optionsInput.trim()) {
                setError('Multiple-choice questions require options.');
                setLoading(false);
                return;
            }
            optionsArray = optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
            if (optionsArray.length === 0) {
                 setError('Multiple-choice questions require at least one valid option.');
                 setLoading(false);
                 return;
            }
            // Ensure selected correctAnswer is among the options if it's multiple-choice
            if (!correctAnswer || !optionsArray.includes(correctAnswer)) {
                setError('For multiple-choice questions, the correct answer must be selected from the provided options.');
                setLoading(false);
                return;
            }
        }

        const questionData = {
            examId, // Passed as a prop to this form
            questionText,
            questionType,
            options: optionsArray, // This will be an array or null
            correctAnswer,
            points: parseInt(points, 10) // Ensure points is an integer
        };

        try {
            let response;
            if (questionToEdit) {
                // Update existing question
                response = await axios.put(`http://localhost:5000/api/exams/questions/${questionToEdit.id}`, questionData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Question updated successfully!');
            } else {
                // Create new question
                response = await axios.post('http://localhost:5000/api/exams/questions', questionData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Question created successfully!');
            }
            console.log('Question saved/updated:', response.data);
            onSaveSuccess(); // Callback to refresh question list in parent component
        } catch (err) {
            console.error('Error saving question:', err);
            setError(err.response?.data?.message || 'Failed to save question.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f0faff' }}>
            <h4>{questionToEdit ? 'Edit Question' : 'Add New Question'}</h4>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Question Text:</label>
                    <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    ></textarea>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Question Type:</label>
                    <select
                        value={questionType}
                        onChange={(e) => {
                            setQuestionType(e.target.value);
                            setOptionsInput(''); // Clear options when type changes
                            setParsedOptions([]); // Clear parsed options
                            setCorrectAnswer(''); // Clear correct answer (as format might change)
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                    >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="true-false">True/False</option>
                        <option value="text">Short Answer (Text)</option>
                    </select>
                </div>

                {questionType === 'multiple-choice' && (
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Options (comma-separated):</label>
                        <textarea
                            value={optionsInput}
                            onChange={(e) => setOptionsInput(e.target.value)}
                            placeholder="Option 1, Option 2, Option 3"
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }}
                            required={questionType === 'multiple-choice'}
                        ></textarea>
                    </div>
                )}

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Correct Answer:</label>
                    {questionType === 'multiple-choice' && (
                        <select
                            value={correctAnswer}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            required
                        >
                            <option value="">Select a correct option</option>
                            {parsedOptions.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                    )}
                    {questionType === 'true-false' && (
                        <select
                            value={correctAnswer}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            required
                        >
                            <option value="">Select</option>
                            <option value="True">True</option>
                            <option value="False">False</option>
                        </select>
                    )}
                    {questionType === 'text' && (
                        <input
                            type="text"
                            value={correctAnswer}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            placeholder="Enter short answer"
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            required
                        />
                    )}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Points:</label>
                    <input
                        type="number"
                        value={points}
                        onChange={(e) => setPoints(parseInt(e.target.value, 10))}
                        min="1"
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="submit" disabled={loading} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? 'Saving...' : (questionToEdit ? 'Update Question' : 'Add Question')}
                    </button>
                    <button type="button" onClick={onCancel} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default InstructorQuestionForm;

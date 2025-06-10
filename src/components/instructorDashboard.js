import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExamManagement from './ExamManagement'; // Ensure ExamManagement is correctly imported

function InstructorDashboard({ user, onLogout }) {
    // --- State Management ---
    const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'exams'
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(''); // For success/error messages after CRUD ops

    // Course Form States (for Add/Edit Course functionality)
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null); // Course object being edited
    const [courseTitle, setCourseTitle] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [coursePrice, setCoursePrice] = useState('');
    const [courseFile, setCourseFile] = useState(null); // State for the uploaded file

    // --- Fetch Instructor's Courses (now conditional on activeTab) ---
    useEffect(() => {
        const fetchInstructorData = async () => {
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
                if (activeTab === 'courses') {
                    const response = await axios.get('http://localhost:5000/api/courses/my-courses', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCourses(response.data.courses);
                }
                // Exam data will be fetched within ExamManagement component itself
            } catch (err) {
                console.error(`Error fetching ${activeTab} data:`, err);
                setError(err.response?.data?.message || `Failed to fetch your ${activeTab}.`);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    onLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchInstructorData();
        }
    }, [user, activeTab, onLogout]);

    // --- Course Management Functions (Existing) ---
    const handleAddCourseClick = () => {
        setEditingCourse(null);
        setCourseTitle('');
        setCourseDescription('');
        setCoursePrice('');
        setCourseFile(null);
        setShowCourseForm(true);
        setMessage('');
    };

    const handleEditCourseClick = (courseToEdit) => {
        setEditingCourse(courseToEdit);
        setCourseTitle(courseToEdit.title);
        setCourseDescription(courseToEdit.description);
        setCoursePrice(courseToEdit.price);
        setCourseFile(null); // Clear file input for edit, user can re-select
        setShowCourseForm(true);
        setMessage('');
    };

    const handleFileChange = (e) => {
        setCourseFile(e.target.files[0]);
    };

    const handleSubmitCourseForm = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('token');
        if (!token) { onLogout(); return; }

        // NEW: Client-side validation for price
        const parsedPrice = parseFloat(coursePrice);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            setMessage('Price must be a valid positive number.');
            return;
        }

        const formData = new FormData();
        formData.append('title', courseTitle);
        formData.append('description', courseDescription);
        formData.append('price', parsedPrice); // Use parsedPrice
        formData.append('instructorId', user.id); // Ensure instructorId is sent with course creation/update
        if (courseFile) {
            formData.append('courseFile', courseFile);
        } else if (editingCourse && !courseFile && !editingCourse.documentPath) {
            // If editing, no new file, and no existing file, explicitly tell backend to clear it if needed
            // This is a common pattern if you want to remove a file without uploading a new one.
            // You'd need a backend check for 'clearDocument' in updateCourse.
            // formData.append('clearDocument', 'true');
        }


        try {
            let response;
            if (editingCourse) {
                response = await axios.put(`http://localhost:5000/api/courses/${editingCourse.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data' // Important for Multer to parse
                    }
                });
                setMessage('Course updated successfully!');
            } else {
                response = await axios.post('http://localhost:5000/api/courses', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data' // Important for Multer to parse
                    }
                });
                setMessage('Course created successfully!');
            }
            console.log('Course API response:', response.data);
            setShowCourseForm(false);
            // Re-fetch courses to update the list
            const updatedCoursesResponse = await axios.get('http://localhost:5000/api/courses/my-courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(updatedCoursesResponse.data.courses);
        } catch (err) {
            console.error('Error submitting course form:', err);
            setMessage(err.response?.data?.message || 'Failed to save course.');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
        setMessage('');
        const token = localStorage.getItem('token');
        if (!token) { onLogout(); return; }

        try {
            await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Course deleted successfully!');
            setCourses(courses.filter(c => c.id !== courseId));
        } catch (err) {
            console.error('Error deleting course:', err);
            setMessage(err.response?.data?.message || 'Failed to delete course.');
        }
    };

    // --- Styling (remains mostly the same) ---
    const dashboardStyle = {
        border: '1px solid #28a745',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '1000px',
        margin: '40px auto',
        backgroundColor: '#e7ffe7',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        textAlign: 'left'
    };

    const headerStyle = {
        textAlign: 'center',
        color: '#218838',
        marginBottom: '20px'
    };

    const tabContainerStyle = {
        display: 'flex',
        marginBottom: '20px',
        borderBottom: '1px solid #ccc'
    };

    const tabButtonStyle = (tabName) => ({
        padding: '10px 20px',
        cursor: 'pointer',
        border: 'none',
        borderBottom: activeTab === tabName ? '2px solid #28a745' : '2px solid transparent',
        backgroundColor: 'transparent',
        fontWeight: activeTab === tabName ? 'bold' : 'normal',
        color: activeTab === tabName ? '#28a745' : '#555',
        fontSize: '1em',
        transition: 'all 0.3s ease'
    });

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

    return (
        <div style={dashboardStyle}>
            <h2 style={headerStyle}>Instructor Dashboard</h2>
            <p style={{ textAlign: 'center', color: '#218838' }}>Welcome, {user?.name || 'Instructor'}! Your role: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{user?.role}</span></p>

            <div style={tabContainerStyle}>
                <button style={tabButtonStyle('courses')} onClick={() => setActiveTab('courses')}>Course Management</button>
                <button style={tabButtonStyle('exams')} onClick={() => setActiveTab('exams')}>Exam Management</button>
                <button
                    onClick={onLogout}
                    style={{ ...tabButtonStyle('logout'), marginLeft: 'auto', backgroundColor: '#dc3545', color: 'white', borderRadius: '4px' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                >
                    Logout
                </button>
            </div>

            {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red', textAlign: 'center', marginBottom: '15px' }}>{message}</p>}
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>Error: {error}</p>}
            {loading && <p style={{ textAlign: 'center' }}>Loading data...</p>}

            {/* --- Conditional Rendering for Tabs --- */}
            {activeTab === 'courses' && (
                <div style={sectionStyle}>
                    <h3>My Courses</h3>
                    <button onClick={handleAddCourseClick} style={formButtonStyle}>Add New Course</button>

                    {showCourseForm && (
                        <div style={{ ...sectionStyle, marginTop: '15px', border: '1px dashed #28a745' }}>
                            <h4>{editingCourse ? 'Edit Course' : 'Create New Course'}</h4>
                            <form onSubmit={handleSubmitCourseForm}>
                                <div style={formGroupStyle}>
                                    <label>Title:</label>
                                    <input type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} style={inputStyle} required />
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Description:</label>
                                    <textarea value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} required></textarea>
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Price:</label>
                                    {/* NEW: Changed type to "text" for better validation control, used pattern */}
                                    <input
                                        type="text"
                                        inputMode="numeric" // Helps mobile keyboards
                                        pattern="[0-9]*[.]?[0-9]+" // Allows integers or decimals
                                        value={coursePrice}
                                        onChange={(e) => setCoursePrice(e.target.value)}
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Upload Document (PDF, Image, etc.):</label>
                                    <input type="file" onChange={handleFileChange} style={inputStyle} />
                                    {editingCourse && editingCourse.documentPath && (
                                        <p style={{ fontSize: '0.8em', color: '#555', marginTop: '5px' }}>
                                            Current Document: <a href={`http://localhost:5000/${editingCourse.documentPath}`} target="_blank" rel="noopener noreferrer">View</a> (Upload new to replace)
                                        </p>
                                    )}
                                </div>
                                <button type="submit" style={formButtonStyle}>{editingCourse ? 'Update Course' : 'Create Course'}</button>
                                <button type="button" onClick={() => setShowCourseForm(false)} style={cancelButton}>Cancel</button>
                            </form>
                        </div>
                    )}

                    {!loading && courses.length > 0 ? (
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thTdStyle}>ID</th>
                                    <th style={thTdStyle}>Title</th>
                                    <th style={thTdStyle}>Description</th>
                                    <th style={thTdStyle}>Price</th>
                                    <th style={thTdStyle}>Document</th>
                                    <th style={thTdStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map(course => (
                                    <tr key={course.id}>
                                        <td style={thTdStyle}>{course.id}</td>
                                        <td style={thTdStyle}>{course.title}</td>
                                        <td style={thTdStyle}>{course.description.substring(0, 70)}{course.description.length > 70 ? '...' : ''}</td>
                                        <td style={thTdStyle}>${parseFloat(course.price).toFixed(2)}</td>
                                        <td style={thTdStyle}>
                                            {course.documentPath ? (
                                                <a href={`http://localhost:5000/${course.documentPath}`} target="_blank" rel="noopener noreferrer">View Document</a>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td style={thTdStyle}>
                                            <button onClick={() => handleEditCourseClick(course)} style={editButton}>Edit</button>
                                            <button onClick={() => handleDeleteCourse(course.id)} style={deleteButton}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : !loading && <p style={{ textAlign: 'center' }}>No courses found. Add one to get started!</p>}
                </div>
            )}

            {activeTab === 'exams' && (
                // Render the ExamManagement component when the 'exams' tab is active
                <ExamManagement user={user} onLogout={onLogout} />
            )}
        </div>
    );
}

export default InstructorDashboard;

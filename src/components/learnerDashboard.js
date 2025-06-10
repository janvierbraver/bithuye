// client/src/components/LearnerDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LearnerDashboard({ user, onLogout }) {
    const navigate = useNavigate();

    // --- State Management ---
    const [availableCourses, setAvailableCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(''); // For success/error messages

    // Centralized error handling for authentication/authorization issues
    const handleAuthError = useCallback((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
            setError(err.response?.data?.message || 'Authentication failed. Please log in again.');
            onLogout();
        } else {
            setError(err.response?.data?.message || 'An unexpected error occurred.');
        }
    }, [setError, onLogout]); // <-- 'onLogout' is already a dependency here

    // --- Fetch Courses on Component Mount ---
    useEffect(() => {
        const fetchCourses = async () => {
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
                // Fetch all available courses
                const availableResponse = await axios.get('http://localhost:5000/api/courses', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAvailableCourses(availableResponse.data.courses);

                // Fetch courses the learner is already enrolled in
                const enrolledResponse = await axios.get('http://localhost:5000/api/enrollments/my-courses', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEnrolledCourses(enrolledResponse.data.enrolledCourses);

            } catch (err) {
                console.error('Error fetching courses:', err);
                // Use the centralized error handler
                handleAuthError(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) { // Only fetch if user is logged in
            fetchCourses();
        }
    }, [user, handleAuthError, onLogout]); // <-- ADDED 'onLogout' here to satisfy the linter


    // --- Course Search/Filter ---
    const filteredAvailableCourses = availableCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter out courses that are already enrolled from the available list
    const finalAvailableCourses = filteredAvailableCourses.filter(
        availableCourse => !enrolledCourses.some(enrolledCourse => enrolledCourse.Course.id === availableCourse.id)
    );

    // --- Course Actions ---
    const handleEnroll = async (courseId) => {
        setMessage('');
        const token = localStorage.getItem('token');
        if (!token) { onLogout(); return; }

        try {
            const response = await axios.post('http://localhost:5000/api/enrollments', { courseId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(response.data.message);
            // Re-fetch both lists to update UI
            const availableResponse = await axios.get('http://localhost:5000/api/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableCourses(availableResponse.data.courses);

            const enrolledResponse = await axios.get('http://localhost:5000/api/enrollments/my-courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnrolledCourses(enrolledResponse.data.enrolledCourses);

        } catch (err) {
            console.error('Error enrolling in course:', err);
            setMessage(err.response?.data?.message || 'Failed to enroll in course.');
            // Also apply auth error handling for enroll
            handleAuthError(err);
        }
    };

    const handleViewCourse = (courseId) => {
        // Navigate to a detailed course view page (LearnerCourseDetail)
        navigate(`/learner/courses/${courseId}`);
    };

    // --- Styling (kept for completeness) ---
    const dashboardStyle = {
        border: '1px solid #007bff',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '1000px',
        margin: '40px auto',
        backgroundColor: '#f0f8ff',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        textAlign: 'left'
    };

    const headerStyle = {
        textAlign: 'center',
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

    const courseCardStyle = {
        border: '1px solid #ddd',
        borderRadius: '5px',
        padding: '15px',
        marginBottom: '15px',
        backgroundColor: '#fdfdfd',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
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

    const logoutButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#dc3545',
        marginLeft: 'auto',
        display: 'block', // To make it float right
        marginBottom: '20px'
    };

    const searchInputStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginBottom: '20px',
        fontSize: '1em'
    };

    return (
        <div style={dashboardStyle}>
            <h2 style={headerStyle}>Learner Dashboard</h2>
            <p style={{ textAlign: 'center', color: '#0056b3' }}>Welcome, {user?.name || 'Learner'}! Your role: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{user?.role}</span></p>

            <button
                onClick={onLogout}
                style={logoutButtonStyle}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
            >
                Logout
            </button>

            {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red', textAlign: 'center', marginBottom: '15px' }}>{message}</p>}
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>Error: {error}</p>}
            {loading && <p style={{ textAlign: 'center' }}>Loading courses...</p>}

            {/* My Enrolled Courses Section */}
            <div style={sectionStyle}>
                <h3>My Enrolled Courses</h3>
                {!loading && enrolledCourses.length > 0 ? (
                    enrolledCourses.map(enrollment => (
                        <div key={enrollment.id} style={courseCardStyle}>
                            <h4>{enrollment.Course.title}</h4>
                            <p>{enrollment.Course.description.substring(0, 100)}{enrollment.Course.description.length > 100 ? '...' : ''}</p>
                            <p>Enrolled On: {new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
                            <button
                                onClick={() => handleViewCourse(enrollment.Course.id)}
                                style={{ ...buttonStyle, backgroundColor: '#28a745' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                            >
                                View Course Details
                            </button>
                        </div>
                    ))
                ) : !loading && <p style={{ textAlign: 'center' }}>You are not enrolled in any courses yet.</p>}
            </div>

            {/* Available Courses Section */}
            <div style={sectionStyle}>
                <h3>Available Courses</h3>
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={searchInputStyle}
                />
                {!loading && finalAvailableCourses.length > 0 ? (
                    finalAvailableCourses.map(course => (
                        <div key={course.id} style={courseCardStyle}>
                            <h4>{course.title}</h4>
                            <p>{course.description.substring(0, 100)}{course.description.length > 100 ? '...' : ''}</p>
                            <p>Price: ${parseFloat(course.price).toFixed(2)}</p>
                            <button
                                onClick={() => handleEnroll(course.id)}
                                style={buttonStyle}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                            >
                                Enroll Now
                            </button>
                        </div>
                    ))
                ) : !loading && <p style={{ textAlign: 'center' }}>No available courses found matching your search.</p>}
            </div>
        </div>
    );
}

export default LearnerDashboard;
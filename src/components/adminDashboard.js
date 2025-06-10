import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard({ user, onLogout }) {
    const navigate = useNavigate(); // 'navigate' is initialized here

    // --- State Management ---
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'courses'
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(''); // For success/error messages after CRUD ops

    // User Form States
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // User object being edited
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('learner'); // Default role for new users

    // Course Form States
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null); // Course object being edited
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [newCourseDescription, setNewCourseDescription] = useState('');
    const [newCoursePrice, setNewCoursePrice] = useState('');

    // --- Fetch Data on Component Mount and Tab Change ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setMessage('');
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                onLogout(); // Redirect to login
                return;
            }

            try {
                if (activeTab === 'users') {
                    const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUsers(usersResponse.data.users);
                } else if (activeTab === 'courses') {
                    const coursesResponse = await axios.get('http://localhost:5000/api/admin/courses', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCourses(coursesResponse.data.courses);
                }
            } catch (err) {
                console.error(`Error fetching ${activeTab}:`, err);
                setError(err.response?.data?.message || `Failed to fetch ${activeTab}.`);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    onLogout(); // Token expired or unauthorized
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, onLogout]);

    // --- User Management Functions ---
    const handleAddUserClick = () => {
        setEditingUser(null);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('learner');
        setShowUserForm(true);
        setMessage('');
        navigate('/admin/users/add'); // <--- UNCOMMENTED: Using navigate
    };

    const handleEditUserClick = (userToEdit) => {
        setEditingUser(userToEdit);
        setNewUserName(userToEdit.name);
        setNewUserEmail(userToEdit.email);
        setNewUserPassword('');
        setNewUserRole(userToEdit.Role?.name || 'learner');
        setShowUserForm(true);
        setMessage('');
        navigate(`/admin/users/edit/${userToEdit.id}`); // <--- UNCOMMENTED: Using navigate
    };

    const handleSubmitUserForm = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('token');
        if (!token) { onLogout(); return; }

        try {
            let apiResponse;
            if (editingUser) {
                apiResponse = await axios.put(`http://localhost:5000/api/admin/users/${editingUser.id}`, {
                    name: newUserName,
                    email: newUserEmail,
                    password: newUserPassword || undefined,
                    role: newUserRole
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('User updated successfully!');
            } else {
                apiResponse = await axios.post('http://localhost:5000/api/admin/users', {
                    name: newUserName,
                    email: newUserEmail,
                    password: newUserPassword,
                    role: newUserRole
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('User created successfully!');
            }
            console.log('User API response:', apiResponse.data);
            setShowUserForm(false);
            const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(usersResponse.data.users);
        } catch (err) {
            console.error('Error submitting user form:', err);
            setMessage(err.response?.data?.message || 'Failed to save user.');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        setMessage('');
        const token = localStorage.getItem('token');
        if (!token) { onLogout(); return; }

        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('User deleted successfully!');
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Error deleting user:', err);
            setMessage(err.response?.data?.message || 'Failed to delete user.');
        }
    };

    // --- Course Management Functions ---
    const handleAddCourseClick = () => {
        setEditingCourse(null);
        setNewCourseTitle('');
        setNewCourseDescription('');
        setNewCoursePrice('');
        setShowCourseForm(true);
        setMessage('');
        navigate('/admin/courses/add'); // <--- UNCOMMENTED: Using navigate
    };

    const handleEditCourseClick = (courseToEdit) => {
        setEditingCourse(courseToEdit);
        setNewCourseTitle(courseToEdit.title);
        setNewCourseDescription(courseToEdit.description);
        setNewCoursePrice(courseToEdit.price);
        setShowCourseForm(true);
        setMessage('');
        navigate(`/admin/courses/edit/${courseToEdit.id}`); // <--- UNCOMMENTED: Using navigate
    };

    const handleSubmitCourseForm = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('token');
        if (!token) { onLogout(); return; }

        try {
            let apiResponse;
            if (editingCourse) {
                apiResponse = await axios.put(`http://localhost:5000/api/admin/courses/${editingCourse.id}`, {
                    title: newCourseTitle,
                    description: newCourseDescription,
                    price: newCoursePrice
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Course updated successfully!');
            } else {
                apiResponse = await axios.post('http://localhost:5000/api/admin/courses', {
                    title: newCourseTitle,
                    description: newCourseDescription,
                    price: newCoursePrice
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Course created successfully!');
            }
            console.log('Course API response:', apiResponse.data);
            setShowCourseForm(false);
            const coursesResponse = await axios.get('http://localhost:5000/api/admin/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(coursesResponse.data.courses);
        } catch (err) {
            console.error('Error submitting course form:', err);
            setMessage(err.response?.data?.message || 'Failed to save course.');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        setMessage('');
        const token = localStorage.getItem('token');
        if (!token) { onLogout(); return; }

        try {
            await axios.delete(`http://localhost:5000/api/admin/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Course deleted successfully!');
            setCourses(courses.filter(c => c.id !== courseId));
        } catch (err) {
            console.error('Error deleting course:', err);
            setMessage(err.response?.data?.message || 'Failed to delete course.');
        }
    };

    // --- Styling ---
    const dashboardStyle = {
        border: '1px solid #007bff',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '1000px',
        margin: '40px auto',
        backgroundColor: '#e7f3ff',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        textAlign: 'left'
    };

    const headerStyle = {
        textAlign: 'center',
        color: '#0056b3',
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
        borderBottom: activeTab === tabName ? '2px solid #007bff' : '2px solid transparent',
        backgroundColor: 'transparent',
        fontWeight: activeTab === tabName ? 'bold' : 'normal',
        color: activeTab === tabName ? '#007bff' : '#555',
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
        textAlign: 'left'
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
        backgroundColor: '#007bff',
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

    return (
        <div style={dashboardStyle}>
            <h2 style={headerStyle}>Admin Dashboard</h2>
            <p style={{ textAlign: 'center', color: '#0056b3' }}>Welcome, {user?.name || 'Admin'}! Your role: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{user?.role}</span></p>

            <div style={tabContainerStyle}>
                <button style={tabButtonStyle('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
                <button style={tabButtonStyle('users')} onClick={() => setActiveTab('users')}>User Management</button>
                <button style={tabButtonStyle('courses')} onClick={() => setActiveTab('courses')}>Course Management</button>
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

            {activeTab === 'overview' && (
                <div style={sectionStyle}>
                    <h3>Overview</h3>
                    <p>This section provides a summary of your E-Learning Platform. You can see quick stats here.</p>
                    <p>Total Users: {users.length}</p>
                    <p>Total Courses: {courses.length}</p>
                </div>
            )}

            {activeTab === 'users' && (
                <div style={sectionStyle}>
                    <h3>User Management</h3>
                    <button onClick={handleAddUserClick} style={formButtonStyle}>Add New User</button>

                    {showUserForm && (
                        <div style={{ ...sectionStyle, marginTop: '15px', border: '1px dashed #007bff' }}>
                            <h4>{editingUser ? 'Edit User' : 'Create New User'}</h4>
                            <form onSubmit={handleSubmitUserForm}>
                                <div style={formGroupStyle}>
                                    <label>Name:</label>
                                    <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} style={inputStyle} required />
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Email:</label>
                                    <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} style={inputStyle} required />
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Password (leave blank if not changing):</label>
                                    <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} style={inputStyle} />
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Role:</label>
                                    <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} style={inputStyle} required>
                                        <option value="learner">Learner</option>
                                        <option value="instructor">Instructor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <button type="submit" style={formButtonStyle}>{editingUser ? 'Update User' : 'Create User'}</button>
                                <button type="button" onClick={() => setShowUserForm(false)} style={cancelButton}>Cancel</button>
                            </form>
                        </div>
                    )}

                    {!loading && users.length > 0 ? (
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thTdStyle}>ID</th>
                                    <th style={thTdStyle}>Name</th>
                                    <th style={thTdStyle}>Email</th>
                                    <th style={thTdStyle}>Role</th>
                                    <th style={thTdStyle}>Verified</th>
                                    <th style={thTdStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td style={thTdStyle}>{u.id}</td>
                                        <td style={thTdStyle}>{u.name}</td>
                                        <td style={thTdStyle}>{u.email}</td>
                                        <td style={thTdStyle}>{u.Role?.name || 'N/A'}</td>
                                        <td style={thTdStyle}>{u.isVerified ? 'Yes' : 'No'}</td>
                                        <td style={thTdStyle}>
                                            <button onClick={() => handleEditUserClick(u)} style={editButton}>Edit</button>
                                            <button onClick={() => handleDeleteUser(u.id)} style={deleteButton}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : !loading && <p style={{ textAlign: 'center' }}>No users found.</p>}
                </div>
            )}

            {activeTab === 'courses' && (
                <div style={sectionStyle}>
                    <h3>Course Management</h3>
                    <button onClick={handleAddCourseClick} style={formButtonStyle}>Add New Course</button>

                    {showCourseForm && (
                        <div style={{ ...sectionStyle, marginTop: '15px', border: '1px dashed #28a745' }}>
                            <h4>{editingCourse ? 'Edit Course' : 'Create New Course'}</h4>
                            <form onSubmit={handleSubmitCourseForm}>
                                <div style={formGroupStyle}>
                                    <label>Title:</label>
                                    <input type="text" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} style={inputStyle} required />
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Description:</label>
                                    <textarea value={newCourseDescription} onChange={(e) => setNewCourseDescription(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} required></textarea>
                                </div>
                                <div style={formGroupStyle}>
                                    <label>Price:</label>
                                    <input type="number" step="0.01" value={newCoursePrice} onChange={(e) => setNewCoursePrice(e.target.value)} style={inputStyle} required />
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
                                    <th style={thTdStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map(c => (
                                    <tr key={c.id}>
                                        <td style={thTdStyle}>{c.id}</td>
                                        <td style={thTdStyle}>{c.title}</td>
                                        <td style={thTdStyle}>{c.description.substring(0, 50)}...</td>
                                        <td style={thTdStyle}>${parseFloat(c.price).toFixed(2)}</td>
                                        <td style={thTdStyle}>
                                            <button onClick={() => handleEditCourseClick(c)} style={editButton}>Edit</button>
                                            <button onClick={() => handleDeleteCourse(c.id)} style={deleteButton}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : !loading && <p style={{ textAlign: 'center' }}>No courses found.</p>}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
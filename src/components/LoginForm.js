import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

function LoginForm({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('learner'); // New state for selected role
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false); // For password visibility toggle

    const navigate = useNavigate(); // Initialize useNavigate hook

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });
            setMessage(response.data.message);
            console.log('Login successful:', response.data);

            // Store token and user info (including role) in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            if (onLoginSuccess) {
                onLoginSuccess(response.data.user); // Pass user data to parent (App.js)
            }

            // Redirect based on the ACTUAL role returned by the backend
            const actualRole = response.data.user.role;

            // Optional: You can add a check here if the selected role from dropdown
            // does NOT match the actual role from the backend, and display a warning.
            // if (selectedRole !== actualRole) {
            //     setMessage(`Logged in as ${actualRole}, not as ${selectedRole} as selected. Redirecting...`);
            //     // You might want to delay redirect slightly if showing this message
            //     setTimeout(() => navigate(`/${actualRole}-dashboard`), 1500);
            // } else {
            //     navigate(`/${actualRole}-dashboard`); // Redirect to role-specific dashboard
            // }

            // Simplest approach: Always redirect based on the actual role from backend
            if (actualRole) {
                // Admin specific handling: if actualRole is 'admin', you might have a special path
                if (actualRole === 'admin') {
                    navigate('/admin-dashboard'); // Redirect admin to admin dashboard
                } else {
                    navigate(`/${actualRole}-dashboard`); // Redirect others to their respective dashboards
                }
            } else {
                // Fallback if role is unexpectedly missing from backend response
                navigate('/'); // Or to a generic success page
            }

            setEmail('');
            setPassword('');
            setSelectedRole('learner'); // Reset selected role
        } catch (error) {
            setMessage(error.response?.data?.message || 'Login failed. Please try again.');
            console.error('Login error:', error);
        }
    };

    // Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                {/* Password field with toggle */}
                <div style={{ marginBottom: '10px', position: 'relative' }}>
                    <input
                        type={showPassword ? 'text' : 'password'} // Toggle type
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', paddingRight: '8px' }} // Add padding for eye icon
                    />
                    <span
                        onClick={togglePasswordVisibility}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            color: '#555'
                        }}
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </span>
                </div>

                {/* NEW: Role Selection Dropdown */}
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="login-role-select" style={{ display: 'block', marginBottom: '5px' }}>I am logging in as:</label>
                    <select
                        id="login-role-select"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="learner">Learner</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                    </select>
                    <p style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
                        Your actual role is confirmed by the server after login.
                    </p>
                </div>

                <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Login</button>
            </form>

            {message && <p style={{ color: message.includes('failed') || message.includes('Wrong') || message.includes('No') || message.includes('not verified') ? 'red' : 'green', marginTop: '10px' }}>{message}</p>}

            {/* NEW: Navigation Links */}
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em' }}>
                <p>
                    <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none' }}>Forgot Password?</Link>
                </p>
                <p>
                    Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Register here.</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginForm;
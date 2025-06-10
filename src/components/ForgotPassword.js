import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showOtpFields, setShowOtpFields] = useState(false); // Controls which form section is visible
    const [showPassword, setShowPassword] = useState(false); // For password visibility toggle

    const navigate = useNavigate(); // Initialize useNavigate hook

    // Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Step 1: Request OTP for password reset
    const handleForgotPasswordRequest = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage(response.data.message || 'OTP sent to your email. Please check your inbox.');
            setShowOtpFields(true); // Show the OTP and new password fields
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to send reset OTP. Please check your email and try again.');
            console.error('Forgot password request error:', error);
        }
    };

    // Step 2: Reset password using OTP
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages

        if (newPassword !== confirmNewPassword) {
            setMessage('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setMessage('New password must be at least 6 characters long.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
                email, // Send email to identify user (or you could send a resetToken if your backend uses it)
                otp,
                newPassword,
                confirmNewPassword // Backend should re-validate this
            });
            setMessage(response.data.message || 'Password has been reset successfully!');
            // After successful reset, redirect to login page
            alert('Password reset successful! You can now log in with your new password.');
            navigate('/login');
            // Clear form fields
            setEmail('');
            setOtp('');
            setNewPassword('');
            setConfirmNewPassword('');
            setShowOtpFields(false); // Hide OTP fields
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to reset password. Please check OTP and try again.');
            console.error('Password reset error:', error);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '450px', margin: '20px auto' }}>
            <h2>Forgot Password</h2>

            {/* Display message */}
            {message && <p style={{ color: message.includes('failed') || message.includes('match') ? 'red' : 'green', marginTop: '10px' }}>{message}</p>}

            {!showOtpFields ? (
                // Phase 1: Request OTP form
                <form onSubmit={handleForgotPasswordRequest}>
                    <p>Enter your email address to receive a password reset code.</p>
                    <div style={{ marginBottom: '15px' }}>
                        <input
                            type="email"
                            placeholder="Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Send Reset Code
                    </button>
                </form>
            ) : (
                // Phase 2: Enter OTP and new password form
                <form onSubmit={handleResetPassword}>
                    <p>A reset code has been sent to **{email}**. Enter the code and your new password below.</p>
                    <div style={{ marginBottom: '15px' }}>
                        <input
                            type="text"
                            placeholder="Enter OTP Code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    {/* New Password Field with Toggle */}
                    <div style={{ marginBottom: '15px', position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', paddingRight: '40px', borderRadius: '4px', border: '1px solid #ddd' }}
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
                    {/* Confirm New Password Field with Toggle */}
                    <div style={{ marginBottom: '15px', position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm New Password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', paddingRight: '40px', borderRadius: '4px', border: '1px solid #ddd' }}
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
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Reset Password
                    </button>
                </form>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em' }}>
                <p>
                    Remember your password? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Login here.</Link>
                </p>
                <p>
                    Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Register here.</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
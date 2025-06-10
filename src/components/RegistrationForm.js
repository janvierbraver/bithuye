import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// Define your API base URL here for easier management
const API_BASE_URL = 'http://localhost:5000/api/auth';

function RegistrationForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('learner');
    const [otp, setOtp] = useState('');
    const [activationToken, setActivationToken] = useState('');
    const [message, setMessage] = useState('');
    const [showOtpField, setShowOtpField] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    // Timer for OTP resend cooldown
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer); // Cleanup on unmount or if cooldown finishes
    }, [resendCooldown]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages

        if (password !== confirmPassword) {
            setMessage('Passwords do not match. Please re-enter your confirmation password.');
            return;
        }
        if (password.length < 6) {
            setMessage('Password must be at least 6 characters long.');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/register`, {
                name,
                email,
                password,
                role
            });

            // Ensure message is always a string
            setMessage(String(response.data.message || ''));
            setActivationToken(response.data.activationToken);
            setShowOtpField(true);
            setResendCooldown(60); // Start 60-second cooldown after successful registration

        } catch (error) {
            // Ensure error message is always a string
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
            setMessage(String(errorMessage));
            console.error('Registration error:', error.response?.data || error.message);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages

        const verifyUrl = `${API_BASE_URL}/verify-otp`;
        console.log('Attempting to verify OTP at URL:', verifyUrl);
        console.log('Sending payload:', { otp, activationToken });

        try {
            const response = await axios.post(verifyUrl, {
                otp,
                activationToken
            });

            // Ensure message is always a string
            setMessage(String(response.data.message || ''));

            if (response.status === 200 || response.status === 201) {
                alert('Account verified successfully! You can now log in.');
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setRole('learner');
                setOtp('');
                setActivationToken('');
                setResendCooldown(0);
                setShowOtpField(false);
                navigate('/login');
            } else {
                setMessage('Verification failed with unexpected status.');
            }
        } catch (error) {
            // Ensure error message is always a string
            const errorMessage = error.response?.data?.message || error.message || 'Verification failed. Please check your OTP and try again.';
            setMessage(String(errorMessage));
            console.error('Verification error:', error.response?.data || error.message);
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        setMessage(''); // Clear previous messages

        const resendUrl = `${API_BASE_URL}/resend-otp`;
        console.log('Attempting to resend OTP at URL:', resendUrl);
        console.log('Sending email for resend:', email);

        try {
            const response = await axios.post(resendUrl, {
                email: email
            });
            // Ensure message is always a string
            setMessage(String(response.data.message || ''));
            setResendCooldown(60);
        } catch (error) {
            // Ensure error message is always a string
            const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP.';
            setMessage(String(errorMessage));
            console.error('Resend OTP error:', error.response?.data || error.message);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
            <h2>Register</h2>
            {!showOtpField ? (
                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>
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
                    <div style={{ marginBottom: '10px', position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', paddingRight: '35px' }}
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
                    <div style={{ marginBottom: '10px', position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', paddingRight: '35px' }}
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

                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="role-select" style={{ display: 'block', marginBottom: '5px' }}>Select Role:</label>
                        <select
                            id="role-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{ width: '100%', padding: '8px' }}
                        >
                            <option value="learner">Learner</option>
                            <option value="instructor">Instructor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Register</button>
                </form>
            ) : (
                <form onSubmit={handleVerify} style={{ marginTop: '20px' }}>
                    <h3>Verify OTP</h3>
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>Verify Account</button>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isResending || resendCooldown > 0}
                        style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: (isResending || resendCooldown > 0) ? 0.6 : 1 }}
                    >
                        {isResending ? 'Sending...' : resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                    </button>
                </form>
            )}

            {message && <p style={{ color: message.includes('failed') || message.includes('Wrong') || message.includes('Invalid') || message.includes('exists') || message.includes('match') ? 'red' : 'green', marginTop: '10px' }}>{message}</p>}

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em' }}>
                <p>
                    Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Login here.</Link>
                </p>
            </div>
        </div>
    );
}

export default RegistrationForm;
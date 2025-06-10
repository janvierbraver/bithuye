// client/src/components/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    // --- Styling ---
    const pageContainerStyle = {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif', // Using Inter font
        backgroundColor: '#f0f2f5', // Light grey background
        color: '#333',
    };

    const navStyle = {
        backgroundColor: '#ffffff',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '8px', // Rounded corners for the navbar
        margin: '10px 20px', // Some margin around the navbar
    };

    const logoStyle = {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#007bff', // Primary blue color
        textDecoration: 'none',
    };

    const navLinksStyle = {
        display: 'flex',
        gap: '1.5rem',
    };

    const linkStyle = {
        textDecoration: 'none',
        color: '#555',
        fontSize: '1.1rem',
        fontWeight: '500',
        padding: '0.5rem 1rem',
        borderRadius: '6px', // Rounded corners for links
        transition: 'background-color 0.3s ease, color 0.3s ease',
    };

    const linkHoverStyle = {
        backgroundColor: '#e9ecef', // Light hover background
        color: '#007bff',
    };

    const heroSectionStyle = {
        flexGrow: 1, // Allows hero section to take up available space
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #e0f7fa 0%, #cce5ff 100%)', // Light blue gradient
        borderRadius: '12px', // More rounded corners for hero
        margin: '20px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    };

    const heroTitleStyle = {
        fontSize: '3.5rem',
        color: '#0056b3',
        marginBottom: '1rem',
        fontWeight: '700',
        textShadow: '2px 2px 4px rgba(0,0,0,0.05)',
    };

    const heroSubtitleStyle = {
        fontSize: '1.5rem',
        color: '#444',
        maxWidth: '800px',
        marginBottom: '2rem',
        lineHeight: '1.6',
    };

    const ctaButtonStyle = {
        display: 'inline-block',
        padding: '1rem 2.5rem',
        fontSize: '1.2rem',
        fontWeight: '600',
        color: 'white',
        backgroundColor: '#28a745', // Green CTA button
        borderRadius: '8px',
        textDecoration: 'none',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    };

    const ctaButtonHoverStyle = {
        backgroundColor: '#218838', // Darker green on hover
        transform: 'translateY(-2px)',
    };

    const footerStyle = {
        backgroundColor: '#333',
        color: '#fff',
        textAlign: 'center',
        padding: '1.5rem',
        fontSize: '0.9rem',
        marginTop: 'auto', // Pushes footer to the bottom
        borderRadius: '8px', // Rounded corners
        margin: '10px 20px',
    };

    return (
        <div style={pageContainerStyle}>
            {/* Navbar */}
            <nav style={navStyle}>
                <Link to="/" style={logoStyle}>E-Learning Hub</Link>
                <div style={navLinksStyle}>
                    <Link
                        to="/login"
                        style={linkStyle}
                        onMouseOver={(e) => Object.assign(e.currentTarget.style, linkHoverStyle)}
                        onMouseOut={(e) => Object.assign(e.currentTarget.style, linkStyle)}
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        style={{ ...linkStyle, backgroundColor: '#007bff', color: 'white' }} // Highlight Register
                        onMouseOver={(e) => Object.assign(e.currentTarget.style, { backgroundColor: '#0056b3' })}
                        onMouseOut={(e) => Object.assign(e.currentTarget.style, { backgroundColor: '#007bff', color: 'white' })}
                    >
                        Register
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={heroSectionStyle}>
                <h1 style={heroTitleStyle}>Unlock Your Potential with Our E-Learning Platform</h1>
                <p style={heroSubtitleStyle}>
                    Discover a world of knowledge with expert-led courses, interactive exams, and personalized learning paths.
                    Start your journey to success today!
                </p>
                <Link
                    to="/register"
                    style={ctaButtonStyle}
                    onMouseOver={(e) => Object.assign(e.currentTarget.style, ctaButtonHoverStyle)}
                    onMouseOut={(e) => Object.assign(e.currentTarget.style, ctaButtonStyle)}
                >
                    Get Started for Free
                </Link>
            </header>

            {/* You can add more sections here like "Features", "Testimonials", "Courses" preview */}
            {/* Example: */}
            <section style={{ ...heroSectionStyle, background: '#ffffff', boxShadow: 'none', padding: '2rem', margin: '20px', borderRadius: '12px' }}>
                <h2 style={{ ...heroTitleStyle, fontSize: '2.5rem', color: '#007bff' }}>Why Choose Us?</h2>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px', marginTop: '2rem' }}>
                    <div style={{ flexBasis: '30%', minWidth: '280px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#f8f9fa' }}>
                        <h3 style={{ color: '#28a745', marginBottom: '10px' }}>Expert Instructors</h3>
                        <p>Learn from industry leaders and experienced educators.</p>
                    </div>
                    <div style={{ flexBasis: '30%', minWidth: '280px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#f8f9fa' }}>
                        <h3 style={{ color: '#ffc107', marginBottom: '10px' }}>Interactive Exams</h3>
                        <p>Test your knowledge with engaging and automatically graded assessments.</p>
                    </div>
                    <div style={{ flexBasis: '30%', minWidth: '280px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#f8f9fa' }}>
                        <h3 style={{ color: '#17a2b8', marginBottom: '10px' }}>Flexible Learning</h3>
                        <p>Access courses anytime, anywhere, at your own pace.</p>
                    </div>
                </div>
            </section>


            {/* Footer */}
            <footer style={footerStyle}>
                © {new Date().getFullYear()} Braver E-Learning Platform. All rights reserved.
            </footer>
        </div>
    );
}

export default HomePage;
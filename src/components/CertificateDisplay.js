// client/src/components/CertificateDisplay.js
import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

// --- Styling for Certificate (Moved outside the component) ---
const styles = {
    container: {
        fontFamily: 'Georgia, serif',
        maxWidth: '800px',
        margin: '50px auto',
        padding: '40px',
        border: '5px double #007bff', // Elegant border
        borderRadius: '15px',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle at top left, #e0f7fa, #ffffff 70%)',
        color: '#333',
    },
    ribbon: {
        position: 'absolute',
        top: '20px',
        left: '-50px',
        width: '200px',
        height: '30px',
        backgroundColor: '#ffc107',
        transform: 'rotate(-45deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.9em',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    },
    header: {
        fontSize: '2.8em',
        color: '#0056b3',
        marginBottom: '20px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    },
    subHeader: {
        fontSize: '1.8em',
        color: '#28a745',
        marginBottom: '15px',
    },
    paragraph: {
        fontSize: '1.2em',
        lineHeight: '1.6',
        marginBottom: '10px',
    },
    name: {
        fontSize: '2.5em',
        fontWeight: 'bold',
        color: '#007bff',
        margin: '20px 0',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    achievement: {
        fontSize: '1.4em',
        fontStyle: 'italic',
        color: '#555',
        marginBottom: '30px',
    },
    signatureSection: {
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: '40px',
        borderTop: '1px solid #ccc',
        paddingTop: '20px',
    },
    signatureBlock: {
        textAlign: 'center',
    },
    signatureLine: {
        borderBottom: '1px solid #333',
        width: '150px',
        margin: '0 auto 5px auto',
    },
    signatureText: {
        fontSize: '0.9em',
        color: '#666',
    },
    date: {
        fontSize: '1em',
        marginTop: '20px',
        color: '#777',
    },
    button: {
        padding: '12px 25px',
        fontSize: '1.1em',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '30px',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    },
    buttonHover: {
        backgroundColor: '#0056b3',
        transform: 'translateY(-2px)',
    },
    '@media print': {
        body: {
            margin: 0,
            padding: 0,
        },
        container: {
            boxShadow: 'none',
            border: 'none',
            backgroundImage: 'none',
            pageBreakAfter: 'always',
        },
        button: {
            display: 'none',
        },
        ribbon: {
            display: 'none', // Hide ribbon in print
        }
    }
};

function CertificateDisplay() {
    const { examId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Get data passed via navigate state
    const { examTitle, learnerName, score, courseTitle } = location.state || {};

    // Fallback if data is missing (e.g., direct access to URL)
    if (!examTitle || !learnerName || score === undefined || !courseTitle) {
        return (
            <div style={styles.container}>
                <h2 style={styles.header}>Certificate Not Found</h2>
                <p style={styles.paragraph}>It seems there was an issue loading the certificate details.</p>
                <button onClick={() => navigate(-1)} style={styles.button}>Go Back</button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={styles.container}>
            {/* <div style={styles.ribbon}>CERTIFIED</div> */}
            <h1 style={styles.header}>Certificate of Achievement</h1>
            <p style={styles.paragraph}>This certifies that</p>
            <p style={styles.name}>{learnerName}</p>
            <p style={styles.paragraph}>has successfully completed the course</p>
            <h2 style={styles.subHeader}>{courseTitle}</h2>
            <p style={styles.paragraph}>and achieved a score of</p>
            <p style={{ ...styles.name, fontSize: '2.2em' }}>{score}%</p>
            <p style={styles.achievement}>
                by passing the exam: "{examTitle}" (Exam ID: {examId})
            </p>

            <div style={styles.signatureSection}>
                <div style={styles.signatureBlock}>
                    <div style={styles.signatureLine}></div>
                    <p style={styles.signatureText}>Instructor Signature</p>
                </div>
                <div style={styles.signatureBlock}>
                    <div style={styles.signatureLine}></div>
                    <p style={styles.signatureText}>Platform Administrator</p>
                </div>
            </div>
            <p style={styles.date}>Date Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <button
                onClick={handlePrint}
                style={styles.button}
                onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.button)}
            >
                Print Certificate
            </button>
            <button
                onClick={() => navigate(-1)}
                style={{...styles.button, backgroundColor: '#6c757d', marginLeft: '10px'}}
                onMouseOver={(e) => Object.assign(e.currentTarget.style, {...styles.buttonHover, backgroundColor: '#5a6268'})}
                onMouseOut={(e) => Object.assign(e.currentTarget.style, {...styles.button, backgroundColor: '#6c757d'})}
            >
                Go Back
            </button>
        </div>
    );
}

export default CertificateDisplay;
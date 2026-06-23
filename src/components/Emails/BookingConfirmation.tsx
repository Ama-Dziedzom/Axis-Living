import * as React from 'react';

interface BookingConfirmationEmailProps {
    name: string;
    date: string;
    time: string;
    meetingLink: string;
    consultationType?: string;
}

export const BookingConfirmationEmail: React.FC<Readonly<BookingConfirmationEmailProps>> = ({
    name,
    date,
    time,
    meetingLink,
    consultationType,
}) => (
    <div style={{
        fontFamily: "'Manrope', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        backgroundColor: '#FAF9F6',
        padding: '60px 20px',
        color: '#1C1C1C',
    }}>
        {/* Font Imports */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Cormorant+Garamond:wght@300;400;500;600&display=swap" rel="stylesheet" />

        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(47, 64, 44, 0.08)',
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#2F402C',
                padding: '50px 40px',
                textAlign: 'center',
            }}>
                <h1 style={{
                    margin: 0,
                    color: '#FFFFFF',
                    fontSize: '20px',
                    fontWeight: '300',
                    letterSpacing: '8px',
                    textTransform: 'uppercase',
                    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                }}>
                    Appointment Confirmed
                </h1>
            </div>

            {/* Body */}
            <div style={{ padding: '60px 40px' }}>
                <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '24px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Dear {name},
                </p>
                <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#1C1C1C', marginBottom: '32px', fontFamily: "'Manrope', sans-serif" }}>
                    Thank you for booking a consultation with NOA Living Studio. We are looking forward to discussing your project and helping you bring your vision to life.
                </p>

                {/* Appointment Details */}
                <div style={{
                    backgroundColor: '#FAF9F6',
                    padding: '32px',
                    borderRadius: '4px',
                    marginBottom: '32px',
                    border: '1px solid #E2E8F0'
                }}>
                    <h2 style={{
                        margin: '0 0 20px',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: '#C6B9AA',
                        fontWeight: 'bold',
                        fontFamily: "'Manrope', sans-serif",
                    }}>
                        Your Appointment Details
                    </h2>
                    <div style={{ marginBottom: '16px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#C6B9AA', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px', fontFamily: "'Manrope', sans-serif" }}>Date:</span>
                        <span style={{ fontSize: '16px', color: '#2F402C', fontWeight: '500', fontFamily: "'Manrope', sans-serif" }}>{date}</span>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#C6B9AA', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px', fontFamily: "'Manrope', sans-serif" }}>Time:</span>
                        <span style={{ fontSize: '16px', color: '#2F402C', fontWeight: '500', fontFamily: "'Manrope', sans-serif" }}>{time} (CAT)</span>
                    </div>
                </div>

                {/* Meeting Link / Studio Section */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    {consultationType === 'walk-in' ? (
                        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.7', fontFamily: "'Manrope', sans-serif" }}>
                            We&apos;ll see you at the studio at the scheduled time. Feel free to browse
                            our material samples, fabrics, and finishes — our team will be on hand to
                            walk you through everything.
                        </p>
                    ) : (
                        <>
                            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', fontFamily: "'Manrope', sans-serif" }}>
                                We&apos;ll meet via Google Meet at the scheduled time.
                            </p>
                            <a href={meetingLink} style={{
                                display: 'inline-block',
                                backgroundColor: '#2F402C',
                                color: '#FFFFFF',
                                padding: '20px 40px',
                                borderRadius: '99px',
                                textDecoration: 'none',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                fontFamily: "'Manrope', sans-serif",
                            }}>
                                Join Meeting
                            </a>
                        </>
                    )}
                </div>

                <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#2F402C', fontStyle: 'italic', borderTop: '1px solid #E2E8F0', paddingTop: '24px', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: '300' }}>
                    If you need to reschedule, please use the link in your original calendar invite or contact us at least 24 hours in advance.
                </p>
            </div>

            {/* Footer */}
            <div style={{
                padding: '40px',
                textAlign: 'center',
                fontSize: '11px',
                color: '#94A3B8',
                letterSpacing: '0.05em',
                fontFamily: "'Manrope', sans-serif",
            }}>
                <p style={{ margin: '0 0 10px' }}>&copy; {new Date().getFullYear()} NOA Living Studio. All rights reserved.</p>
                <p style={{ margin: 0 }}>Lusaka, Zambia</p>
            </div>
        </div>
    </div>
);

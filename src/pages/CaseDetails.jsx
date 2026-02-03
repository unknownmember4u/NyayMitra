import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { caseService } from '../services/caseService';
import {
    CheckCircle2,
    Circle,
    Clock,
    ArrowLeft,
    FileText,
    AlertTriangle,
    ChevronRight,
    Gavel,
    ShieldCheck,
    MessageSquare,
    Trophy
} from 'lucide-react';

const PROGRESS_STAGES = [
    { title: "Case Registration", sub: "Examine facts & collect evidence" },
    { title: "Case Filing", sub: "FIR filed / Petition filed" },
    { title: "Admission & Scrutiny", sub: "Document completeness & legal validity" },
    { title: "Notice Issued", sub: "Notice sent to opposite party" },
    { title: "Hearing", sub: "First appearance in court" },
    { title: "Pleading Stage", sub: "Facts and legal points recorded" },
    { title: "Evidence Stage", sub: "Submission and verification of evidence" },
    { title: "Arguments Stage", sub: "Final legal arguments" },
    { title: "Execution", sub: "Court orders implementation" },
    { title: "Settlement", sub: "Final case resolution" }
];

const CaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [rating, setRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);

    useEffect(() => {
        const fetchCase = async () => {
            try {
                const data = await caseService.getCaseById(id);
                setCaseData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCase();
    }, [id]);

    const handleUpdateProgress = async (index) => {
        if (currentUser.role !== 'lawyer') return;
        setUpdating(true);
        try {
            await caseService.updateCaseProgress(id, index);
            setCaseData(prev => ({ ...prev, currentStageIndex: index }));
        } catch (err) {
            alert("Failed to update progress.");
        } finally {
            setUpdating(false);
        }
    };

    const handleRate = async (star) => {
        setRatingLoading(true);
        try {
            await caseService.rateCase(id, caseData.lawyer, star);
            setCaseData(prev => ({ ...prev, rating: star }));
            alert("Thank you for your feedback! Trust Score updated.");
        } catch (err) {
            alert("Failed to submit rating.");
        } finally {
            setRatingLoading(false);
        }
    };

    const handleStatusUpdate = async (status) => {
        if (!window.confirm(`Are you sure you want to mark this case as ${status.toUpperCase()}?`)) return;
        setUpdating(true);
        try {
            await caseService.updateCaseStatus(id, status);
            await caseService.updateLawyerStats(currentUser.uid, status === 'won');
            setCaseData(prev => ({ ...prev, status }));
            alert(`Case marked as ${status}!`);
        } catch (err) {
            alert("Failed to update status.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="page">Loading case details...</div>;
    if (!caseData) return <div className="page">Case not found.</div>;

    const isLawyer = currentUser.role === 'lawyer';

    return (
        <div className="page">
            <div className="flex-between m-b-2" style={{ gap: '1rem', alignItems: 'flex-start' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem', minWidth: '40px' }}>
                    <ArrowLeft size={18} />
                </button>
                <div style={{ textAlign: 'right', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <span className={`badge badge-${caseData.urgency}`}>{caseData.urgency} Urgency</span>
                    <span className={`badge badge-${caseData.status}`}>{caseData.status}</span>
                </div>
            </div>

            <div className="case-details-layout">
                <div className="case-main-content">
                    <div className="card m-b-2">
                        <h2 className="m-b-1" style={{ textTransform: 'capitalize' }}>{caseData.category} Case Profile</h2>
                        <p className="text-muted m-b-2" style={{ wordBreak: 'break-word' }}>{caseData.description}</p>

                        <div className="flex-between case-profile-sub" style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div className="flex-between" style={{ gap: '0.5rem' }}>
                                <Clock size={16} color="var(--primary)" />
                                <span>Filed on: {caseData.createdAt?.toDate().toLocaleDateString()}</span>
                            </div>
                            {caseData.lawyer && (
                                <div className="flex-between" style={{ gap: '0.5rem' }}>
                                    <ShieldCheck size={16} color="var(--success)" />
                                    <span>Lawyer Assigned</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trust Rating Section */}
                    {!isLawyer && (caseData.status === 'won' || caseData.status === 'closed' || caseData.status === 'lost') && (
                        <div className="card m-b-2" style={{ border: '2px solid var(--primary)', background: '#fff9f9' }}>
                            <h3 className="m-b-1">Trust Rating</h3>
                            {caseData.rating ? (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Trophy size={20} color="#f59e0b" />
                                    <span>You rated this lawyer <strong>{caseData.rating}/5</strong>. This contributes to their overall Trust Score.</span>
                                </div>
                            ) : (
                                <>
                                    <p className="text-muted m-b-2">How was your experience? Your rating helps update the lawyer's <strong>Trust Score</strong>.</p>
                                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '2rem', justifyContent: 'center' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => handleRate(star)}
                                                disabled={ratingLoading}
                                                style={{
                                                    background: 'none',
                                                    color: star <= (rating || 0) ? '#f59e0b' : '#d1d5db',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseEnter={() => setRating(star)}
                                                onMouseLeave={() => setRating(0)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
                                        Ratings use an exponential weighted algorithm for accuracy.
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    <div className="card">
                        <h3 className="m-b-2 flex-between">
                            Case Progress Tracking
                            {isLawyer && <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--primary)' }}>Select current stage to update</span>}
                        </h3>

                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Vertical Line */}
                            <div style={{
                                position: 'absolute',
                                left: '15px',
                                top: '10px',
                                bottom: '10px',
                                width: '2px',
                                background: 'var(--border)',
                                zIndex: 0
                            }}></div>

                            {PROGRESS_STAGES.map((stage, index) => {
                                const isCompleted = index < caseData.currentStageIndex;
                                const isCurrent = index === caseData.currentStageIndex;
                                const isPending = index > caseData.currentStageIndex;

                                return (
                                    <div
                                        key={index}
                                        onClick={() => isLawyer && handleUpdateProgress(index)}
                                        style={{
                                            display: 'flex',
                                            gap: '1.5rem',
                                            position: 'relative',
                                            zIndex: 1,
                                            cursor: isLawyer ? 'pointer' : 'default',
                                            opacity: isUpdateable(index, caseData.currentStageIndex, isLawyer) ? 1 : 0.6
                                        }}
                                    >
                                        <div style={{
                                            background: isCurrent ? 'var(--primary)' : isCompleted ? 'var(--success)' : 'var(--white)',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `2px solid ${isCurrent ? 'var(--primary)' : isCompleted ? 'var(--success)' : 'var(--border)'}`,
                                            boxShadow: isCurrent ? '0 0 10px rgba(var(--primary-rgb), 0.3)' : 'none'
                                        }}>
                                            {isCompleted ? <CheckCircle2 size={18} color="white" /> :
                                                isCurrent ? <Clock size={18} color="white" className="spin-slow" /> :
                                                    <Circle size={18} color="var(--text-muted)" />}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <h4 style={{
                                                margin: 0,
                                                color: isCurrent ? 'var(--primary)' : isCompleted ? 'var(--text)' : 'var(--text-muted)',
                                                fontWeight: isCurrent ? 700 : 500
                                            }}>
                                                {index + 1}. {stage.title}
                                            </h4>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                                {stage.sub}
                                            </p>
                                        </div>

                                        {isCurrent && (
                                            <div className="badge badge-medium" style={{ height: 'fit-content' }}>Active Stage</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Case Resolution for Client */}
                        {!isLawyer && caseData.status === 'active' && (
                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
                                <h4 className="m-b-1">Has your case reached a verdict?</h4>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => handleStatusUpdate('won')}
                                        className="btn"
                                        style={{ flex: 1, background: 'var(--success)', color: 'white' }}
                                        disabled={updating}
                                    >
                                        I Won the Case
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('lost')}
                                        className="btn"
                                        style={{ flex: 1, background: 'var(--danger)', color: 'white' }}
                                        disabled={updating}
                                    >
                                        I Lost the Case
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="case-sidebar">
                    <div className="card m-b-2">
                        <h4 className="m-b-1">Case Evidence ({caseData.documents?.length || 0})</h4>
                        {caseData.documents?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {caseData.documents.map((doc, idx) => (
                                    <div key={idx} style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: '0.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <FileText size={20} color="var(--primary)" />
                                        <div style={{ flex: 1, fontSize: '0.8125rem', overflow: 'hidden' }}>
                                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>{doc.name}</div>
                                        </div>
                                        <a href={doc.data} download={doc.name} className="btn-icon">
                                            <ChevronRight size={16} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted small">No documents attached.</p>
                        )}
                    </div>

                    <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
                        <h4 className="m-b-1" style={{ color: 'white' }}>Quick Actions</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button className="btn btn-white w-full" style={{ background: 'white', color: 'var(--primary)', border: 'none' }} onClick={() => navigate(`/chat?chatId=${caseData.id}&name=Case Chat`)}>
                                <MessageSquare size={18} />
                                <span>Go to Conversation</span>
                            </button>

                            {caseData.status === 'won' && (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                    <Trophy size={20} />
                                    <strong>Case Won Successfully!</strong>
                                </div>
                            )}
                            {caseData.status === 'lost' && (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                    <AlertTriangle size={20} />
                                    <strong>Case Closed (Lost)</strong>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .spin-slow { animation: spin 4s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .btn-white { display: flex; align-items: center; gap: 0.5rem; justify-content: center; padding: 0.75rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; width: 100%; }
            `}</style>
        </div>
    );
};

// Only allow stepping forward or staying same, unless lawyer wants to go back
const isUpdateable = (index, currentIndex, isLawyer) => {
    if (!isLawyer) return false;
    return true; // Lawyer can click any stage to set current
};

export default CaseDetails;

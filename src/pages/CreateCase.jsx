import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { caseService } from '../services/caseService';
import { detectUrgency } from '../utils/aiLogic';
import { Send, AlertTriangle, Mic, Square, Loader2, Wand2, RefreshCw, ShieldCheck } from 'lucide-react';

const CreateCase = () => {
    const { currentUser } = useAuth();
    const [category, setCategory] = useState('civil');
    const [description, setDescription] = useState('');
    const [aiUrgency, setAiUrgency] = useState(null);
    const [loading, setLoading] = useState(false);

    // Voice States
    const [isRecording, setIsRecording] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const navigate = useNavigate();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                handleUpload(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Mic access denied", err);
            alert("Please allow microphone access to record.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleUpload = async (audioBlob) => {
        setTranscribing(true);
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            const response = await fetch('http://localhost:5000/transcribe', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.text) {
                setDescription(data.text);
            } else if (data.error) {
                alert("Transcription Error: " + data.error);
            }
        } catch (err) {
            console.error("Transcription failed", err);
            alert("Could not connect to voice server. Make sure the backend is running.");
        } finally {
            setTranscribing(false);
        }
    };

    const handleAnalyze = async () => {
        if (!description) {
            alert("Please record or type a description first.");
            return;
        }
        setAnalyzing(true);
        try {
            const response = await fetch('http://localhost:5000/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: description }),
            });
            const data = await response.json();
            if (data.category) setCategory(data.category);
            if (data.description) setDescription(data.description);
            if (data.urgency) setAiUrgency(data.urgency);
        } catch (err) {
            console.error("Analysis failed", err);
            alert("AI processing failed. Please check backend and Gemini API key.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const newCase = await caseService.createCase(currentUser.uid, category, description, aiUrgency);
            navigate(`/recommended-lawyers?caseId=${newCase.id}&category=${category}`);
        } catch (error) {
            console.error("Error creating case:", error);
            alert("Failed to create case. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const currentUrgency = aiUrgency || (description ? detectUrgency(description) : 'medium');

    return (
        <div className="page">
            <div className="m-b-2">
                <h1>File a New Case</h1>
                <p className="text-muted">You can speak in Hindi or Marathi, we will understand.</p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                <div className="card">
                    {/* Voice Section */}
                    <div style={{
                        background: 'var(--bg)',
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        marginBottom: '2rem',
                        border: '2px dashed var(--border)',
                        textAlign: 'center'
                    }}>
                        <h3 className="m-b-1">Record Your Voice</h3>
                        <p className="text-muted m-b-2">Tell us about your problem in your own language.</p>

                        <div className="flex-between" style={{ justifyContent: 'center', gap: '1rem' }}>
                            {!isRecording ? (
                                <button className="btn btn-primary" onClick={startRecording} type="button"
                                    style={{ height: '80px', width: '80px', borderRadius: '50%', justifyContent: 'center' }}>
                                    <Mic size={32} />
                                </button>
                            ) : (
                                <button className="btn btn-danger" onClick={stopRecording} type="button"
                                    style={{ height: '80px', width: '80px', borderRadius: '50%', justifyContent: 'center', animation: 'pulse 1.5s infinite' }}>
                                    <Square size={32} />
                                </button>
                            )}
                        </div>

                        {isRecording && <p className="m-t-1" style={{ color: 'var(--danger)', fontWeight: 600 }}>Recording...</p>}
                        {transcribing && <div className="m-t-1 flex-between" style={{ justifyContent: 'center', gap: '0.5rem' }}>
                            <Loader2 className="animate-spin" size={18} />
                            <span>Converting voice to text...</span>
                        </div>}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Case Description</label>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    rows="8"
                                    placeholder="Your complaint will appear here after recording, or you can type..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    style={{ paddingRight: '4rem' }}
                                ></textarea>
                                {description && (
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={handleAnalyze}
                                        disabled={analyzing}
                                        style={{
                                            position: 'absolute',
                                            bottom: '10px',
                                            right: '10px',
                                            padding: '0.5rem',
                                            background: 'var(--white)'
                                        }}
                                        title="Process with AI"
                                    >
                                        {analyzing ? <RefreshCw className="animate-spin" size={18} /> : <Wand2 size={18} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div className="input-group">
                                <label>Case Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option value="civil">Civil</option>
                                    <option value="criminal">Criminal</option>
                                    <option value="family">Family</option>
                                    <option value="consumer">Consumer</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label>Urgency Level</label>
                                <input
                                    type="text"
                                    value={currentUrgency.toUpperCase()}
                                    readOnly
                                    style={{
                                        background: 'var(--bg)',
                                        color: currentUrgency === 'high' ? 'var(--danger)' : 'var(--primary)',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ marginTop: '2rem', width: '100%', height: '50px', fontSize: '1.1rem' }}
                            disabled={loading || description.length < 10}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            <span>{loading ? 'Filing case...' : 'File Complaint & Find Lawyers'}</span>
                        </button>
                    </form>
                </div>

                <div className="card" style={{ height: 'fit-content' }}>
                    <h3 className="m-b-1">How it works</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '1rem', borderRadius: '0.5rem', background: 'var(--bg)' }}>
                            <div className="flex-between m-b-0-5">
                                <strong style={{ fontSize: '0.875rem' }}>1. Record Voice</strong>
                                <Mic size={16} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Speak in Hindi or Marathi. <strong>Faster-Whisper</strong> will transcribe it accurately.
                            </p>
                        </div>

                        <div style={{ padding: '1rem', borderRadius: '0.5rem', background: 'var(--bg)' }}>
                            <div className="flex-between m-b-0-5">
                                <strong style={{ fontSize: '0.875rem' }}>2. AI Analysis</strong>
                                <Wand2 size={16} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Click the magic wand! <strong>Gemini AI</strong> will refine your text and detect the category.
                            </p>
                        </div>

                        <div style={{ padding: '1rem', borderRadius: '0.5rem', background: 'var(--bg)' }}>
                            <div className="flex-between m-b-0-5">
                                <strong style={{ fontSize: '0.875rem' }}>3. Professional Result</strong>
                                <ShieldCheck size={16} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                We find the top lawyers matching your specific legal need.
                            </p>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <h4 className="m-b-1">Detected Urgency</h4>
                        <div className="flex-between" style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            background: currentUrgency === 'high' ? '#fee2e2' : 'var(--bg)',
                            border: '1px solid ' + (currentUrgency === 'high' ? '#fecaca' : 'var(--border)')
                        }}>
                            <span className={`badge badge-${currentUrgency}`}>{currentUrgency}</span>
                            {currentUrgency === 'high' && <AlertTriangle size={18} color="var(--danger)" />}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CreateCase;

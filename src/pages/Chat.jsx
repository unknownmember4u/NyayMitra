import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { Send, User, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';

const Chat = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const chatId = searchParams.get('chatId');
    const recipientName = searchParams.get('name') || 'Legal Chat';

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!chatId) return;

        const unsubscribe = chatService.subscribeToMessages(chatId, (msgs) => {
            setMessages(msgs);
            setLoading(false);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [chatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId) return;

        const text = newMessage;
        setNewMessage('');

        try {
            await chatService.sendMessage(chatId, currentUser.uid, text);
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message.");
        }
    };

    if (!chatId) {
        return <div className="page">Invalid Chat ID</div>;
    }

    return (
        <div className="page" style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem' }}>
                    <ArrowLeft size={18} />
                </button>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                }}>
                    {recipientName.charAt(0)}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{recipientName}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                        Online
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="card" style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Loader2 className="animate-spin" />
                        <p className="text-muted">Loading conversation...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <MessageSquare size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                        <p className="text-muted">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            style={{
                                alignSelf: msg.senderId === currentUser.uid ? 'flex-end' : 'flex-start',
                                maxWidth: '70%',
                                background: msg.senderId === currentUser.uid ? 'var(--primary)' : 'var(--bg)',
                                color: msg.senderId === currentUser.uid ? 'white' : 'var(--text)',
                                padding: '0.75rem 1rem',
                                borderRadius: '1rem',
                                borderBottomRightRadius: msg.senderId === currentUser.uid ? '0.25rem' : '1rem',
                                borderBottomLeftRadius: msg.senderId === currentUser.uid ? '1rem' : '0.25rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        >
                            <p style={{ margin: 0 }}>{msg.text}</p>
                            <span style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '0.25rem', display: 'block', textAlign: 'right' }}>
                                {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="card" style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '0.5rem' }}
                />
                <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
                    <Send size={18} />
                    <span>Send</span>
                </button>
            </form>

            <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Chat;

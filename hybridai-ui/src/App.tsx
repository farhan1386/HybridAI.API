import { useState, useRef, useEffect } from 'react';
import './App.css';

const API_URL = "http://localhost:5006/api/chat/stream";

const CodeBlock = ({ codeText }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <div className="code-block-wrapper">
            <div className="code-block-header">
                <span className="code-lang-tag">csharp</span>
                <button type="button" className="copy-btn" onClick={handleCopy}>
                    {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
            </div>
            <pre className="code-block-container">
                <code>{codeText}</code>
            </pre>
        </div>
    );
};

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const renderMessageContent = (content) => {
        if (!content) return "";

        const parts = content.split(/(```csharp|```)/g);
        let isCode = false;

        return parts.map((part, index) => {
            if (part === '```csharp' || part === '```') {
                isCode = (part === '```csharp');
                return null;
            }

            if (isCode) {
                return <CodeBlock key={index} codeText={part.trim()} />;
            }

            return <span key={index}>{part}</span>;
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;

        const userMessage = { role: 'user', content: input };
        const initialHistory = [...messages, userMessage];

        setMessages([...initialHistory, { role: 'assistant', content: '' }]);
        setInput('');
        setIsStreaming(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'local',
                    history: initialHistory.map(msg => ({ role: msg.role, content: msg.content }))
                })
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulator = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const rawToken = decoder.decode(value);
                accumulator += rawToken;

                setMessages((prev) => {
                    const updated = [...prev];
                    if (updated.length > 0) {
                        updated[updated.length - 1].content = accumulator;
                    }
                    return updated;
                });
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: `⚠️ Pipeline Exception Intercepted: ${error.message}.` }
            ]);
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <div className="dashboard-container">
            {/* 🧭 Control Sidebar */}
            <aside className="control-panel">
                <div className="brand">
                    <div className="logo-glow">⚡</div>
                    <h2>CORE ENGINE</h2>
                </div>

                <div className="system-status">
                    <h3>SYSTEM TELEMETRY</h3>
                    <div className="status-item">
                        <span>Status:</span>
                        <span className={`badge ${isStreaming ? 'pulse-orange' : 'pulse-green'}`}>
                            {isStreaming ? 'PROCESSING' : 'ONLINE READY'}
                        </span>
                    </div>
                    <div className="status-item">
                        <span>Active Model:</span>
                        <span className="badge-tech">Llama 3.2 (Local)</span>
                    </div>
                    <div className="status-item">
                        <span>Runtime Stack:</span>
                        <span className="badge-tech">.NET 10 LTS</span>
                    </div>
                    <div className="status-item">
                        <span>UI Layer:</span>
                        <span className="badge-tech">React SPA</span>
                    </div>
                </div>
            </aside>

            {/* 💬 Main Execution Workspace */}
            <main className="chat-workspace">
                <header className="workspace-header">
                    <h1>Local AI Intelligence Hub</h1>
                    <span className="subtitle">High-performance Ollama token streaming pipeline</span>
                </header>

                <section className="terminal-screen">
                    {messages.length === 0 ? (
                        <div className="empty-state">
                            <div className="terminal-icon">⚙️</div>
                            <p>Pipeline environment initialized. Awaiting execution parameters.</p>
                            <p className="hint">Enter a query command below to begin local execution.</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`chat-row ${msg.role}`}>
                                <div className="message-wrapper">
                                    <div className="sender-tag">
                                        {msg.role === 'user' ? '👤 OPERATOR' : '💻 CORE_RESP'}
                                    </div>
                                    <div className="bubble-content">
                                        {msg.content ? renderMessageContent(msg.content) : (isStreaming && index === messages.length - 1 ? "Compiling stream buffer..." : "")}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={chatEndRef} />
                </section>

                <form className="console-input-bar" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isStreaming ? "Streaming execution chunks..." : "Enter transaction command query..."}
                        disabled={isStreaming}
                        className="cyber-input"
                    />
                    <button type="submit" className="cyber-button" disabled={isStreaming || !input.trim()}>
                        {isStreaming ? "● ● ●" : "EXECUTE"}
                    </button>
                </form>
            </main>
        </div>
    );
}

export default App;

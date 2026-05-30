import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCheck, ShieldAlert } from 'lucide-react';

export default function WhatsAppChat({ onLeadCaptured, backendMode }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-init-1',
      sender: 'agent',
      text: '👋 *Welcome to Ganga Maxx Marketplace B2B Support!*\n\nI am your AI sales assistant. I can help you with:\n• Checking product pricing and stock status\n• Explaining chemical dilution & usage instructions\n• Calculating B2B bulk discounts\n• Generating professional sales quotations\n• Arranging delivery across Hyderabad\n\nHow can I assist your business today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickReplies = [
    { label: "💰 Bulk Discounts", text: "What are the B2B bulk discounts?" },
    { label: "🚚 Delivery Info", text: "What are the delivery terms and locations?" },
    { label: "🧽 Floor Cleaning", text: "What do you recommend for hotel floor cleaning?" },
    { label: "📋 Get Quote", text: "I want to request a quotation for my business" }
  ];

  // Helper to format WhatsApp markdown (*bold* and bullet points)
  const formatWAMessage = (text) => {
    if (!text) return '';
    // Bold: *text* -> <strong>text</strong>
    let formatted = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    // Bullet points: • -> list item
    formatted = formatted.split('\n').map((line, idx) => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return `<li key=${idx} style="margin-left: 15px; margin-bottom: 3px;">${line.substring(1).trim()}</li>`;
      }
      return line;
    }).join('\n');
    
    // Convert newlines to <br/>
    return formatted.replace(/\n/g, '<br/>');
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: userTime
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsTyping(true);

    // Call backend API
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsTyping(false);
        
        const agentMsg = {
          id: `msg-agent-${Date.now()}`,
          sender: 'agent',
          text: data.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: data.mode
        };
        setMessages(prev => [...prev, agentMsg]);

        // If a lead was captured from this interaction, trigger callback to refresh the panel
        if (data.newLeadCaptured) {
          onLeadCaptured(data.newLeadCaptured);
        }
      } else {
        throw new Error("Server error");
      }
    } catch (error) {
      console.error("Chat API error:", error);
      setIsTyping(false);
      // Local fallback in case server goes down completely
      const agentMsg = {
        id: `msg-agent-err-${Date.now()}`,
        sender: 'agent',
        text: "⚠️ Sorry, I experienced an offline connectivity error. Please try again or use the forms on the right to configure your quotation details.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'simulated'
      };
      setMessages(prev => [...prev, agentMsg]);
    }
  };

  return (
    <div className="whatsapp-container">
      {/* Header bar */}
      <div className="wa-header-bar">
        <div className="wa-contact-info">
          <div className="wa-avatar">GM</div>
          <div className="wa-contact-details">
            <h4>Ganga Maxx Sales Assistant
              <svg className="wa-verified" viewBox="0 0 24 24" width="14" height="14">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </h4>
            <span className="wa-status">Online • GenAI Support</span>
          </div>
        </div>
      </div>

      {/* Message history */}
      <div className="wa-chat-body">
        {messages.map((msg) => (
          <div key={msg.id} className={`wa-bubble-wrapper ${msg.sender === 'user' ? 'sent' : 'received'}`}>
            <div className="wa-bubble">
              <span dangerouslySetInnerHTML={{ __html: formatWAMessage(msg.text) }} />
              <div className="wa-bubble-footer">
                <span>{msg.time}</span>
                {msg.sender === 'user' && <CheckCheck size={14} className="wa-double-check" />}
                {msg.sender === 'agent' && msg.mode === 'simulated' && (
                  <span title="Running in simulated offline fallback mode" style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                    <ShieldAlert size={10} style={{ color: '#f59e0b' }} />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="wa-bubble-wrapper received">
            <div className="wa-bubble" style={{ padding: '8px 12px' }}>
              <div className="typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Replies chips */}
      <div className="wa-quick-replies">
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            className="reply-chip"
            onClick={() => handleSendMessage(reply.text)}
          >
            {reply.label}
          </button>
        ))}
      </div>

      {/* Input Tray */}
      <div className="wa-input-tray">
        <input
          type="text"
          className="wa-input-field"
          placeholder="Type a message or share your name & number to get a call back..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage(inputText);
          }}
        />
        <button
          className="wa-send-btn"
          disabled={!inputText.trim()}
          onClick={() => handleSendMessage(inputText)}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

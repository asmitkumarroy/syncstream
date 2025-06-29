import React, { useState, useContext, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import './Chat.css';

// THE FIX: Add `= []` to provide a default empty array for messages.
const Chat = ({ roomId, messages = [] }) => {
  const [newMessage, setNewMessage] = useState('');
  const socket = useSocket();
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && user) {
      socket.emit('send_message', {
        roomId,
        message: newMessage,
        username: user.username,
      });
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h3>Live Chat</h3>
      <div className="messages-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message-item ${msg.type}`}>
            {msg.type === 'chat' ? (
              <>
                <span className="username" style={{ color: msg.id === socket.id ? '#1db954' : '#b3b3b3' }}>
                  {msg.username}:
                </span>
                <span className="message-content">{msg.message}</span>
              </>
            ) : (
              <span className="notification-content">{msg.content}</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Say something..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
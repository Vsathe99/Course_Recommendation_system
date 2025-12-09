import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb  } from "lucide-react";

const Chat = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      text: `Hello ${user.name}! 👋 I'm your AI recommendation assistant. Tell me what you're looking for, and I'll provide personalized suggestions based on your preferences.`,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
  }, [user.name]);

  const generateBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    if (msg.includes('movie') || msg.includes('film')) {
      return "Based on your interest in movies, I'd recommend:\n\n1. **Inception** (2010)\n2. **The Shawshank Redemption** (1994)\n3. **Interstellar** (2014)\n\nWhat genre are you most interested in?";
    } else if (msg.includes('book')) {
      return "Great choice! Here are some book recommendations:\n\n1. **'Atomic Habits' by James Clear**\n2. **'Project Hail Mary' by Andy Weir**\n3. **'The Midnight Library' by Matt Haig**\n\nWould you like more suggestions in a specific genre?";
    } else if (msg.includes('music') || msg.includes('song')) {
      return "For music recommendations:\n\n1. **Spotify Discover Weekly**\n2. **Arctic Monkeys**\n3. **Billie Eilish**\n\nWhat's your favorite music genre?";
    } else if (msg.includes('restaurant') || msg.includes('food')) {
      return "Looking for food recommendations?\n\n1. Try local cuisine spots\n2. Check Google Maps reviews\n3. Explore new dishes on delivery apps\n\nWhat cuisine do you prefer?";
    } else if (msg.includes('thank')) {
      return "You're welcome! 😊 Feel free to ask for more recommendations anytime!";
    } else if (msg.includes('hello') || msg.includes('hi')) {
      return "Hello! How can I assist you with recommendations today?";
    } else {
      return "I'd be happy to help! Please specify what you're looking for (movies, books, music, food, etc).";
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const userMessage = {
        id: Date.now(),
        text: inputMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsTyping(true);

      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          text: generateBotResponse(inputMessage),
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const clearChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      text: `Chat cleared! How can I help you with recommendations today?`,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap sm:flex-nowrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Recommender System</h1>
              <p className="text-sm text-gray-600">AI-Powered Recommendations</p>
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right mr-3 flex-1 sm:flex-none">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 break-all">{user.email}</p>
            </div>
            <button
              onClick={clearChat}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
              title="Clear Chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition text-sm w-full sm:w-auto justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto w-full break-words px-2 sm:px-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 mb-6 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}

              <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-2xl`}>
                <div className={`px-4 py-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-white shadow-md'
                }`}>
                  <p className={`whitespace-pre-line break-words ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                    {msg.text}
                  </p>
                </div>
                <span className="text-xs text-gray-500 mt-1 px-2">{msg.timestamp}</span>
              </div>

              {msg.sender === 'user' && (
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name[0].toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 mb-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl shadow-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask for recommendations..."
              className="flex-1 w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-2">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;

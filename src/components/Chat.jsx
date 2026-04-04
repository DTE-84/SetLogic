import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Loader } from 'lucide-react'
import { chatWithCoach } from '../services/claudeAPI'
import { useAuth } from '../contexts/AuthContext'
import './Chat.css'

function Chat() {
  const { currentUser } = useAuth()
  const firstName = currentUser?.displayName?.split(' ')[0] || 'there'
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey ${firstName}! I'm your SetLogic AI fitness coach. I can help with workout plans, meal guidance, exercise tips, recovery, and staying consistent. What would you like help with today?`
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await chatWithCoach(conversationHistory, userMessage)
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <Sparkles size={24} className="chat-icon" />
          <div>
            <h2>AI Coach Chat</h2>
            <p className="chat-subtitle">Get help with workouts, meals, recovery, and fitness goals</p>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message, idx) => (
          <div key={idx} className={`message ${message.role}`}>
            {message.role === 'assistant' && (
              <div className="message-avatar">
                <Sparkles size={16} />
              </div>
            )}
            <div className="message-content">
              <div className="message-text">{message.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">
              <Sparkles size={16} />
            </div>
            <div className="message-content">
              <div className="message-loading">
                <Loader size={16} className="spinner" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about workouts, nutrition, form tips..."
          rows={1}
          disabled={isLoading}
        />
        <button 
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}

export default Chat

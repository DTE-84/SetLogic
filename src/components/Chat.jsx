import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Sparkles, Loader } from 'lucide-react'
import { chatWithCoach, conversationHistory } from '../services/claudeAPI'
import { useAuth } from '../contexts/AuthContext'
import { getUserProfile, getBodyMeasurements, getWearableData } from '../services/firestoreService'
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
  const [telemetry, setTelemetry] = useState(null)
  const messagesEndRef = useRef(null)

  const fetchTelemetry = useCallback(async () => {
    if (!currentUser) return
    try {
      const [profile, measurements, wearables] = await Promise.all([
        getUserProfile(currentUser.uid),
        getBodyMeasurements(currentUser.uid, 5),
        getWearableData(currentUser.uid, 1)
      ])

      // Get today's food from localStorage (to match FoodLogger for now)
      const today = new Date().toISOString().split('T')[0]
      const storedMeals = localStorage.getItem(`meals_${currentUser.uid}_${today}`)
      const meals = storedMeals ? JSON.parse(storedMeals) : []
      const macros = meals.reduce((acc, m) => ({
        p: acc.p + (m.protein * (m.servings || 1)),
        c: acc.c + (m.carbs * (m.servings || 1)),
        f: acc.f + (m.fat * (m.servings || 1)),
        cal: acc.cal + (m.calories * (m.servings || 1))
      }), { p: 0, c: 0, f: 0, cal: 0 })

      setTelemetry({
        weight: measurements[0]?.weight || profile?.weight || "Unknown",
        macros,
        steps: wearables[0]?.data?.steps || "Unknown",
        adherence: "85" // Placeholder for now
      })
    } catch (error) {
      console.error("Telemetry uplink failed:", error)
    }
  }, [currentUser])

  useEffect(() => {
    fetchTelemetry()
  }, [fetchTelemetry])

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
      const dashboardContext = telemetry ? `
    SYSTEM TELEMETRY CONTEXT:
    - Weight: ${telemetry.weight} lbs
    - Daily Macros: P${Math.round(telemetry.macros.p)}g / C${Math.round(telemetry.macros.c)}g / F${Math.round(telemetry.macros.f)}g (${Math.round(telemetry.macros.cal)} kcal)
    - Step Velocity: ${telemetry.steps} steps
    - Behavioral Adherence: ${telemetry.adherence}%
    ` : "TELEMETRY: No recent data synced."

      console.log("NOVA UPLINK INITIATED:", { userMessage, telemetryAvailable: !!telemetry });
      const response = await chatWithCoach(conversationHistory, userMessage, dashboardContext)
      console.log("NOVA RESPONSE RECEIVED:", response.substring(0, 100) + "...");

      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      console.error("NOVA UPLINK FAILED:", {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error [${error.message}]. Please check your console for detailed telemetry diagnostics.` 
      }])
    } finally {      setIsLoading(false)
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

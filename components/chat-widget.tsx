"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [n8nEnabled, setN8nEnabled] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/chat/config")
        const data = await response.json()

        if (data.is_active) {
          setN8nEnabled(true)
          setMessages([
            {
              id: "1",
              text:
                data.greeting || "Hola! Soy el asistente virtual del Municipio de Chía. ¿En qué puedo ayudarte hoy?",
              sender: "bot",
              timestamp: new Date(),
            },
          ])
        } else {
          setMessages([
            {
              id: "1",
              text: "Hola! Soy el asistente virtual del Municipio de Chía. ¿En qué puedo ayudarte hoy?",
              sender: "bot",
              timestamp: new Date(),
            },
          ])
        }
      } catch (error) {
        console.error("Error loading chat config:", error)
        setMessages([
          {
            id: "1",
            text: "Hola! Soy el asistente virtual del Municipio de Chía. ¿En qué puedo ayudarte hoy?",
            sender: "bot",
            timestamp: new Date(),
          },
        ])
      }
    }
    loadConfig()
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setLoading(true)

    try {
      if (n8nEnabled) {
        // Send to N8n webhook
        const response = await fetch("/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: inputValue, history: messages }),
        })

        const data = await response.json()

        if (response.ok && data.response) {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.response,
            sender: "bot",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, botMessage])
        } else {
          throw new Error("No response from AI")
        }
      } else {
        // Fallback response
        setTimeout(() => {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Gracias por tu mensaje. El asistente virtual está en configuración. Para asistencia inmediata, por favor contacta a nuestros puntos PACO o llama al +57 (1) 123 4567.",
            sender: "bot",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, botMessage])
        }, 1000)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente o contacta a nuestros puntos PACO.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat de asistencia"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
          <span className="sr-only">Abrir chat</span>
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" aria-hidden="true" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          ref={chatRef}
          className="fixed bottom-6 right-6 w-[90vw] sm:w-96 h-[80vh] sm:h-[600px] shadow-2xl z-50 flex flex-col"
          role="dialog"
          aria-label="Chat de asistencia virtual"
          aria-modal="true"
        >
          <CardHeader className="flex-shrink-0 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Asistente Virtual</CardTitle>
                <CardDescription className="text-xs">
                  Municipio de Chía {n8nEnabled && "• AI Habilitado"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Cerrar chat">
                <X className="h-5 w-5" />
                <span className="sr-only">Cerrar chat</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" aria-live="polite" aria-atomic="false">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    role="article"
                    aria-label={`Mensaje de ${message.sender === "user" ? "usuario" : "asistente"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        <time dateTime={message.timestamp.toISOString()}>
                          {message.timestamp.toLocaleTimeString("es-CO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex-shrink-0 border-t border-border p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Escribe tu mensaje..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  aria-label="Escribe tu mensaje"
                  disabled={loading}
                />
                <Button size="icon" type="submit" disabled={!inputValue.trim() || loading} aria-label="Enviar mensaje">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Enviar mensaje</span>
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2" role="status">
                Presiona Enter para enviar
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

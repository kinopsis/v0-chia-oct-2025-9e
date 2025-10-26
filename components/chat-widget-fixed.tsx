"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Loader2, Wifi, WifiOff, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  status?: "sending" | "sent" | "delivered" | "error"
}

type ConnectionStatus = "connected" | "connecting" | "error" | "fallback" | "critical"

export function ChatWidgetFixed() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting")
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const sendControllerRef = useRef<AbortController | null>(null)

  // Circuit breaker para n8n
  const circuitBreaker = useRef({
    threshold: 3,
    timeout: 30000,
    lastFailure: null as number | null,
    isOpen: false
  })

  const maxRetries = 3

  // Cargar configuración inicial
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/chat/config")
        const data = await response.json()

        if (data.is_active) {
          setConnectionStatus("connected")
          setMessages([
            {
              id: "1",
              text: data.greeting || "Hola! Soy el asistente virtual del Municipio de Chía. ¿En qué puedo ayudarte hoy?",
              sender: "bot",
              timestamp: new Date(),
              status: "delivered"
            }
          ])
        } else {
          setConnectionStatus("fallback")
          setMessages([
            {
              id: "1",
              text: "Hola! Soy el asistente virtual del Municipio de Chía. ¿En qué puedo ayudarte hoy?",
              sender: "bot",
              timestamp: new Date(),
              status: "delivered"
            }
          ])
        }
      } catch (error) {
        console.error("Error loading chat config:", error)
        setConnectionStatus("error")
        setLastError("Error al cargar la configuración del chat")
      } finally {
        setIsInitialized(true)
      }
    }

    loadConfig()
  }, [])

  // Manejar clics fuera del chat
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

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    if (!isUserScrolledUp && messages.length > 0) {
      scrollToBottom("smooth")
    }
  }, [messages, isUserScrolledUp])

  // Manejar desplazamiento del usuario
  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100
    const wasUserScrolledUp = !isUserScrolledUp

    setIsUserScrolledUp(!isNearBottom)

    if (isNearBottom && unreadCount > 0) {
      setUnreadCount(0)
    }

    // Si el usuario está leyendo mensajes antiguos, no hacer auto-scroll
    if (!isNearBottom && wasUserScrolledUp !== !isNearBottom) {
      setUnreadCount(0)
    }
  }, [isUserScrolledUp, unreadCount])

  // Función para scroll suave
  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior })
    }
  }

  // Verificar si el circuit breaker está activo
  const isCircuitBreakerOpen = () => {
    if (!circuitBreaker.current.isOpen) return false
    
    const timeSinceLastFailure = Date.now() - (circuitBreaker.current.lastFailure || 0)
    if (timeSinceLastFailure > circuitBreaker.current.timeout) {
      // Resetear circuit breaker
      circuitBreaker.current.isOpen = false
      circuitBreaker.current.lastFailure = null
      return false
    }
    return true
  }

  // Enviar mensaje con manejo robusto de errores
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || connectionStatus === "critical") return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
      status: "sending"
    }

    setMessages(prev => [...prev, userMessage])
    setInputText("")
    setLastError(null)

    // Cancelar cualquier solicitud anterior
    sendControllerRef.current?.abort()
    sendControllerRef.current = new AbortController()

    try {
      setConnectionStatus("connecting")

      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: sendControllerRef.current.signal,
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-5).map(msg => ({
            text: msg.text,
            sender: msg.sender
          }))
        })
      })

      const data = await response.json()

      if (response.ok && data.response) {
        setRetryCount(0)
        circuitBreaker.current.lastFailure = null
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: "bot",
          timestamp: new Date(),
          status: "delivered"
        }

        setMessages(prev => [...prev.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: "delivered" as const } : msg
        ), botMessage])
        
        setConnectionStatus("connected")
      } else {
        throw new Error(data.error || "No response from AI")
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      
      // Actualizar estado de error del mensaje
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: "error" } : msg
      ))

      // Manejo de errores con circuit breaker
      const shouldOpenCircuitBreaker = retryCount + 1 >= circuitBreaker.current.threshold
      
      if (shouldOpenCircuitBreaker) {
        circuitBreaker.current.isOpen = true
        circuitBreaker.current.lastFailure = Date.now()
        setConnectionStatus("critical")
        setLastError("Demasiados errores de conexión. Intenta más tarde.")
      } else {
        setRetryCount(prev => prev + 1)
        setConnectionStatus("error")
        setLastError(error.message || "Error al conectar con el asistente")
        
        // Modo fallback después de 2 errores
        if (retryCount >= 1) {
          setConnectionStatus("fallback")
          setTimeout(() => {
            const fallbackMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: "Gracias por tu mensaje. El asistente virtual está temporalmente no disponible. Para asistencia inmediata, por favor contacta a nuestros puntos PACO o llama al +57 (1) 123 4567.",
              sender: "bot",
              timestamp: new Date(),
              status: "delivered"
            }
            setMessages(prev => [...prev, fallbackMessage])
          }, 1000)
        }
      }
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || connectionStatus === "critical") return

    // Verificar circuit breaker
    if (isCircuitBreakerOpen()) {
      setLastError("Conexión en modo de seguridad. Intenta más tarde.")
      return
    }

    await sendMessage(inputText)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleRetryConnection = () => {
    setRetryCount(0)
    setLastError(null)
    setConnectionStatus("connecting")
    
    // Intentar enviar un mensaje de prueba
    sendMessage("¿Estás disponible?")
  }

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-3 w-3 text-green-500" />
      case "connecting":
        return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
      case "error":
      case "fallback":
        return <WifiOff className="h-3 w-3 text-red-500" />
      case "critical":
        return <AlertCircle className="h-3 w-3 text-red-600" />
      default:
        return null
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "AI Habilitado"
      case "connecting":
        return "Conectando..."
      case "error":
        return "Error de conexión"
      case "fallback":
        return "Modo degradado"
      case "critical":
        return "Conexión interrumpida"
      default:
        return ""
    }
  }

  if (!isInitialized) {
    return null
  }

  return (
    <>
      {/* Botón flotante con indicador de estado */}
      {!isOpen && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50 bg-primary hover:bg-primary-foreground hover:text-primary border-2 border-background group"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat de asistencia"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
          <span className="sr-only">Abrir chat</span>
          
          {/* Indicador de estado de conexión */}
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-background group-hover:bg-foreground">
            {getConnectionStatusIcon()}
          </div>
          
          {/* Animación de pulso cuando hay mensajes sin leer */}
          {unreadCount > 0 && (
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" aria-hidden="true" />
          )}
        </Button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <Card
          ref={chatRef}
          className="fixed bottom-6 right-6 w-[90vw] sm:w-96 h-[80vh] sm:h-[600px] shadow-2xl z-50 flex flex-col backdrop-blur-sm border-0"
          role="dialog"
          aria-label="Chat de asistencia virtual"
          aria-modal="true"
        >
          {/* Cabecera con estado de conexión */}
          <CardHeader className="flex-shrink-0 border-b border-border bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Asistente Virtual
                  <div className="flex items-center gap-1 text-xs">
                    {getConnectionStatusIcon()}
                    <span className="text-muted-foreground">{getConnectionStatusText()}</span>
                  </div>
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-1">
                  Municipio de Chía
                  {connectionStatus === "connected" && (
                    <span className="flex gap-1">
                      • AI Habilitado
                      {retryCount > 0 && <span>• {retryCount} errores</span>}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {connectionStatus === "error" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetryConnection}
                    disabled={retryCount >= maxRetries}
                    className="text-xs"
                  >
                    Reintentar
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Cerrar chat">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Cerrar chat</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Área de mensajes */}
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea
              className="flex-1 p-4"
              aria-live="polite"
              aria-atomic="false"
              onScroll={handleScroll}
              ref={scrollAreaRef}
            >
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} group/message`}
                    role="article"
                    aria-label={`Mensaje de ${message.sender === "user" ? "usuario" : "asistente"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-muted text-foreground rounded-tl-none"
                      } relative`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1 flex items-center justify-between">
                        <time dateTime={message.timestamp.toISOString()}>
                          {message.timestamp.toLocaleTimeString("es-CO", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </time>
                        {message.sender === "user" && message.status && (
                          <div className="flex items-center gap-1">
                            {message.status === "sending" && (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                            {message.status === "delivered" && (
                              <div className="h-3 w-3 rounded-full bg-green-500" />
                            )}
                            {message.status === "error" && (
                              <AlertCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Indicador de escritura */}
                {connectionStatus === "connecting" && messages.some(m => m.sender === "user" && m.status === "sending") && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground rounded-2xl px-4 py-3 rounded-tl-none">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Escribiendo...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Mensaje de error persistente */}
                {lastError && connectionStatus !== "connected" && (
                  <div className="flex justify-start">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3 rounded-tl-none">
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>{lastError}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Área de entrada */}
            <div className="flex-shrink-0 border-t border-border bg-background/95 p-4">
              {connectionStatus === "critical" ? (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">
                    El chat está temporalmente deshabilitado debido a múltiples errores de conexión.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Intenta nuevamente en unos minutos.
                  </p>
                </div>
              ) : (
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder={
                        connectionStatus === "fallback" 
                          ? "Escribe tu mensaje (modo degradado)..." 
                          : "Escribe tu mensaje..."
                      }
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                      aria-label="Escribe tu mensaje"
                      disabled={connectionStatus === "critical" || !isInitialized}
                    />
                    <Button 
                      size="icon" 
                      type="submit" 
                      disabled={!inputText.trim() || connectionStatus === "critical"}
                      aria-label="Enviar mensaje"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Enviar mensaje</span>
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {connectionStatus === "connected" 
                      ? "Presiona Enter para enviar" 
                      : connectionStatus === "fallback"
                      ? "Modo degradado - respuestas estáticas"
                      : "Conexión en progreso..."}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
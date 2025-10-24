"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, TestTube } from "lucide-react"

interface N8nConfig {
  id?: number
  webhook_url: string
  api_key?: string
  is_active: boolean
  timeout_seconds: number
  max_retries: number
  custom_prompts: {
    system_prompt?: string
    greeting?: string
  }
}

interface N8nConfigFormProps {
  initialConfig: N8nConfig | null
}

export function N8nConfigForm({ initialConfig }: N8nConfigFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [config, setConfig] = useState<N8nConfig>(
    initialConfig || {
      webhook_url: "",
      api_key: "",
      is_active: false,
      timeout_seconds: 30,
      max_retries: 3,
      custom_prompts: {
        system_prompt:
          "Eres un asistente virtual del Municipio de Chía. Ayuda a los ciudadanos con información sobre trámites y servicios municipales.",
        greeting: "Hola, soy el asistente virtual de la Alcaldía de Chía. ¿En qué puedo ayudarte hoy?",
      },
    },
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/n8n-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Configuración guardada exitosamente" })
        router.refresh()
      } else {
        const data = await response.json()
        setMessage({ type: "error", text: data.error || "Error al guardar configuración" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al guardar configuración" })
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/n8n-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhook_url: config.webhook_url, api_key: config.api_key }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Conexión exitosa con N8n" })
      } else {
        setMessage({ type: "error", text: data.error || "Error al conectar con N8n" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al probar conexión" })
    } finally {
      setTesting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_active">Habilitar Integración</Label>
            <p className="text-sm text-gray-500 dark:text-gray-400">Activa o desactiva el asistente virtual</p>
          </div>
          <Switch
            id="is_active"
            checked={config.is_active}
            onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook_url">URL del Webhook N8n *</Label>
          <Input
            id="webhook_url"
            type="url"
            placeholder="https://your-n8n-instance.com/webhook/chat"
            value={config.webhook_url}
            onChange={(e) => setConfig({ ...config, webhook_url: e.target.value })}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            URL del webhook de N8n que procesará las consultas del chat
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="api_key">API Key (Opcional)</Label>
          <Input
            id="api_key"
            type="password"
            placeholder="••••••••••••••••"
            value={config.api_key || ""}
            onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Clave de autenticación si tu webhook requiere seguridad adicional
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeout_seconds">Timeout (segundos)</Label>
            <Input
              id="timeout_seconds"
              type="number"
              min="5"
              max="120"
              value={config.timeout_seconds}
              onChange={(e) => setConfig({ ...config, timeout_seconds: Number.parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_retries">Reintentos Máximos</Label>
            <Input
              id="max_retries"
              type="number"
              min="0"
              max="10"
              value={config.max_retries}
              onChange={(e) => setConfig({ ...config, max_retries: Number.parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="system_prompt">Prompt del Sistema</Label>
          <Textarea
            id="system_prompt"
            rows={3}
            placeholder="Instrucciones para el asistente virtual..."
            value={config.custom_prompts.system_prompt || ""}
            onChange={(e) =>
              setConfig({
                ...config,
                custom_prompts: { ...config.custom_prompts, system_prompt: e.target.value },
              })
            }
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Define el comportamiento y personalidad del asistente
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="greeting">Mensaje de Bienvenida</Label>
          <Textarea
            id="greeting"
            rows={2}
            placeholder="Saludo inicial del asistente..."
            value={config.custom_prompts.greeting || ""}
            onChange={(e) =>
              setConfig({
                ...config,
                custom_prompts: { ...config.custom_prompts, greeting: e.target.value },
              })
            }
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </>
          )}
        </Button>

        <Button type="button" variant="outline" onClick={handleTest} disabled={testing || !config.webhook_url}>
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Probando...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              Probar Conexión
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

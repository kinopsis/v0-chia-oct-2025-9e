"use client"

/**
 * Chat Widget Loader
 *
 * - Injects the assistant overlay container div.
 * - Configures window.VG_CONFIG without user-specific data.
 * - Loads the external script once with `defer`.
 * - Safe for Next.js App Router (runs only on client via useEffect).
 */

import { useEffect } from "react"

declare global {
    interface Window {
        VG_CONFIG?: {
            ID: string
            region: string
            render: string
            stylesheets: string[]
        }
    }
}

export function ChatWidget() {
    useEffect(() => {
        if (typeof window === "undefined" || typeof document === "undefined") {
            return
        }

        // --- GLOBAL INTERCEPTION FOR CORS AUDIO ---
        const AUDIO_PATH = "/audio/notification.wav"
        const TARGET_URL_PART = "mixkit-correct-answer-tone-2870.wav"

        // 1. XMLHttpRequest Patch
        if (!(XMLHttpRequest.prototype as any)._isPatched) {
            const originalOpen = XMLHttpRequest.prototype.open
            XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...args: any[]) {
                const urlStr = url.toString()
                if (urlStr.includes(TARGET_URL_PART)) {
                    console.log("[ChatWidget] Intercepting XHR audio:", urlStr)
                    return (originalOpen as any).apply(this, [method, AUDIO_PATH, ...args])
                }
                return (originalOpen as any).apply(this, [method, url, ...args])
            }
                ; (XMLHttpRequest.prototype as any)._isPatched = true
        }

        // 2. Fetch Patch
        if (!(window as any)._isFetchPatched) {
            const originalFetch = window.fetch
            window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
                let url = ""
                if (typeof input === "string") url = input
                else if (input instanceof URL) url = input.toString()
                else if (input instanceof Request) url = input.url

                if (url.includes(TARGET_URL_PART)) {
                    console.log("[ChatWidget] Intercepting Fetch audio:", url)
                    if (input instanceof Request) {
                        return originalFetch(new Request(AUDIO_PATH, input), init)
                    }
                    return originalFetch(AUDIO_PATH, init)
                }
                return originalFetch(input, init)
            }
                ; (window as any)._isFetchPatched = true
        }

        // 3. Audio Constructor Patch
        if (!(window as any)._isAudioPatched) {
            const OriginalAudio = window.Audio
            window.Audio = function (src?: string) {
                if (src && src.includes(TARGET_URL_PART)) {
                    console.log("[ChatWidget] Intercepting Audio constructor:", src)
                    return new (OriginalAudio as any)(AUDIO_PATH)
                }
                return new (OriginalAudio as any)(src)
            } as any
                ; (window as any)._isAudioPatched = true
        }

        // Ensure container exists
        let container = document.getElementById("VG_OVERLAY_CONTAINER")
        if (!container) {
            container = document.createElement("div")
            container.id = "VG_OVERLAY_CONTAINER"
            container.style.width = "0"
            container.style.height = "0"
            document.body.appendChild(container)
        }

        // Configure global assistant config once (no sensitive/user data)
        if (!window.VG_CONFIG) {
            window.VG_CONFIG = {
                ID: "U0qAXJza8PmcwZEKkAen",
                region: "na",
                render: "bottom-right",
                stylesheets: ["https://vg-bunny-cdn.b-cdn.net/vg_live_build/styles.css"],
            }
        }

        // Avoid duplicate script injections on client-side navigation
        const existingScript = document.querySelector<HTMLScriptElement>(
            'script[src="https://vg-bunny-cdn.b-cdn.net/vg_live_build/vg_bundle.js"]',
        )

        if (!existingScript) {
            const script = document.createElement("script")
            script.src = "https://vg-bunny-cdn.b-cdn.net/vg_live_build/vg_bundle.js"
            script.defer = true
            // IMPORTANTE: crossorigin anonymous para compatibilidad con COEP header
            script.crossOrigin = "anonymous"
            // Integrity hash para seguridad (SRI - Subresource Integrity)
            // NOTA: Reemplazar con el hash real cuando se conozca
            // script.integrity = "sha384-..."
            document.body.appendChild(script)
        }
    }, [])

    // Render container to ensure it's present in the DOM tree early
    return <div id="VG_OVERLAY_CONTAINER" style={{ width: 0, height: 0 }} />
}

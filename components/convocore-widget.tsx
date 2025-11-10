"use client"

/**
 * CONVOCORE Widget Loader
 *
 * - Injects the VG overlay container div.
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

export function ConvocoreWidget() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return
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

    // Configure global VG_CONFIG once (no sensitive/user data)
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
      document.body.appendChild(script)
    }
  }, [])

  // Render container to ensure it's present in the DOM tree early
  return <div id="VG_OVERLAY_CONTAINER" style={{ width: 0, height: 0 }} />
}
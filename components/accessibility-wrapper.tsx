"use client"

import { useState, useRef } from "react"
import { AccessibilityMenu } from "@/components/accessibility-menu"

export function AccessibilityWrapper() {
    const [isOpen, setOpen] = useState(false)
    const triggerRef = useRef(null)

    return (
        <AccessibilityMenu
            isOpen={isOpen}
            onClose={() => setOpen(false)}
            triggerRef={triggerRef}
        />
    )
}

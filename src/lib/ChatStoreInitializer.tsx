"use client"

import React, { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useChatStore } from "@/lib/store/useChatStore"
import type { User } from "@/lib/types"

// Export the Zustand store hook for use in other components
export { useChatStore }

// Client-side component to initialize the chat store by restoring auth and managing WebSocket connections
export const ChatStoreInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Select specific store slices to minimize re-renders
  const token = useChatStore((s) => s.state.token)
  const setAuthFromLogin = useChatStore((s) => s.setAuthFromLogin)
  const connectSocket = useChatStore((s) => s.connectSocket)
  const pathname = usePathname()

  // Ref to ensure WebSocket connects only once per app lifecycle on /chat route
  const connectedOnceRef = React.useRef(false)

  // Restore authentication from localStorage on component mount
  useEffect(() => {
    // Skip during SSR to avoid window undefined errors
    if (typeof window === "undefined") return

    try {
      const token = localStorage.getItem("chat_app_token")
      const userData = localStorage.getItem("chat_app_user")

      if (!token || !userData) {
        console.debug("No auth data found in localStorage")
        return
      }

      const user = JSON.parse(userData) as User
      // Validate user object has required fields
      if (!user.id || !user.username) {
        throw new Error("Invalid user data in localStorage")
      }

      setAuthFromLogin(user, token)
      console.debug("Auth restored successfully")
    } catch (error) {
      // Log specific error for debugging without crashing
      console.error("Failed to restore auth from localStorage:", error instanceof Error ? error.message : "Unknown error")
      // Optionally clear corrupted data
      try {
        localStorage.removeItem("chat_app_token")
        localStorage.removeItem("chat_app_user")
      } catch (clearError) {
        console.warn("Failed to clear localStorage:", clearError)
      }
    }
    // Empty deps ensure this runs only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Connect WebSocket when token is available and user navigates to /chat
  useEffect(() => {
    try {
      // Reset connection flag if no token (e.g., after logout)
      if (!token) {
        connectedOnceRef.current = false
        console.debug("No token, skipping WebSocket connection")
        return
      }

      // Connect only on first visit to /chat route
      if (pathname && pathname.startsWith("/chat") && !connectedOnceRef.current) {
        connectedOnceRef.current = true
        connectSocket()
        console.debug("WebSocket connection initiated")
      }
    } catch (error) {
      // Log error but allow app to continue
      console.error("Failed to initialize WebSocket connection:", error instanceof Error ? error.message : "Unknown error")
      connectedOnceRef.current = false // Allow retry on next path change
    }
    // Dependencies limited to token and pathname for efficiency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, pathname])

  // Render children without adding DOM overhead
  return <>{children}</>
}
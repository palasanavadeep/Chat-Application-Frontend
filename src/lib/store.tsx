"use client"

import React, { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useChatStore } from "@/lib/store/useChatStore"
import type { User } from "@/lib/types"


export {useChatStore};



// A small client component that initializes store (restores auth from localStorage)
export const ChatStoreInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
		const token = useChatStore((s) => s.state.token)
		const setAuthFromLogin = useChatStore((s) => s.setAuthFromLogin)
		const connectSocket = useChatStore((s) => s.connectSocket)
		const pathname = usePathname()
		const chatsLoaded = useChatStore((s) => s.state.chatsLoaded)
		// ensure we only connect once per app lifecycle when we first land on /chat
		const connectedOnceRef = React.useRef(false)

	// restore auth on mount
	useEffect(() => {
		try {
			if (typeof window === "undefined") return
			const tok = localStorage.getItem("chat_app_token")
			const u = localStorage.getItem("chat_app_user")
			if (tok && u) {
				const user = JSON.parse(u) as User
				setAuthFromLogin(user, tok)
			}
		} catch (e) {}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

		// connect once when we have a token and are on /chat. We intentionally include pathname
		// in the check but guard with connectedOnceRef so this effect will not reconnect on every
		// URL change inside /chat.
		useEffect(() => {
			try {
				if (!token) {
					connectedOnceRef.current = false
					return
				}
				if (pathname && pathname.startsWith("/chat") && !connectedOnceRef.current) {
					connectedOnceRef.current = true
					connectSocket()
				}
				// if the socket isn't available but chats aren't loaded, attempt to load via store
				// this covers the case where you want conversations available immediately
				if (token && pathname && pathname.startsWith("/chat") && !chatsLoaded) {
					try {
						useChatStore.getState().loadChats()
					} catch (e) {}
				}
			} catch (e) {}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [token, pathname])

	return <>{children}</>
}


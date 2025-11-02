"use client"

import {create} from "zustand"
import type { User, ChatState, Conversation, Message } from "@/lib/types"
import { initialState, reducer } from "@/lib/store/reducer"
import { createWebSocket } from "@/lib/store/ws"
import type { Action } from "@/lib/store/reducer"
// reducer and initialState are now provided by './reducer'

type StoreContextType = {
  state: ChatState
  // auth
  setAuthFromLogin: (user: User, token: string) => void
  clearAuth: () => void
  // ui
  setActiveConversation: (convId?: string | null) => void
  // search results helpers
  setSearchResults: (users: User[]) => void
  clearSearchResults: () => void
  // socket
  connectSocket: () => void
  disconnectSocket: () => void
  // actions
  addMessage: (convId: string, message: Message) => void
  addOrUpdateConversation: (conv: Conversation) => void
  editMessage: (convId: string, message: Message) => void
  deleteMessage: (convId: string, messageId: string) => void
  removeConversation: (convId: string) => void
  loadChats: () => Promise<void>
  loadMessages: (convId: string) => void
  setConversationFilter: (filter: "all" | "group" | "personal" | "broadcast") => void
  // send an arbitrary websocket action (client -> server); returns true if sent
  sendSocketAction: (action: string, data?: unknown) => boolean
}

// module-scoped refs for websocket and pending requests (persist across hook calls)
let wsRef: WebSocket | null = null
let reconnectCounter = 0

const useChatStore = create<StoreContextType>((set, get) => (
  {

  state: initialState,

  // auth
  setAuthFromLogin: (user: User, token: string) => {
    const safeUser: User = { ...user }
    try {
      if (Object.prototype.hasOwnProperty.call(safeUser, "password")) {
        try {
          delete (safeUser as unknown as Record<string, unknown>).password
        } catch (e) {}
      }
    } catch (e) {}
    set((s) => ({ state: { ...s.state, user: safeUser, token } }))
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("chat_app_user", JSON.stringify(safeUser))
        localStorage.setItem("chat_app_token", token)
      }
    } catch (e) {}
  },

  clearAuth: () => {
    try {
      if (wsRef) {
        try {
          wsRef.close()
        } catch (e) {}
        wsRef = null
      }
    } catch (e) {}
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("chat_app_user")
        localStorage.removeItem("chat_app_token")
      }
    } catch (e) {}
    set(() => ({ state: { ...initialState } }))
  },

  // socket management
  connectSocket: () => {
    const token = get().state.token
    if (!token) return
    try {
      if (wsRef) wsRef.close()
    } catch (e) {}
    try {
      const ws = createWebSocket(token)
      wsRef = ws

      ws.onopen = () => {
        reconnectCounter = 0
        set((s) => ({ state: { ...s.state, socketConnected: true } }))
        try {
          ws.send(JSON.stringify({ action: "getUserConversations", data: {} }))
        } catch (e) {
          // no REST fallback per request
        }
      }

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data)
          const type = data.type ?? data.action
          const payload = data.payload ?? data.data ?? data
          // request-response (requestId) support removed — server should push events

          switch (type) {
            case "searchUserResponse": {
              console.log(payload);
              const users = Array.isArray(payload) ? payload : payload.users ?? []
              set((s) => ({ state: reducer(s.state, { type: "SET_SEARCH_RESULTS", users } as Action) }))
              break
            }
            case "getUserByUsername": {
              // server returns a single user object or null
              const u = payload ?? null
              const users = u ? [u] : []
              set((s) => ({ state: reducer(s.state, { type: "SET_SEARCH_RESULTS", users } as Action) }))
              break
            }
            case "new_message":
              set((s) => ({ state: reducer(s.state, { type: "ADD_MESSAGE", convId: payload.convId, message: payload.message } as Action) }))
              break
            case "new_conversation":
              set((s) => ({ state: reducer(s.state, { type: "ADD_OR_UPDATE_CONVERSATION", conv: payload.conversation } as Action) }))
              break
            case "edited_message":
              set((s) => ({ state: reducer(s.state, { type: "EDIT_MESSAGE", convId: payload.convId, message: payload.message } as Action) }))
              break
            case "deleted_message":
              set((s) => ({ state: reducer(s.state, { type: "DELETE_MESSAGE", convId: payload.convId, messageId: payload.messageId } as Action) }))
              break
            case "removed_from_conversation":
              set((s) => ({ state: reducer(s.state, { type: "REMOVE_CONVERSATION", convId: payload.convId } as Action) }))
              break
            case "getAllMessagesResponse": {
              const messages: Message[] = Array.isArray(payload) ? payload : payload.messages ?? []
              let convId: string | undefined = payload.conversationId ?? payload.convId
              if (!convId && Array.isArray(payload) && payload.length) {
                // some message payloads include conversationId; use a guarded access
                const first = payload[0] as unknown as Record<string, unknown>
                convId = (first.conversationId as string | undefined) ?? (first.convId as string | undefined)
              }
              if (convId) set((s) => ({ state: reducer(s.state, { type: "LOAD_MESSAGES", convId, messages } as Action) }))
              break
            }
            case "getUserConversationsResponse": {
              const convs = Array.isArray(payload) ? payload : payload.conversations ?? []
              set((s) => ({ state: reducer(s.state, { type: "LOAD_CHATS", conversations: convs, chats: {} } as Action) }))
              break
            }
            case "getConversationResponse": {
              const conv = payload
              if (conv) set((s) => ({ state: reducer(s.state, { type: "ADD_OR_UPDATE_CONVERSATION", conv } as Action) }))
              break
            }
            case "getProfileResponse": {
              const prof = payload
              const curUser = get().state.user
              if (prof && curUser && prof.id === curUser.id) {
                const safeProf: User = { ...prof }
                try {
                  if (Object.prototype.hasOwnProperty.call(safeProf, "password")) {
                      try {
                      delete (safeProf as unknown as Record<string, unknown>).password
                    } catch (e) {}
                  }
                } catch (e) {}
                set((s) => ({ state: reducer(s.state, { type: "SET_AUTH", user: safeProf, token: s.state.token ?? "" } as Action) }))
                try {
                  if (typeof window !== "undefined") localStorage.setItem("chat_app_user", JSON.stringify(safeProf))
                } catch (e) {}
              }
              break
            }
            default:
              break
          }
        } catch (err) {
          // ignore
        }
      }

      ws.onclose = () => {
        set((s) => ({ state: { ...s.state, socketConnected: false } }))
        wsRef = null
        reconnectCounter = reconnectCounter + 1
        const delay = Math.min(30000, 1000 * Math.pow(2, reconnectCounter))
        setTimeout(() => {
          const tokenNow = get().state.token
          if (tokenNow) get().connectSocket()
        }, delay)
      }

      ws.onerror = () => {
        // let onclose handle
      }
    } catch (e) {
      // ignore connect errors
    }
  },

  disconnectSocket: () => {
    try {
      if (wsRef) wsRef.close()
    } catch (e) {}
    wsRef = null
    set((s) => ({ state: { ...s.state, socketConnected: false } }))
  },

  // UI helpers
  setActiveConversation: (convId?: string | null) => {
    set((s) => ({ state: reducer(s.state, { type: "SET_ACTIVE_CONVERSATION", convId } as Action) }))
    try {
      if (convId) get().loadMessages(convId)
    } catch (e) {}
  },

  // actions
  addMessage: (convId: string, message: Message) => set((s) => ({ state: reducer(s.state, { type: "ADD_MESSAGE", convId, message } as Action) })),
  addOrUpdateConversation: (conv: Conversation) => set((s) => ({ state: reducer(s.state, { type: "ADD_OR_UPDATE_CONVERSATION", conv } as Action) })),
  editMessage: (convId: string, message: Message) => set((s) => ({ state: reducer(s.state, { type: "EDIT_MESSAGE", convId, message } as Action) })),
  deleteMessage: (convId: string, messageId: string) => set((s) => ({ state: reducer(s.state, { type: "DELETE_MESSAGE", convId, messageId } as Action) })),
  removeConversation: (convId: string) => set((s) => ({ state: reducer(s.state, { type: "REMOVE_CONVERSATION", convId } as Action) })),

  // search results helpers
  setSearchResults: (users: User[]) => {
    set((s) => ({ state: reducer(s.state, { type: "SET_SEARCH_RESULTS", users } as Action) }))
  },
  clearSearchResults: () => {
    set((s) => ({ state: reducer(s.state, { type: "SET_SEARCH_RESULTS", users: [] } as Action) }))
  },

  loadChats: async () => {
    const token = get().state.token
    if (!token) return
    try {
      const ws = wsRef
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: "getUserConversations", data: {} }))
      }
    } catch (e) {}
  },

  loadMessages: (convId: string) => {
    try {
      const ws = wsRef
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: "getAllMessages", data: { conversationId: convId } }))
      }
    } catch (e) {}
  },

  setConversationFilter: (filter: "all" | "group" | "personal" | "broadcast") => set((s) => ({ state: reducer(s.state, { type: "SET_CONVERSATION_FILTER", filter } as Action) })),

  sendSocketAction: (action: string, data: unknown = {}) => {
    try {
      const ws = wsRef
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action, data }))
        return true
      }
    } catch (e) {}
    return false
  },

  // request/response RPC removed (no sendSocketActionRequest)
}))

export { useChatStore }

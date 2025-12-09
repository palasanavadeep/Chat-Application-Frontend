import type { ChatState, Conversation, Message, User, ConversationParticipant } from "@/lib/types"

// Initial state for the chat store, defining default values
export const initialState: ChatState = {
  user: null,
  token: null,
  socketConnected: false,
  conversations: [],
  chats: {},
  conversationFilter: "all",
  activeConversationId: null,
  chatsLoaded: false,
}

// Sorts conversations by last message timestamp (descending order)
export function sortConversations(convs: Conversation[]) {
  return convs.sort((a, b) => {
    const aa = a.lastMessage?.createdAt ?? ""
    const bb = b.lastMessage?.createdAt ?? ""
    return bb.localeCompare(aa)
  })
}

// Union type for all possible reducer actions
type Action =
  | { type: "SET_AUTH"; user: User; token: string }
  | { type: "CLEAR_AUTH" }
  | { type: "SOCKET_CONNECTED" }
  | { type: "SOCKET_DISCONNECTED" }
  | { type: "SET_CONVERSATION_FILTER"; filter: "all" | "group" | "personal" | "broadcast" }
  | { type: "LOAD_CHATS"; conversations: Conversation[]; chats: Record<string, Message[]> }
  | { type: "LOAD_MESSAGES"; convId: string; messages: Message[] }
  | { type: "ADD_OR_UPDATE_CONVERSATION"; conv: Conversation }
  | { type: "REMOVE_CONVERSATION"; convId: string }
  | { type: "ADD_MESSAGE"; convId: string; message: Message }
  | { type: "EDIT_MESSAGE"; convId: string; message: Message }
  | { type: "DELETE_MESSAGE"; convId: string; messageId: string }
  | { type: "SET_SEARCH_RESULTS"; users: User[] }
  | { type: "SET_ACTIVE_CONVERSATION"; convId?: string | null }
  | { type: "ADD_PARTICIPANT"; convId: string | number; participant: ConversationParticipant }
  | { type: "UPDATE_PARTICIPANT"; convId: string | number; participant: ConversationParticipant }
  | { type: "REMOVE_PARTICIPANT"; convId: string | number; participantId: string | number }

// Reducer function to handle state updates based on actions
export function reducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    // Sets user and token for authentication
    case "SET_AUTH":
      return { ...state, user: action.user, token: action.token }

    // Clears all state, resetting to initial values
    case "CLEAR_AUTH":
      return { ...initialState }

    // Marks WebSocket as connected
    case "SOCKET_CONNECTED":
      return { ...state, socketConnected: true }

    // Marks WebSocket as disconnected
    case "SOCKET_DISCONNECTED":
      return { ...state, socketConnected: false }

    // Loads initial conversations and chats, sets chatsLoaded flag
    case "LOAD_CHATS":
      return {
        ...state,
        conversations: [...action.conversations],
        chats: { ...action.chats },
        chatsLoaded: true,
    }

    // Loads messages for a conversation, updates lastMessage
    case "LOAD_MESSAGES": {
      const { convId, messages } = action
      const chats = { ...state.chats }
      chats[convId] = messages

      const last = messages.length ? messages[messages.length - 1] : null
      const existing = state.conversations.filter((c) => c.id !== convId)
      const convFromState = state.conversations.find((c) => c.id === convId)
      const conv: Conversation = convFromState
        ? { ...convFromState, lastMessage: last }
        : {
            id: convId,
            type: { id: 0, lookupCode: "PERSONAL", lookupName: "Personal" },
            conversationParticipants: [],
            lastMessage: last,
          }
      // Prepend new/updated conv (defer sorting for perf)
      const conversations = [conv, ...existing]
      return { ...state, chats }
    }

    // // Loads messages for a conversation, updates lastMessage
    // case "LOAD_MESSAGES": {
    //   const { convId, messages } = action
    //   const chats = { ...state.chats }
    //   chats[convId] = messages

    //   const last = messages.length ? messages[messages.length - 1] : null
    //   const convFromState = state.conversations.find((c) => c.id === convId)
    //   const conv: Conversation = convFromState
    //     ? { ...convFromState, lastMessage: last }
    //     : {
    //         id: convId,
    //         type: { id: 0, lookupCode: "PERSONAL", lookupName: "Personal" },
    //         conversationParticipants: [],
    //         lastMessage: last,
    //       }

    //   // Update or add conversation in place, preserving order
    //   const conversations = convFromState
    //     ? state.conversations.map((c) =>
    //         c.id === convId ? conv : c
    //       )
    //     : [...state.conversations, conv]

    //   return { ...state, chats, conversations }
    // }

    // Sets the conversation filter (e.g., all, group)
    case "SET_CONVERSATION_FILTER":
      return { ...state, conversationFilter: action.filter
    }

    // Adds or updates a conversation, prepending to list
    case "ADD_OR_UPDATE_CONVERSATION": {
      const existing = state.conversations.filter((c) => c.id !== action.conv.id)
      // Prepend for quick insert (defer sorting)
      return { ...state, conversations: [action.conv, ...existing] }
    }

    // Removes a conversation and its messages
    case "REMOVE_CONVERSATION": {
      const convs = state.conversations.filter((c) => c.id !== action.convId)
      const chats = { ...state.chats }
      delete chats[action.convId]
      return { ...state, conversations: convs, chats }
    }

    // Adds a message to a conversation, updates unread status
    case "ADD_MESSAGE": {
      const { convId, message } = action
      // Update messages for the conversation
      const prevMsgs = state.chats[convId] ?? []
      const chats = {
        ...state.chats,
        [convId]: [...prevMsgs, message],
      }

      // Update or create conversation
      const existingConv = state.conversations.find((c) => c.id === convId)
      let conv: Conversation
      if (existingConv) {
        conv = { ...existingConv, lastMessage: message }
      } else {
        conv = {
          id: convId,
          type: { id: 0, lookupCode: "PERSONAL", lookupName: "Personal" },
          conversationParticipants: [],
          lastMessage: message,
        }
      }

      // Handle unread logic
      const isActive = String(state.activeConversationId) === String(convId)
      conv = {
        ...conv,
        hasUnreadMessages: !isActive,
        unreadCount: !isActive ? (conv.unreadCount ?? 0) + 1 : 0,
      }

      // Move conv to top
      const updatedConversations = [
        conv,
        ...state.conversations.filter((c) => c.id !== convId),
      ]

      return {
        ...state,
        chats,
        conversations: updatedConversations,
      }
    }

    // Edits a message and updates lastMessage if needed
    case "EDIT_MESSAGE": {
      const { convId, message } = action
      const chats = { ...state.chats }
      const msgs = chats[convId] ? [...chats[convId]] : []
      const idx = msgs.findIndex((m) => m.id === message.id)
      if (idx >= 0) msgs[idx] = { ...msgs[idx], ...message }
      chats[convId] = msgs

      // Update lastMessage if edited message is the latest
      const conversations = state.conversations.map((c) =>
        c.id === convId && c.lastMessage?.id === message.id
          ? { ...c, lastMessage: message }
          : c
      )
      return { ...state, chats, conversations }
    }

    // Deletes a message and updates lastMessage if needed
    case "DELETE_MESSAGE": {
      const { convId, messageId } = action
      const chats = { ...state.chats }
      const msgs = chats[convId]
        ? state.chats[convId].filter((m) => m.id !== messageId)
        : []
      chats[convId] = msgs

      // Update lastMessage for the conversation
      const conversations = state.conversations.map((c) => {
        if (c.id !== convId) return c
        const last = msgs.length ? msgs[msgs.length - 1] : null
        return { ...c, lastMessage: last }
      })
      return { ...state, chats, conversations }
    }

    // Sets search results for user search
    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.users }

    // Sets active conversation and clears its unread indicators
    case "SET_ACTIVE_CONVERSATION": {
      const convId = action.convId ?? null
      const conversations = state.conversations.map((c) =>
        c.id === convId
          ? { ...c, hasUnreadMessages: false, unreadCount: 0 }
          : c
      )
      return { ...state, activeConversationId: convId, conversations }
    }

    // Adds a participant to a conversation
    case "ADD_PARTICIPANT": {
      const { convId, participant } = action
      const conversations = state.conversations.map((c) => {
        if (String(c.id) !== String(convId)) return c
        const participants = c.conversationParticipants
          ? [...c.conversationParticipants]
          : []
        // Prevent duplicates by checking participant.id or user.id
        const exists = participants.find(
          (p) =>
            String(p.id) === String(participant.id) ||
            String(p.user?.id) === String(participant.user?.id)
        )
        if (exists) return c
        return { ...c, conversationParticipants: [...participants, participant] }
      })
      return { ...state, conversations }
    }

    // Updates a participant's details in a conversation
    case "UPDATE_PARTICIPANT": {
      const { convId, participant } = action
      const conversations = state.conversations.map((c) => {
        if (String(c.id) !== String(convId)) return c
        const participants = (c.conversationParticipants ?? []).map((p) =>
          String(p.id) === String(participant.id) ||
          String(p.user?.id) === String(participant.user?.id)
            ? { ...p, ...participant }
            : p
        )
        return { ...c, conversationParticipants: participants }
      })
      return { ...state, conversations }
    }

    // Removes a participant from a conversation
    case "REMOVE_PARTICIPANT": {
      const { convId, participantId } = action
      const conversations = state.conversations.map((c) => {
        if (String(c.id) !== String(convId)) return c
        const participants = (c.conversationParticipants ?? []).filter(
          (p) =>
            !(
              String(p.id) === String(participantId) ||
              String(p.user?.id) === String(participantId)
            )
        )
        return { ...c, conversationParticipants: participants }
      })
      return { ...state, conversations }
    }

    

    // Return unchanged state for unknown actions
    default:
      return state
  }
}

export type { Action }
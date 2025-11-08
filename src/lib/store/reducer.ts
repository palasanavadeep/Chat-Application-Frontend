import type { ChatState, Conversation, Message, User } from "@/lib/types"

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

export function sortConversations(convs: Conversation[]) {
  return convs.sort((a, b) => {
    const aa = a.lastMessage?.createdAt ?? ""
    const bb = b.lastMessage?.createdAt ?? ""
    return bb.localeCompare(aa)
  })
}

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

export function reducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case "SET_AUTH":
      return { ...state, user: action.user, token: action.token }
    case "CLEAR_AUTH":
      return { ...initialState }
    case "SOCKET_CONNECTED":
      return { ...state, socketConnected: true }
    case "SOCKET_DISCONNECTED":
      return { ...state, socketConnected: false }
    case "LOAD_CHATS":
      return {
        ...state,
        conversations: [...action.conversations],
        chats: { ...action.chats },
        chatsLoaded: true,
      }
    case "LOAD_MESSAGES": {
      const { convId, messages } = action
      const chats = { ...state.chats }
      chats[convId] = messages

      const last = messages.length ? messages[messages.length - 1] : null
      const existing = state.conversations.filter((c) => c.id !== convId)
      const convFromState = state.conversations.find((c) => c.id === convId)
      const conv: Conversation = convFromState
        ? { ...convFromState, lastMessage: last }
  : { id: convId, type: { id: 0, lookupCode: "PERSONAL", lookupName: "Personal" }, conversationParticipants: [], lastMessage: last }
      // const conversations = sortConversations([conv, ...existing])
      const conversations = [conv, ...existing];
      return { ...state, chats }
    }

  //   case "LOAD_MESSAGES": {
  //     const { convId, messages } = action
  //     const chats = { ...state.chats }
  //     chats[convId] = messages

  //     const last = messages.length ? messages[messages.length - 1] : null
  //     // const existing = state.conversations.filter((c) => c.id !== convId)
  //     const convFromState = state.conversations.find((c) => c.id === convId)
  //     const conv: Conversation = convFromState
  //       ? { ...convFromState, lastMessage: last }
  // : { id: convId, type: { id: 0, lookupCode: "PERSONAL", lookupName: "Personal" }, conversationParticipants: [], lastMessage: last }
  //     // const conversations = sortConversations([conv, ...existing])
  //     // const conversations = [conv, ...existing];
  //     return { ...state, chats }
  //   }

  
    case "SET_CONVERSATION_FILTER": {
      return { ...state, conversationFilter: action.filter }
    }
    case "ADD_OR_UPDATE_CONVERSATION": {
      const existing = state.conversations.filter((c) => c.id !== action.conv.id)
      // const updated = sortConversations([action.conv, ...existing])
      return { ...state, conversations: [action.conv, ...existing] }
    }
    case "REMOVE_CONVERSATION": {
      const convs = state.conversations.filter((c) => c.id !== action.convId)
      const chats = { ...state.chats }
      delete chats[action.convId]
      return { ...state, conversations: convs, chats }
    }
    // case "ADD_MESSAGE": {
    //   const { convId, message } = action
    //   const chats = { ...state.chats }
    //   const msgs = chats[convId] ? [...chats[convId]] : []
    //   msgs.push(message)
    //   chats[convId] = msgs

    //   const convIndex = state.conversations.findIndex((c) => c.id === convId)
    //   let conv: Conversation
    //   if (convIndex >= 0) {
    //     conv = { ...state.conversations[convIndex], lastMessage: message }
    //   } else {
    //     conv = { id: convId, type: { id: 0, lookupCode: "PERSONAL", lookupName: "Personal" }, conversationParticipants: [], lastMessage: message }
    //   }

    //   // if the incoming message is for a conversation that is not currently active,
    //   // mark it as having unread messages and increment unreadCount. If the conversation
    //   // is active, clear unread indicators.
    //   try {
    //     const isActive = String(state.activeConversationId) === String(convId)
    //     if (!isActive) {
    //       conv = { ...conv, hasUnreadMessages: true, unreadCount: (conv.unreadCount ?? 0) + 1 }
    //     } else {
    //       conv = { ...conv, hasUnreadMessages: false, unreadCount: 0 }
    //     }
    //   } catch (e) {
    //     // ignore
    //   }
    //   const otherConvs = state.conversations.filter((c) => c.id !== convId)
    //   // const conversations = sortConversations([conv, ...otherConvs])
    //   const conversations = state.conversations;

    //   return { ...state, chats, conversations }
    // }
    // case "ADD_MESSAGE": {
    //   const { convId, message } = action
    //   const chats = { ...state.chats }
    //   const msgs = chats[convId] ? [...chats[convId]] : []
    //   msgs.push(message)
    //   chats[convId] = msgs

    //   // find existing conversation
    //   const convIndex = state.conversations.findIndex((c) => c.id === convId)
    //   let conv: Conversation

    //   if (convIndex >= 0) {
    //     conv = { ...state.conversations[convIndex], lastMessage: message }
    //   } else {
    //     conv = {
    //       id: convId,
    //       type: { id: 0, lookupCode: "PERSONAL", lookupName: "Personal" },
    //       conversationParticipants: [],
    //       lastMessage: message,
    //     }
    //   }

    //   // unread logic
    //   try {
    //     const isActive = String(state.activeConversationId) === String(convId)
    //     if (!isActive) {
    //       conv = {
    //         ...conv,
    //         hasUnreadMessages: true,
    //         unreadCount: (conv.unreadCount ?? 0) + 1,
    //       }
    //     } else {
    //       conv = { ...conv, hasUnreadMessages: false, unreadCount: 0 }
    //     }
    //   } catch (e) {}

    //   // ✅ properly update conversations array
    //   const updatedConversations = state.conversations.some((c) => c.id === convId)
    //     ? state.conversations.map((c) => (c.id === convId ? conv : c))
    //     : [...state.conversations, conv]

    //   // ✅ optionally sort by lastMessage.createdAt (most recent first)
    //   updatedConversations.sort((a, b) => {
    //     const aTime = a.lastMessage?.createdAt
    //       ? new Date(a.lastMessage.createdAt).getTime()
    //       : 0
    //     const bTime = b.lastMessage?.createdAt
    //       ? new Date(b.lastMessage.createdAt).getTime()
    //       : 0
    //     return bTime - aTime
    //   })

    //   return {
    //     ...state,
    //     chats,
    //     conversations: updatedConversations,
    //   }
    // }
    case "ADD_MESSAGE": {
      const { convId, message } = action;

      // Update only the affected chat messages
      const prevMsgs = state.chats[convId] ?? [];
      const chats = {
        ...state.chats,
        [convId]: [...prevMsgs, message],
      };

      // Find existing conversation
      const existingConv = state.conversations.find((c) => c.id === convId);
      let conv: Conversation;

      if (existingConv) {
        conv = { ...existingConv, lastMessage: message };
      } else {
        conv = {
          id: convId,
          type: { id: 0, lookupCode: "PERSONAL", lookupName: "Personal" },
          conversationParticipants: [],
          lastMessage: message,
        };
      }

      // Unread logic
      const isActive = String(state.activeConversationId) === String(convId);
      conv = {
        ...conv,
        hasUnreadMessages: !isActive,
        unreadCount: !isActive ? (conv.unreadCount ?? 0) + 1 : 0,
      };

      // Move this conversation to the top
      const updatedConversations = [
        conv,
        ...state.conversations.filter((c) => c.id !== convId),
      ];

      return {
        ...state,
        chats,
        conversations: updatedConversations,
      };
    }



    case "EDIT_MESSAGE": {
      const { convId, message } = action
      const chats = { ...state.chats }
      const msgs = chats[convId] ? [...chats[convId]] : []
      const idx = msgs.findIndex((m) => m.id === message.id)
      if (idx >= 0) msgs[idx] = { ...msgs[idx], ...message }
      chats[convId] = msgs

      const conversations = state.conversations.map((c) =>
        c.id === convId && c.lastMessage?.id === message.id ? { ...c, lastMessage: message } : c
      )
      return { ...state, chats, conversations }
    }
    case "DELETE_MESSAGE": {
      const { convId, messageId } = action
      const chats = { ...state.chats }
      const msgs = chats[convId] ? state.chats[convId].filter((m) => m.id !== messageId) : []
      chats[convId] = msgs

      const conversations = state.conversations.map((c) => {
        if (c.id !== convId) return c
        const last = msgs.length ? msgs[msgs.length - 1] : null
        return { ...c, lastMessage: last }
      })
      return { ...state, chats, conversations }
    }
    case "SET_SEARCH_RESULTS": {
      return { ...state, searchResults: action.users }
    }
    case "SET_ACTIVE_CONVERSATION": {
      return { ...state, activeConversationId: action.convId ?? null }
    }
    default:
      return state
  }
}

export type { Action }

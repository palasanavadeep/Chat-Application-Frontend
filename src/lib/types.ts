export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface Message {
  id: string
  senderId: string
  content: string
  createdAt: string // ISO timestamp
  editedAt?: string | null
  deleted?: boolean
}

export interface Conversation {
  id: string
  title?: string
  members: string[]
  lastMessage?: Message | null
  // messages are stored separately in a map in the store but keep an optional small preview
  unreadCount?: number
}

export interface ChatsMap {
  [conversationId: string]: Message[]
}

export interface ChatState {
  user?: User | null
  token?: string | null
  socketConnected: boolean
  conversations: Conversation[]
  chats: ChatsMap
}

export type SocketEventPayload = any

export interface AttachmentType {
  id: number
  lookupName: string
  lookupCategory: string
  lookupCode: string
}

export interface ProfileImage {
  id: number
  attachmentType: AttachmentType
  file: string // base64 or path
}

export interface User {
  id: number | string
  createdAt?: string | null
  username?: string
  displayName?: string
  profileImage?: ProfileImage | null
  status?: boolean
  lastSeenAt?: string | null
  email?: string
  // password may be returned by the backend in this repo but we do NOT persist it to localStorage
  password?: string
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
  createdAt?: string
  // title/name for group conversations
  name?: string
  title?: string
  type?: string // e.g. 'personal' | 'group' | 'broadcast' or lookup object
  description?: string | null
  conversationImage?: ProfileImage | null
  createdBy?: User
  conversationParticipants?: ConversationParticipant[]
  members?: string[]
  lastMessage?: Message | null
  // messages are stored separately in a map in the store but keep an optional small preview
  unreadCount?: number
  hasUnreadMessages?: boolean
}

export interface ConversationParticipant {
  id: number | string
  createdAt?: string | null
  user?: User
  role?: string
  leftAt?: string | null
  isMuted?: boolean
  isPinned?: boolean
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
  conversationFilter?: "all" | "group" | "personal" | "broadcast"
  // optional ad-hoc results for UI features like user search
  searchResults?: User[]
  // currently opened conversation id in the UI
  activeConversationId?: string | null
}

export type SocketEventPayload = unknown

// export interface AttachmentType {
//   id: number
//   lookupName: string
//   lookupCategory: string
//   lookupCode: string
// }

// export interface ProfileImage {
//   id: number
//   attachmentType: AttachmentType
//   file: string // base64 or path
// }

// export interface User {
//   id: number | string
//   createdAt?: string | null
//   username?: string
//   displayName?: string
//   profileImage?: ProfileImage | null
//   status?: boolean
//   lastSeenAt?: string | null
//   email?: string
//   // password may be returned by the backend in this repo but we do NOT persist it to localStorage
//   password?: string
// }

export interface Message {
  id: string
  sender: User
  body: string
  conversationId : string
  createdAt: string | null// ISO timestamp
  editedAt?: string | null
  attachment?: Attachment
}

export interface Conversation {
  id: number | string
  type: Lookup           // e.g. { id: 1, lookupCode: "PERSONAL", lookupName: "Personal Conversation" }
  name?: string | null
  description?: string | null
  conversationImage?: Attachment | null
  createdBy?: User
  createdAt?: string 
  conversationParticipants?: ConversationParticipant[]
  lastMessage?: Message | null
  hasUnreadMessages?: boolean
  unreadCount?: number
}

export interface ConversationParticipant {
  id: number | string
  createdAt: number | null
  user?: User
  role?: Lookup 
  leftAt?: string | null
  isMuted?: boolean
  isPinned?: boolean
}

export interface Lookup {
  id: number
  lookupName: string
  lookupCode: string
  lookupCategory?: string
}

export interface User {
  id: number
  username: string
  displayName?: string
  email?: string
  password?: string
  profileImage?: Attachment | null
  status?: 'ONLINE' | 'OFFLINE' | string
  lastSeenAt?: string
  createdAt?: string

}

export interface Attachment{
  id : number | string
  attachmentType?: Lookup
  file: string
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
  // whether the initial list of conversations was loaded from server
  chatsLoaded?: boolean
}

export type SocketEventPayload = unknown

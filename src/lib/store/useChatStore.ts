"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  User,
  ChatState,
  Conversation,
  Message,
  SocketPayload,
  ConversationParticipant,
} from "@/lib/types";
import { initialState, reducer } from "@/lib/store/reducer";
import { createWebSocket } from "@/lib/store/ws";
import type { Action } from "@/lib/store/reducer";
import { navigate } from "@/navigation";
import { getBase64StringFromFile } from "../utils";
import { toast } from "sonner";

// Interface defining the shape of the Zustand store
type StoreContextType = {
  state: ChatState;
  setAuthFromLogin: (user: User, token: string) => void; // Sets user auth
  clearAuth: () => void; // Clears auth and resets state
  setActiveConversation: (convId?: string | null) => void; // Sets active conversation
  setSearchResults: (users: User[]) => void; // Sets user search results
  clearSearchResults: () => void; // Clears search results
  connectSocket: () => void; // Establishes WebSocket connection
  disconnectSocket: () => void; // Closes WebSocket connection
  addMessage: (convId: string, message: Message) => void; // Adds a message
  addOrUpdateConversation: (conv: Conversation) => void; // Adds/updates a conversation
  editMessage: (convId: string, message: Message) => void; // Edits a message
  deleteMessage: (convId: string, messageId: string) => void; // Deletes a message
  removeConversation: (convId: string) => void; // Removes a conversation
  addNewParticipant: (convId: string | number, participant: ConversationParticipant) => void; // Adds a participant
  updateParticipant: (convId: string | number, participant: ConversationParticipant) => void; // Updates a participant
  removeParticipant: (convId: string | number, participantId: string | number) => void; // Removes a participant
  loadChats: () => Promise<void>; // Loads user conversations
  loadMessages: (convId: string) => void; // Loads messages for a conversation
  setConversationFilter: (filter: "all" | "group" | "personal" | "broadcast") => void; // Sets conversation filter
  sendSocketAction: (action: string, data?: unknown, fileObj?: File | null) => Promise<boolean>; // Sends WebSocket action
};

// Module-scoped refs for WebSocket and reconnect attempts
let wsRef: WebSocket | null = null;
let reconnectCounter = 0;

// Creates the Zustand store with devtools for debugging
const useChatStore = create<StoreContextType>()(
  devtools(
    (set, get) => ({
      state: initialState,

      // Sets user authentication, persists to localStorage
      setAuthFromLogin: (user: User, token: string) => {
        if (!user.id || !token) {
          console.error("Invalid auth data: missing user ID or token");
          return;
        }
        const safeUser: User = { ...user };
        try {
          // Remove password for security
          if ("password" in safeUser) {
            delete (safeUser as any).password;
          }
          set((s) => ({
            state: reducer(s.state, {
              type: "SET_AUTH",
              user: safeUser,
              token,
            } as Action),
          }));
          if (typeof window !== "undefined") {
            localStorage.setItem("chat_app_user", JSON.stringify(safeUser));
            localStorage.setItem("chat_app_token", token);
          }
        } catch (error) {
          console.error("Failed to set auth:", error instanceof Error ? error.message : "Unknown error");
        }
      },

      // Clears auth, closes WebSocket, and resets state
      clearAuth: () => {
        try {
          if (wsRef) {
            wsRef.close();
            wsRef = null;
          }
          if (typeof window !== "undefined") {
            localStorage.removeItem("chat_app_user");
            localStorage.removeItem("chat_app_token");
          }
          set(() => ({ state: { ...initialState } }));
        } catch (error) {
          console.error("Failed to clear auth:", error instanceof Error ? error.message : "Unknown error");
        }
      },

      // Establishes WebSocket connection for real-time updates
      connectSocket: () => {
        const token = get().state.token;
        if (!token) {
          console.debug("No token, skipping WebSocket connection");
          return;
        }
        try {
          if (wsRef) {
            wsRef.close();
            wsRef = null;
          }
          const ws = createWebSocket(token);
          wsRef = ws;

          ws.onopen = () => {
            reconnectCounter = 0;
            set((s) => ({
              state: reducer(s.state, { type: "SOCKET_CONNECTED" } as Action),
            }));
            try {
              // Load conversations if not already loaded
              if (!get().state.chatsLoaded) {
                ws.send(JSON.stringify({ action: "getUserConversations", data: {} }));
              }
            } catch (error) {
              console.error("Failed to send initial WebSocket request:", error instanceof Error ? error.message : "Unknown error");
            }
          };

          ws.onmessage = (ev) => {
            try {
              const data = JSON.parse(ev.data);
              if (!data || typeof data !== "object") {
                throw new Error("Invalid WebSocket message format");
              }
              const type = data.action ?? data.type;
              const payload = data.data ?? data.payload ?? data;

              switch (type) {
                case "newMessage": {
                  const msg: Message = payload.message ?? payload;
                  const convId = payload.conversationId ?? msg?.conversationId;
                  if (!convId || !msg?.id) {
                    console.warn("Invalid newMessage payload: missing convId or message ID");
                    break;
                  }
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "ADD_MESSAGE",
                      convId,
                      message: msg,
                    } as Action),
                  }));
                  // Mark message as read if in active conversation
                  const activeId = get().state.activeConversationId;
                  if (activeId && String(activeId) === String(convId)) {
                    try {
                      void get().sendSocketAction("markMessageAsRead", { messageId: msg.id });
                    } catch (error) {
                      console.warn("Failed to mark message as read:", error);
                    }
                  }
                  break;
                }
                case "newConversation": {
                  const conv: Conversation = payload;
                  if (!conv?.id) {
                    console.warn("Invalid newConversation payload: missing conversation");
                    break;
                  }
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "ADD_OR_UPDATE_CONVERSATION",
                      conv,
                    } as Action),
                  }));
                  const meId = get().state.user?.id;
                  const createdById = conv.createdBy?.id;
                  if (meId && createdById && String(meId) === String(createdById)) {
                    try {
                      get().setActiveConversation(String(conv?.id));
                      // Navigation commented out to avoid unintended redirects
                      // navigate(`/chat/${conv.id}`);
                    } catch (error) {
                      console.error("Failed to handle new conversation:", error instanceof Error ? error.message : "Unknown error");
                    }
                  }
                  break;
                }
                case "updatedConversation": {
                  const conv: Conversation = payload;
                  if (!conv?.id) {
                    console.warn("Invalid updatedConversation payload: missing conversation");
                    break;
                  }
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "ADD_OR_UPDATE_CONVERSATION",
                      conv,
                    } as Action),
                  }));
                  break;
                }
                case "editedMessage": {
                  const msg = payload.message ?? payload;
                  const convId = payload.convId ?? payload.conversationId ?? msg?.conversationId;
                  if (!convId || !msg?.id) {
                    console.warn("Invalid editedMessage payload: missing convId or message ID");
                    break;
                  }
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "EDIT_MESSAGE",
                      convId,
                      message: msg,
                    } as Action),
                  }));
                  break;
                }
                case "deletedMessage": {
                  const messageId = payload.messageId ?? payload.id ?? payload.message?.id;
                  const convId = payload.convId ?? payload.conversationId ?? payload.message?.conversationId;
                  if (!convId || !messageId) {
                    console.warn("Invalid deletedMessage payload: missing convId or messageId");
                    break;
                  }
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "DELETE_MESSAGE",
                      convId,
                      messageId,
                    } as Action),
                  }));
                  break;
                }
                case "removedConversation": {
                  const convId = payload.convId ?? payload.conversationId;
                  if (!convId) {
                    console.warn("Invalid removedConversation payload: missing convId");
                    break;
                  }
                  const activeId = get().state.activeConversationId;
                  if (activeId && String(activeId) === String(convId)) {
                    try {
                      get().setActiveConversation(null);
                      navigate("/chat");
                    } catch (error) {
                      console.error("Failed to handle removed conversation:", error instanceof Error ? error.message : "Unknown error");
                    }
                  }
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "REMOVE_CONVERSATION",
                      convId,
                    } as Action),
                  }));
                  break;
                }
                case "getAllMessagesResponse": {
                  const messages: Message[] = Array.isArray(payload) ? payload : payload.messages ?? [];
                  const convId: string | undefined = payload.conversationId ?? payload.convId;
                  if (!convId) {
                    console.warn("Invalid getAllMessagesResponse payload: missing convId");
                    break;
                  }
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "LOAD_MESSAGES",
                      convId,
                      messages,
                    } as Action),
                  }));
                  break;
                }
                case "getUserConversationsResponse": {
                  const convs = Array.isArray(payload) ? payload : payload.conversations ?? [];
                  try {
                    set((s) => ({
                      state: reducer(s.state, {
                        type: "LOAD_CHATS",
                        conversations: convs,
                        chats: {},
                      } as Action),
                    }));
                    console.debug("[Store] Conversations loaded:", convs.length);
                  } catch (error) {
                    console.error("Failed to load conversations:", error instanceof Error ? error.message : "Unknown error");
                  }
                  break;
                }
                case "getConversationResponse": {
                  const conv: Conversation = payload;
                  if (!conv?.id) {
                    console.warn("Invalid getConversationResponse payload: missing conversation");
                    break;
                  }
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "ADD_OR_UPDATE_CONVERSATION",
                      conv,
                    } as Action),
                  }));
                  break;
                }
                case "getProfileResponse": {
                  const prof: User = payload;
                  const curUser = get().state.user;
                  if (!prof?.id || !curUser || prof.id !== curUser.id) {
                    console.warn("Invalid getProfileResponse payload or user mismatch");
                    break;
                  }
                  const safeProf: User = { ...prof };
                  try {
                    if ("password" in safeProf) {
                      delete (safeProf as any).password;
                    }
                    set((s) => ({
                      state: reducer(s.state, {
                        type: "SET_AUTH",
                        user: safeProf,
                        token: s.state.token ?? "",
                      } as Action),
                    }));
                    if (typeof window !== "undefined") {
                      localStorage.setItem("chat_app_user", JSON.stringify(safeProf));
                    }
                  } catch (error) {
                    console.error("Failed to update profile:", error instanceof Error ? error.message : "Unknown error");
                  }
                  break;
                }
                case "searchUserResponse": {
                  const users: User[] = Array.isArray(payload) ? payload : payload.users ?? [];
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "SET_SEARCH_RESULTS",
                      users,
                    } as Action),
                  }));
                  break;
                }
                case "getUserByUsername": {
                  const u = payload ?? null;
                  const users: User[] = u ? [u] : [];
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "SET_SEARCH_RESULTS",
                      users,
                    } as Action),
                  }));
                  break;
                }
                case "newParticipant": {
                  const convId = payload.conversationId;
                  const participant: ConversationParticipant = payload.participant;
                  if (!convId || !participant?.id) {
                    console.warn("Invalid newParticipant payload: missing convId or participant");
                    break;
                  }
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "ADD_PARTICIPANT",
                      convId,
                      participant,
                    } as Action),
                  }));
                  break;
                }
                case "updateParticipant": {
                  const convId = payload.conversationId;
                  const participant: ConversationParticipant = payload.participant;
                  if (!convId || !participant?.id) {
                    console.warn("Invalid updateParticipant payload: missing convId or participant");
                    break;
                  }
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "UPDATE_PARTICIPANT",
                      convId,
                      participant,
                    } as Action),
                  }));
                  break;
                }
                case "removedParticipant": {
                  const convId = payload.conversationId;
                  const participantId = payload.participantId;
                  if (!convId || !participantId) {
                    console.warn("Invalid removedParticipant payload: missing convId or participantId");
                    break;
                  }
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "REMOVE_PARTICIPANT",
                      convId,
                      participantId,
                    } as Action),
                  }));
                  break;
                }
                case "ERROR": {
                  const message = data.message || "Unknown server error";
                  toast.error(`Error: ${message}`, {
                    style: {
                      "--normal-bg": "var(--background)",
                      "--normal-text": "var(--destructive)",
                      "--normal-border": "var(--destructive)",
                    } as React.CSSProperties,
                    position: "top-right",
                  });
                  break;
                }
                default:
                  console.debug("Unhandled WebSocket message type:", type);
                  break;
              }
            } catch (error) {
              console.error("Failed to process WebSocket message:", error instanceof Error ? error.message : "Unknown error");
            }
          };

          ws.onclose = () => {
            set((s) => ({
              state: reducer(s.state, { type: "SOCKET_DISCONNECTED" } as Action),
            }));
            wsRef = null;
            reconnectCounter += 1;
            const delay = Math.min(30000, 1000 * Math.pow(2, reconnectCounter));
            setTimeout(() => {
              const tokenNow = get().state.token;
              if (tokenNow) get().connectSocket();
            }, delay);
          };

          ws.onerror = () => {
            console.warn("WebSocket error occurred, handled by onclose");
          };
        } catch (error) {
          console.error("Failed to connect WebSocket:", error instanceof Error ? error.message : "Unknown error");
        }
      },

      // Closes WebSocket connection
      disconnectSocket: () => {
        try {
          if (wsRef) {
            wsRef.close();
            wsRef = null;
          }
          set((s) => ({
            state: reducer(s.state, { type: "SOCKET_DISCONNECTED" } as Action),
          }));
        } catch (error) {
          console.error("Failed to disconnect WebSocket:", error instanceof Error ? error.message : "Unknown error");
        }
      },

      // Sets active conversation and loads its messages
      setActiveConversation: (convId?: string | null) => {
        try {
          set((s) => ({
            state: reducer(s.state, {
              type: "SET_ACTIVE_CONVERSATION",
              convId,
            } as Action),
          }));
          if (convId) {
            get().loadMessages(convId);
          }
        } catch (error) {
          console.error("Failed to set active conversation:", error instanceof Error ? error.message : "Unknown error");
        }
      },

      // Action: Adds a message to a conversation
      addMessage: (convId: string, message: Message) => {
        if (!convId || !message?.id) {
          console.error("Invalid addMessage data: missing convId or message ID");
          return;
        }
        set((s) => ({
          state: reducer(s.state, {
            type: "ADD_MESSAGE",
            convId,
            message,
          } as Action),
        }));
      },

      // Action: Adds or updates a conversation
      addOrUpdateConversation: (conv: Conversation) => {
        if (!conv?.id) {
          console.error("Invalid addOrUpdateConversation data: missing conversation ID");
          return;
        }
        set((s) => ({
          state: reducer(s.state, {
            type: "ADD_OR_UPDATE_CONVERSATION",
            conv,
          } as Action),
        }));
      },

      // Action: Edits a message
      editMessage: (convId: string, message: Message) => {
        if (!convId || !message?.id) {
          console.error("Invalid editMessage data: missing convId or message ID");
          return;
        }
        set((s) => ({
          state: reducer(s.state, {
            type: "EDIT_MESSAGE",
            convId,
            message,
          } as Action),
        }));
      },

      // Action: Deletes a message
      deleteMessage: (convId: string, messageId: string) => {
        if (!convId || !messageId) {
          console.error("Invalid deleteMessage data: missing convId or messageId");
          return;
        }
        set((s) => ({
          state: reducer(s.state, {
            type: "DELETE_MESSAGE",
            convId,
            messageId,
          } as Action),
        }));
      },

      // Action: Removes a conversation
      removeConversation: (convId: string) => {
        if (!convId) {
          console.error("Invalid removeConversation data: missing convId");
          return;
        }
        set((s) => ({
          state: reducer(s.state, {
            type: "REMOVE_CONVERSATION",
            convId,
          } as Action),
        }));
      },

      // Action: Adds a participant to a conversation
      addNewParticipant: (convId: string | number, participant: ConversationParticipant) => {
        if (!convId || !participant?.id) {
          console.error("Invalid add participant data: missing convId or participant ID");
          return;
        }
        set((s) => ({
          state: reducer(s.state, {
            type: "ADD_PARTICIPANT",
            convId,
            participant,
          } as Action),
        }));
      },

      // Action: Updates a participant's details
      updateParticipant: (convId: string | number, participant: ConversationParticipant) => {
        if (!convId || !participant?.id) {
          console.error("Invalid update participant data: missing convId or participant ID");
          return;
        }
        set((s) => ({
          state: reducer(s.state, {
            type: "UPDATE_PARTICIPANT",
            convId,
            participant,
          } as Action),
        }));
      },

      // Action: Removes a participant from a conversation
      removeParticipant: (convId: string | number, participantId: string | number) => {
        if (!convId || !participantId) {
          console.error("Invalid remove participant data: missing convId or participantId");
          return;
        }
        set((s) => ({
          state: reducer(s.state, {
            type: "REMOVE_PARTICIPANT",
            convId,
            participantId,
          } as Action),
        }));
      },

      // Action: Sets user search results
      setSearchResults: (users: User[]) => {
        set((s) => ({
          state: reducer(s.state, {
            type: "SET_SEARCH_RESULTS",
            users,
          } as Action),
        }));
      },

      // Action: Clears user search results
      clearSearchResults: () => {
        set((s) => ({
          state: reducer(s.state, {
            type: "SET_SEARCH_RESULTS",
            users: [],
          } as Action),
        }));
      },

      // Loads all user conversations via WebSocket
      loadChats: async () => {
        const token = get().state.token;
        if (!token) {
          console.debug("No token, skipping loadChats");
          return;
        }
        try {
          const ws = wsRef;
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: "getUserConversations", data: {} }));
          } else {
            console.warn("WebSocket not connected, cannot load chats");
          }
        } catch (error) {
          console.error("Failed to load chats:", error instanceof Error ? error.message : "Unknown error");
        }
      },

      // Loads messages for a specific conversation
      loadMessages: (convId: string) => {
        if (!convId) {
          console.error("Invalid convId for loadMessages");
          return;
        }
        try {
          const ws = wsRef;
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                action: "getAllMessages",
                data: { conversationId: convId },
              })
            );
          } else {
            console.warn("WebSocket not connected, cannot load messages");
          }
        } catch (error) {
          console.error("Failed to load messages:", error instanceof Error ? error.message : "Unknown error");
        }
      },

      // Sets conversation filter (e.g., all, group)
      setConversationFilter: (filter: "all" | "group" | "personal" | "broadcast") =>
        set((s) => ({
          state: reducer(s.state, {
            type: "SET_CONVERSATION_FILTER",
            filter,
          } as Action),
        })),

      // Sends a WebSocket action, optionally with a file
      sendSocketAction: async (action: string, data: unknown = {}, fileObj?: File | null) => {
        try {
          const ws = wsRef;
          if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not connected, cannot send action:", action);
            return false;
          }
          let payload: SocketPayload = { action, data };
          if (fileObj) {
            const base64File = await getBase64StringFromFile(fileObj);
            payload = { ...payload, file: base64File, fileName: fileObj.name };
          }
          ws.send(JSON.stringify(payload));
          return true;
        } catch (error) {
          console.error("Failed to send WebSocket action:", error instanceof Error ? error.message : "Unknown error");
          return false;
        }
      },
    }),
    {
      name: "ChatStore",
      serialize: false, // Disable serialization for better performance
    }
  )
);

export { useChatStore };
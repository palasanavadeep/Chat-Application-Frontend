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

// reducer and initialState are provided by './reducer'

type StoreContextType = {
  state: ChatState;
  // auth
  setAuthFromLogin: (user: User, token: string) => void;
  clearAuth: () => void;
  // ui
  setActiveConversation: (convId?: string | null) => void;
  // search results helpers
  setSearchResults: (users: User[]) => void;
  clearSearchResults: () => void;
  // socket
  connectSocket: () => void;
  disconnectSocket: () => void;
  // actions
  addMessage: (convId: string, message: Message) => void;
  addOrUpdateConversation: (conv: Conversation) => void;
  editMessage: (convId: string, message: Message) => void;
  deleteMessage: (convId: string, messageId: string) => void;
  removeConversation: (convId: string) => void;
  // participant ops
  addNewParticipant: (
    convId: string | number,
    participant: ConversationParticipant
  ) => void;
  updateParticipant: (
    convId: string | number,
    participant: ConversationParticipant
  ) => void;
  removeParticipant: (
    convId: string | number,
    participantId: string | number
  ) => void;
  loadChats: () => Promise<void>;
  loadMessages: (convId: string) => void;
  setConversationFilter: (
    filter: "all" | "group" | "personal" | "broadcast"
  ) => void;
  // send an arbitrary websocket action (client -> server); returns true if sent
  sendSocketAction: (
    action: string,
    data?: unknown,
    fileObj?: File | null
  ) => Promise<boolean>;
};

// module-scoped refs for websocket and pending requests (persist across hook calls)
let wsRef: WebSocket | null = null;
let reconnectCounter = 0;

const useChatStore = create<StoreContextType>()(
  devtools(
    (set, get) => ({
      state: initialState,

      // auth
      setAuthFromLogin: (user: User, token: string) => {
        const safeUser: User = { ...user };
        try {
          if (Object.prototype.hasOwnProperty.call(safeUser, "password")) {
            try {
              delete (safeUser as unknown as Record<string, unknown>).password;
            } catch (e) {}
          }
        } catch (e) {}
        set((s) => ({ state: { ...s.state, user: safeUser, token } }));
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("chat_app_user", JSON.stringify(safeUser));
            localStorage.setItem("chat_app_token", token);
          }
        } catch (e) {}
      },

      clearAuth: () => {
        try {
          if (wsRef) {
            try {
              wsRef.close();
            } catch (e) {}
            wsRef = null;
          }
        } catch (e) {}
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("chat_app_user");
            localStorage.removeItem("chat_app_token");
          }
        } catch (e) {}
        set(() => ({ state: { ...initialState } }));
      },

      // socket management
      connectSocket: () => {
        const token = get().state.token;
        if (!token) return;
        try {
          if (wsRef) wsRef.close();
        } catch (e) {}
        try {
          const ws = createWebSocket(token);
          wsRef = ws;

          ws.onopen = () => {
            reconnectCounter = 0;
            set((s) => ({ state: { ...s.state, socketConnected: true } }));
            try {
              // Only request the full conversation list if we haven't loaded it yet.
              const loaded = get().state.chatsLoaded;
              if (!loaded) {
                ws.send(
                  JSON.stringify({ action: "getUserConversations", data: {} })
                );
              }
            } catch (e) {
              // ignore
            }
          };

          ws.onmessage = (ev) => {
            try {
              const data = JSON.parse(ev.data);
              const type = data.action ?? data.type;
              const payload = data.data ?? data.payload ?? data;

              switch (type) {
                case "newMessage": {
                  try {
                    const msg: Message = payload.message ?? payload;
                    const convId =
                      payload.conversationId ?? (msg && msg.conversationId);
                    if (convId) {
                      // update local store
                      set((s) => ({
                        state: reducer(s.state, {
                          type: "ADD_MESSAGE",
                          convId,
                          message: msg,
                        } as Action),
                      }));

                      // If this message belongs to the currently active conversation,
                      // mark it as read on the server.
                      try {
                        const activeId = get().state.activeConversationId;
                        if (
                          activeId &&
                          String(activeId) === String(convId) &&
                          msg &&
                          msg.id
                        ) {
                          const messageId = msg.id;
                          // fire-and-forget; server should push read receipts/backfill as needed
                          try {
                            // sendSocketAction is async and available on the store
                            void get().sendSocketAction("markMessageAsRead", {
                              messageId,
                            });
                          } catch (e) {}
                        }
                      } catch (e) {}
                    }
                  } catch (e) {}
                  break;
                }
                case "newConversation": {
                  const conv = payload;
                  if (!conv) {
                    console.warn("No conversation in payload");
                    break;
                  }

                  // Update Zustand store
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "ADD_OR_UPDATE_CONVERSATION",
                      conv,
                    } as Action),
                  }));

                  const meId = get().state.user?.id;
                  const createdById = conv.createdBy?.id;

                  // Navigate only if the current user created the conversation
                  if (
                    meId &&
                    createdById &&
                    String(meId) === String(createdById)
                  ) {
                    try {
                      get().setActiveConversation(conv.id);
                    } catch (e) {
                      console.error("Failed to set active conversation:", e);
                    }

                    // if (conv.id) {
                    //   console.log("Navigating to conversation:", conv.id);
                    //   try {
                    //     navigate(`/chat/${conv.id}`);
                    //   } catch (e) {
                    //     console.error("Navigation failed:", e);
                    //   }
                    // }
                  }

                  break;
                }
                case "updatedConversation": {
                  const conv = payload;
                  if (!conv) {
                    console.warn("No conversation in payload");
                    break;
                  }
                  // Update Zustand store
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "ADD_OR_UPDATE_CONVERSATION",
                      conv,
                    } as Action),
                  }));
                  break;
                }
                case "editedMessage": {
                  try {
                    const msg = payload.message ?? payload;
                    const convId =
                      payload.convId ??
                      payload.conversationId ??
                      (msg && (msg.conversationId ?? msg.convId));
                    if (convId)
                      set((s) => ({
                        state: reducer(s.state, {
                          type: "EDIT_MESSAGE",
                          convId,
                          message: msg,
                        } as Action),
                      }));
                  } catch (e) {}
                  break;
                }
                case "deletedMessage": {
                  try {
                    const messageId =
                      payload.messageId ?? payload.id ?? payload.message?.id;
                    const convId =
                      payload.convId ??
                      payload.conversationId ??
                      payload.message?.conversationId;
                    if (convId && messageId)
                      set((s) => ({
                        state: reducer(s.state, {
                          type: "DELETE_MESSAGE",
                          convId,
                          messageId,
                        } as Action),
                      }));
                  } catch (e) {}
                  break;
                }
                case "removedConversation": {
                  try {
                    const convId = payload.convId ?? payload.conversationId;
                    if (convId) {
                      try {
                        const active = get().state.activeConversationId;
                        if (active && String(active) === String(convId)) {
                          try {
                            get().setActiveConversation(null);
                          } catch (e) {}
                          try {
                            navigate("/chat");
                          } catch (e) {}
                        }
                      } catch (e) {}

                      set((s) => ({
                        state: reducer(s.state, {
                          type: "REMOVE_CONVERSATION",
                          convId,
                        } as Action),
                      }));
                    }
                  } catch (e) {}
                  break;
                }
                case "getAllMessagesResponse": {
                  const messages: Message[] = Array.isArray(payload)
                    ? payload
                    : payload.messages ?? [];

                  const convId: string | undefined =
                    payload.conversationId ?? payload.convId;
                  if (convId)
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
                  const convs = Array.isArray(payload)
                    ? payload
                    : payload.conversations ?? [];
                  // debug: log incoming conversations and ensure reducer is applied
                  console.log(
                    "[WS] getUserConversationsResponse payload:",
                    convs
                  );
                  try {
                    const next = reducer(get().state, {
                      type: "LOAD_CHATS",
                      conversations: convs,
                      chats: {},
                    } as Action);
                    set(() => ({ state: next }));
                    
                    console.log(
                      "[Store] conversations after LOAD_CHATS:",
                      get().state.conversations
                    );
                  } catch (err) {
                    console.error("Failed to apply LOAD_CHATS reducer:", err);
                  }

                  break;
                }
                case "getConversationResponse": {
                  const conv = payload;
                  if (conv)
                    set((s) => ({
                      state: reducer(s.state, {
                        type: "ADD_OR_UPDATE_CONVERSATION",
                        conv,
                      } as Action),
                    }));
                  break;
                }
                case "getProfileResponse": {
                  const prof = payload;
                  const curUser = get().state.user;
                  if (prof && curUser && prof.id === curUser.id) {
                    const safeProf: User = { ...prof };
                    try {
                      if (
                        Object.prototype.hasOwnProperty.call(
                          safeProf,
                          "password"
                        )
                      ) {
                        try {
                          delete (
                            safeProf as unknown as Record<string, unknown>
                          ).password;
                        } catch (e) {}
                      }
                    } catch (e) {}
                    set((s) => ({
                      state: reducer(s.state, {
                        type: "SET_AUTH",
                        user: safeProf,
                        token: s.state.token ?? "",
                      } as Action),
                    }));
                    try {
                      if (typeof window !== "undefined")
                        localStorage.setItem(
                          "chat_app_user",
                          JSON.stringify(safeProf)
                        );
                    } catch (e) {}
                  }
                  break;
                }
                case "searchUserResponse": {
                  const users = Array.isArray(payload)
                    ? payload
                    : payload.users ?? [];
                  set((s) => ({
                    state: reducer(s.state, {
                      type: "SET_SEARCH_RESULTS",
                      users,
                    } as Action),
                  }));
                  break;
                }
                // not using for now
                case "getUserByUsername": {
                  // server returns a single user object or null
                  const u = payload ?? null;
                  const users = u ? [u] : [];
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
                  const participant: ConversationParticipant =
                    payload.participant;
                  set((s) => {
                    const conversations = s.state.conversations.map((c) => {
                      if (String(c.id) !== String(convId)) return c;
                      const parts = c.conversationParticipants
                        ? [...c.conversationParticipants]
                        : [];
                      // avoid duplicates: check by participant.id or participant.user.id
                      const exists = parts.find(
                        (p) =>
                          String(p?.id) === String(participant.id) ||
                          String(p?.user?.id) === String(participant.user?.id)
                      );
                      if (exists)
                        return { ...c, conversationParticipants: parts };
                      return {
                        ...c,
                        conversationParticipants: [...parts, participant],
                      };
                    });
                    return { state: { ...s.state, conversations } };
                  });
                  break;
                }
                case "removedParticipant": {
                  const convId = payload.conversationId;
                  const participantId = payload.participantId;
                  set((s) => {
                    const conversations = s.state.conversations.map((c) => {
                      if (String(c.id) !== String(convId)) return c;
                      const parts = (c.conversationParticipants ?? []).filter(
                        (p) =>
                          !(
                            String(p?.id) === String(participantId) ||
                            String(p?.user?.id) === String(participantId)
                          )
                      );
                      return { ...c, conversationParticipants: parts };
                    });
                    return { state: { ...s.state, conversations } };
                  });
                  break;
                }
                case "updateParticipant": {
                  const convId = payload.conversationId;
                  const participant: ConversationParticipant =
                    payload.participant;
                  set((s) => {
                    const conversations = s.state.conversations.map((c) => {
                      if (String(c.id) !== String(convId)) return c;
                      const parts = (c.conversationParticipants ?? []).map(
                        (p) =>
                          String(p?.id) === String(participant.id) ||
                          String(p?.user?.id) === String(participant.user?.id)
                            ? { ...p, ...participant }
                            : p
                      );
                      return { ...c, conversationParticipants: parts };
                    });
                    return { state: { ...s.state, conversations } };
                  });
                  break;
                }
                case "ERROR": {
                  toast.error(
                    `Oops, there was an error processing your request. ERROR : \n ${data.message} `,
                    {
                      style: {
                        "--normal-bg": "var(--background)",
                        "--normal-text": "var(--destructive)",
                        "--normal-border": "var(--destructive)",
                      } as React.CSSProperties,
                      position: "top-right",
                    }
                  );
                }
                default:
                  break;
              }
            } catch (err) {
              // ignore
            }
          };

          ws.onclose = () => {
            set((s) => ({ state: { ...s.state, socketConnected: false } }));
            wsRef = null;
            reconnectCounter = reconnectCounter + 1;
            const delay = Math.min(30000, 1000 * Math.pow(2, reconnectCounter));
            setTimeout(() => {
              const tokenNow = get().state.token;
              if (tokenNow) get().connectSocket();
            }, delay);
          };

          ws.onerror = () => {
            // let onclose handle
          };
        } catch (e) {
          // ignore connect errors
        }
      },

      disconnectSocket: () => {
        try {
          if (wsRef) wsRef.close();
        } catch (e) {}
        wsRef = null;
        set((s) => ({ state: { ...s.state, socketConnected: false } }));
      },

      // UI helpers
      setActiveConversation: (convId?: string | null) => {
        set((s) => ({
          state: reducer(s.state, {
            type: "SET_ACTIVE_CONVERSATION",
            convId,
          } as Action),
        }));
        try {
          if (convId) get().loadMessages(convId);
        } catch (e) {}
      },

      // actions
      addMessage: (convId: string, message: Message) =>
        set((s) => ({
          state: reducer(s.state, {
            type: "ADD_MESSAGE",
            convId,
            message,
          } as Action),
        })),
      addOrUpdateConversation: (conv: Conversation) =>
        set((s) => ({
          state: reducer(s.state, {
            type: "ADD_OR_UPDATE_CONVERSATION",
            conv,
          } as Action),
        })),
      editMessage: (convId: string, message: Message) =>
        set((s) => ({
          state: reducer(s.state, {
            type: "EDIT_MESSAGE",
            convId,
            message,
          } as Action),
        })),
      deleteMessage: (convId: string, messageId: string) =>
        set((s) => ({
          state: reducer(s.state, {
            type: "DELETE_MESSAGE",
            convId,
            messageId,
          } as Action),
        })),
      removeConversation: (convId: string) =>
        set((s) => ({
          state: reducer(s.state, {
            type: "REMOVE_CONVERSATION",
            convId,
          } as Action),
        })),

      // participant operations
      addNewParticipant: (
        convId: string | number,
        participant: ConversationParticipant
      ) =>
        set((s) => {
          const conversations = s.state.conversations.map((c) => {
            if (String(c.id) !== String(convId)) return c;
            const parts = c.conversationParticipants
              ? [...c.conversationParticipants]
              : [];
            // avoid duplicates: check by participant.id or participant.user.id
            const exists = parts.find(
              (p) =>
                String(p?.id) === String(participant.id) ||
                String(p?.user?.id) === String(participant.user?.id)
            );
            if (exists) return { ...c, conversationParticipants: parts };
            return { ...c, conversationParticipants: [...parts, participant] };
          });
          return { state: { ...s.state, conversations } };
        }),

      updateParticipant: (
        convId: string | number,
        participant: ConversationParticipant
      ) =>
        set((s) => {
          const conversations = s.state.conversations.map((c) => {
            if (String(c.id) !== String(convId)) return c;
            const parts = (c.conversationParticipants ?? []).map((p) =>
              String(p?.id) === String(participant.id) ||
              String(p?.user?.id) === String(participant.user?.id)
                ? { ...p, ...participant }
                : p
            );
            return { ...c, conversationParticipants: parts };
          });
          return { state: { ...s.state, conversations } };
        }),

      removeParticipant: (
        convId: string | number,
        participantId: string | number
      ) =>
        set((s) => {
          const conversations = s.state.conversations.map((c) => {
            if (String(c.id) !== String(convId)) return c;
            const parts = (c.conversationParticipants ?? []).filter(
              (p) =>
                !(
                  String(p?.id) === String(participantId) ||
                  String(p?.user?.id) === String(participantId)
                )
            );
            return { ...c, conversationParticipants: parts };
          });
          return { state: { ...s.state, conversations } };
        }),

      // search results helpers
      setSearchResults: (users: User[]) => {
        set((s) => ({
          state: reducer(s.state, {
            type: "SET_SEARCH_RESULTS",
            users,
          } as Action),
        }));
      },
      clearSearchResults: () => {
        set((s) => ({
          state: reducer(s.state, {
            type: "SET_SEARCH_RESULTS",
            users: [],
          } as Action),
        }));
      },

      loadChats: async () => {
        const token = get().state.token;
        if (!token) return;
        try {
          const ws = wsRef;
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({ action: "getUserConversations", data: {} })
            );
          }
        } catch (e) {}
      },

      loadMessages: (convId: string) => {
        try {
          const ws = wsRef;
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                action: "getAllMessages",
                data: { conversationId: convId },
              })
            );
          }
        } catch (e) {}
      },

      setConversationFilter: (
        filter: "all" | "group" | "personal" | "broadcast"
      ) =>
        set((s) => ({
          state: reducer(s.state, {
            type: "SET_CONVERSATION_FILTER",
            filter,
          } as Action),
        })),

      sendSocketAction: async (
        action: string,
        data: unknown = {},
        fileObj?: File | null
      ) => {
        try {
          const ws = wsRef;
          if (ws && ws.readyState === WebSocket.OPEN) {
            let payload: SocketPayload = { action, data };
            if (fileObj) {
              const base64File = await getBase64StringFromFile(fileObj);
              payload = {
                ...payload,
                file: base64File,
                fileName: fileObj.name,
              };
            }
            ws.send(JSON.stringify(payload));
            return true;
          }
        } catch (e) {}
        return false;
      },

    }),
    {
      name: "ChatStore",
      serialize: false,
    }
  )
);

export { useChatStore };

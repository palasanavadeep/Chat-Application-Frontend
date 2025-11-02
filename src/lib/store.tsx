"use client"

import React, { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useChatStore } from "@/lib/store/useChatStore"
import type { User } from "@/lib/types"

// type UserWithPassword = User & { password?: unknown };

// type Action =
//   | { type: "SET_AUTH"; user: User; token: string }
//   | { type: "CLEAR_AUTH" }
//   | { type: "SOCKET_CONNECTED" }
//   | { type: "SOCKET_DISCONNECTED" }
//   | {
//       type: "SET_CONVERSATION_FILTER";
//       filter: "all" | "group" | "personal" | "broadcast";
//     }
//   | {
//       type: "LOAD_CHATS";
//       conversations: Conversation[];
//       chats: Record<string, Message[]>;
//     }
//   | { type: "LOAD_MESSAGES"; convId: string; messages: Message[] }
//   | { type: "ADD_OR_UPDATE_CONVERSATION"; conv: Conversation }
//   | { type: "REMOVE_CONVERSATION"; convId: string }
//   | { type: "ADD_MESSAGE"; convId: string; message: Message }
//   | { type: "EDIT_MESSAGE"; convId: string; message: Message }
//   | { type: "DELETE_MESSAGE"; convId: string; messageId: string };

// const initialState: ChatState = {
//   user: null,
//   token: null,
//   socketConnected: false,
//   conversations: [],
//   chats: {},
//   conversationFilter: "all",
// };

// function sortConversations(convs: Conversation[]) {
//   return convs.sort((a, b) => {
//     const aa = a.lastMessage?.createdAt ?? "";
//     const bb = b.lastMessage?.createdAt ?? "";
//     return bb.localeCompare(aa);
//   });
// }

// function reducer(state: ChatState, action: Action): ChatState {
//   switch (action.type) {
//     case "SET_AUTH":
//       return { ...state, user: action.user, token: action.token };
//     case "CLEAR_AUTH":
//       return { ...initialState };
//     case "SOCKET_CONNECTED":
//       return { ...state, socketConnected: true };
//     case "SOCKET_DISCONNECTED":
//       return { ...state, socketConnected: false };
//     case "LOAD_CHATS":
//       return {
//         ...state,
//         conversations: sortConversations([...action.conversations]),
//         chats: { ...action.chats },
//       };
//     case "LOAD_MESSAGES": {
//       const { convId, messages } = action;
//       const chats = { ...state.chats };
//       chats[convId] = messages;

//       // update lastMessage for conversation and move to top
//       const last = messages.length ? messages[messages.length - 1] : null;
//       const existing = state.conversations.filter((c) => c.id !== convId);
//       const convFromState = state.conversations.find((c) => c.id === convId);
//       const conv: Conversation = convFromState
//         ? { ...convFromState, lastMessage: last }
//         : { id: convId, members: [], lastMessage: last };
//       const conversations = sortConversations([conv, ...existing]);
//       return { ...state, chats, conversations };
//     }
//     case "SET_CONVERSATION_FILTER": {
//       return { ...state, conversationFilter: action.filter };
//     }
//     case "ADD_OR_UPDATE_CONVERSATION": {
//       const existing = state.conversations.filter(
//         (c) => c.id !== action.conv.id
//       );
//       const updated = sortConversations([action.conv, ...existing]);
//       return { ...state, conversations: updated };
//     }
//     case "REMOVE_CONVERSATION": {
//       const convs = state.conversations.filter((c) => c.id !== action.convId);
//       const chats = { ...state.chats };
//       delete chats[action.convId];
//       return { ...state, conversations: convs, chats };
//     }
//     case "ADD_MESSAGE": {
//       const { convId, message } = action;
//       const chats = { ...state.chats };
//       const msgs = chats[convId] ? [...chats[convId]] : [];
//       msgs.push(message);
//       chats[convId] = msgs;

//       // update conversation lastMessage and move to top
//       const convIndex = state.conversations.findIndex((c) => c.id === convId);
//       let conv: Conversation;
//       if (convIndex >= 0) {
//         conv = { ...state.conversations[convIndex], lastMessage: message };
//       } else {
//         conv = { id: convId, members: [], lastMessage: message };
//       }
//       const otherConvs = state.conversations.filter((c) => c.id !== convId);
//       const conversations = sortConversations([conv, ...otherConvs]);

//       return { ...state, chats, conversations };
//     }
//     case "EDIT_MESSAGE": {
//       const { convId, message } = action;
//       const chats = { ...state.chats };
//       const msgs = chats[convId] ? [...chats[convId]] : [];
//       const idx = msgs.findIndex((m) => m.id === message.id);
//       if (idx >= 0) msgs[idx] = { ...msgs[idx], ...message };
//       chats[convId] = msgs;

//       // if edited message was lastMessage, update lastMessage
//       const conversations = state.conversations.map((c) =>
//         c.id === convId && c.lastMessage?.id === message.id
//           ? { ...c, lastMessage: message }
//           : c
//       );
//       return { ...state, chats, conversations };
//     }
//     case "DELETE_MESSAGE": {
//       const { convId, messageId } = action;
//       const chats = { ...state.chats };
//       const msgs = chats[convId]
//         ? state.chats[convId].filter((m) => m.id !== messageId)
//         : [];
//       chats[convId] = msgs;

//       // If deleted message was lastMessage, update lastMessage to the last element or null
//       const conversations = state.conversations.map((c) => {
//         if (c.id !== convId) return c;
//         const last = msgs.length ? msgs[msgs.length - 1] : null;
//         return { ...c, lastMessage: last };
//       });
//       return { ...state, chats, conversations };
//     }
//     default:
//       return state;
//   }
// }

// type StoreContextType = {
//   state: ChatState;
//   // auth
//   setAuthFromLogin: (user: User, token: string) => void;
//   clearAuth: () => void;
//   // socket
//   connectSocket: () => void;
//   disconnectSocket: () => void;
//   // actions
//   addMessage: (convId: string, message: Message) => void;
//   addOrUpdateConversation: (conv: Conversation) => void;
//   editMessage: (convId: string, message: Message) => void;
//   deleteMessage: (convId: string, messageId: string) => void;
//   removeConversation: (convId: string) => void;
//   loadChats: () => Promise<void>;
//   loadMessages: (convId: string) => void;
//   setConversationFilter: (
//     filter: "all" | "group" | "personal" | "broadcast"
//   ) => void;
//   // send an arbitrary websocket action (client -> server); returns true if sent
//   sendSocketAction: (action: string, data?: unknown) => boolean;
//   sendSocketActionRequest?: (
//     action: string,
//     data?: unknown,
//     timeout?: number
//   ) => Promise<unknown>;
// };

// // module-scoped refs for websocket and pending requests (persist across hook calls)
// let wsRef: WebSocket | null = null;
// let reconnectCounter = 0;
// const pendingRequests: Record<
//   string,
//   {
//     resolve: (v: unknown) => void;
//     reject: (e: unknown) => void;
//     timeoutId?: number;
//   }
// > = {};
// let reqCounter = 0;

// function wsUrlWithToken(token: string) {
//   const base =
//     (process.env.NEXT_PUBLIC_WS_URL as string) ||
//     (typeof window !== "undefined"
//       ? `${window.location.origin.replace(/^http/, "ws")}/ws`
//       : "/ws");
//   return `${base}?token=${encodeURIComponent(token)}`;
// }

// const useChatStore = create<StoreContextType>((set, get) => ({
//   state: initialState,

//   // auth
//   setAuthFromLogin: (user: User, token: string) => {
//     const safeUser: UserWithPassword = { ...user };
//     try {
//       if (typeof safeUser.password !== "undefined") delete safeUser.password;
//     } catch (e) {}
//     set((s) => ({ state: { ...s.state, user: safeUser, token } }));
//     try {
//       if (typeof window !== "undefined") {
//         localStorage.setItem("chat_app_user", JSON.stringify(safeUser));
//         localStorage.setItem("chat_app_token", token);
//       }
//     } catch (e) {}
//     // start socket connection
//     try {
//       get().connectSocket();
//     } catch (e) {}
//   },

//   clearAuth: () => {
//     try {
//       if (wsRef) {
//         try {
//           wsRef.close();
//         } catch (e) {}
//         wsRef = null;
//       }
//     } catch (e) {}
//     try {
//       if (typeof window !== "undefined") {
//         localStorage.removeItem("chat_app_user");
//         localStorage.removeItem("chat_app_token");
//       }
//     } catch (e) {}
//     set(() => ({ state: { ...initialState } }));
//   },

//   // socket management
//   connectSocket: () => {
//     const token = get().state.token;
//     if (!token) return;
//     try {
//       if (wsRef) wsRef.close();
//     } catch (e) {}
//     const url = wsUrlWithToken(token);
//     try {
//       const ws = new WebSocket(url);
//       wsRef = ws;

//       ws.onopen = () => {
//         reconnectCounter = 0;
//         set((s) => ({ state: { ...s.state, socketConnected: true } }));
//         try {
//           ws.send(JSON.stringify({ action: "getUserConversations", data: {} }));
//         } catch (e) {
//           void get().loadChats();
//         }
//       };

//       ws.onmessage = (ev) => {
//         try {
//           const data = JSON.parse(ev.data);
//           const type = data.type ?? data.action;
//           const payload = data.payload ?? data.data ?? data;
//           const requestId = data.requestId ?? payload?.requestId;

//           if (requestId && pendingRequests[requestId]) {
//             try {
//               pendingRequests[requestId].resolve(payload);
//             } catch (e) {}
//             try {
//               clearTimeout(pendingRequests[requestId].timeoutId);
//             } catch (e) {}
//             delete pendingRequests[requestId];
//           }

//           switch (type) {
//             case "new_message":
//               set((s) => ({
//                 state: reducer(s.state, {
//                   type: "ADD_MESSAGE",
//                   convId: payload.convId,
//                   message: payload.message,
//                 } as Action),
//               }));
//               break;
//             case "new_conversation":
//               set((s) => ({
//                 state: reducer(s.state, {
//                   type: "ADD_OR_UPDATE_CONVERSATION",
//                   conv: payload.conversation,
//                 } as Action),
//               }));
//               break;
//             case "edited_message":
//               set((s) => ({
//                 state: reducer(s.state, {
//                   type: "EDIT_MESSAGE",
//                   convId: payload.convId,
//                   message: payload.message,
//                 } as Action),
//               }));
//               break;
//             case "deleted_message":
//               set((s) => ({
//                 state: reducer(s.state, {
//                   type: "DELETE_MESSAGE",
//                   convId: payload.convId,
//                   messageId: payload.messageId,
//                 } as Action),
//               }));
//               break;
//             case "removed_from_conversation":
//               set((s) => ({
//                 state: reducer(s.state, {
//                   type: "REMOVE_CONVERSATION",
//                   convId: payload.convId,
//                 } as Action),
//               }));
//               break;
//             case "getAllMessagesResponse": {
//               const messages: Message[] = Array.isArray(payload)
//                 ? payload
//                 : payload.messages ?? [];
//               let convId: string | undefined =
//                 payload.conversationId ?? payload.convId;
//               if (!convId && Array.isArray(payload) && payload.length) {
//                 // some message payloads include conversationId; use a guarded access
//                 convId = payload[0].conversationId ?? payload[0].convId;
//               }
//               if (convId)
//                 set((s) => ({
//                   state: reducer(s.state, {
//                     type: "LOAD_MESSAGES",
//                     convId,
//                     messages,
//                   } as Action),
//                 }));
//               break;
//             }
//             case "getUserConversationsResponse": {
//               const convs = Array.isArray(payload)
//                 ? payload
//                 : payload.conversations ?? [];
//               set((s) => ({
//                 state: reducer(s.state, {
//                   type: "LOAD_CHATS",
//                   conversations: convs,
//                   chats: {},
//                 } as Action),
//               }));
//               break;
//             }
//             case "getConversationResponse": {
//               const conv = payload;
//               if (conv)
//                 set((s) => ({
//                   state: reducer(s.state, {
//                     type: "ADD_OR_UPDATE_CONVERSATION",
//                     conv,
//                   } as Action),
//                 }));
//               break;
//             }
//             case "getProfileResponse": {
//               const prof = payload;
//               const curUser = get().state.user;
//               if (prof && curUser && prof.id === curUser.id) {
//                 const safeProf: UserWithPassword = { ...prof };
//                 try {
//                   if (typeof safeProf.password !== "undefined")
//                     delete safeProf.password;
//                 } catch (e) {}
//                 set((s) => ({
//                   state: reducer(s.state, {
//                     type: "SET_AUTH",
//                     user: safeProf,
//                     token: s.state.token ?? "",
//                   } as Action),
//                 }));
//                 try {
//                   if (typeof window !== "undefined")
//                     localStorage.setItem(
//                       "chat_app_user",
//                       JSON.stringify(safeProf)
//                     );
//                 } catch (e) {}
//               }
//               break;
//             }
//             default:
//               break;
//           }
//         } catch (err) {
//           // ignore
//         }
//       };

//       ws.onclose = () => {
//         set((s) => ({ state: { ...s.state, socketConnected: false } }));
//         wsRef = null;
//         try {
//           Object.keys(pendingRequests).forEach((k) => {
//             try {
//               pendingRequests[k].reject(new Error("socket-closed"));
//             } catch (e) {}
//             try {
//               clearTimeout(pendingRequests[k].timeoutId);
//             } catch (e) {}
//             delete pendingRequests[k];
//           });
//         } catch (e) {}
//         reconnectCounter = reconnectCounter + 1;
//         const delay = Math.min(30000, 1000 * Math.pow(2, reconnectCounter));
//         setTimeout(() => {
//           const tokenNow = get().state.token;
//           if (tokenNow) get().connectSocket();
//         }, delay);
//       };

//       ws.onerror = () => {
//         // let onclose handle
//       };
//     } catch (e) {
//       // ignore connect errors
//     }
//   },

//   disconnectSocket: () => {
//     try {
//       if (wsRef) wsRef.close();
//     } catch (e) {}
//     wsRef = null;
//     set((s) => ({ state: { ...s.state, socketConnected: false } }));
//   },

//   // actions
//   addMessage: (convId: string, message: Message) =>
//     set((s) => ({
//       state: reducer(s.state, {
//         type: "ADD_MESSAGE",
//         convId,
//         message,
//       } as Action),
//     })),
//   addOrUpdateConversation: (conv: Conversation) =>
//     set((s) => ({
//       state: reducer(s.state, {
//         type: "ADD_OR_UPDATE_CONVERSATION",
//         conv,
//       } as Action),
//     })),
//   editMessage: (convId: string, message: Message) =>
//     set((s) => ({
//       state: reducer(s.state, {
//         type: "EDIT_MESSAGE",
//         convId,
//         message,
//       } as Action),
//     })),
//   deleteMessage: (convId: string, messageId: string) =>
//     set((s) => ({
//       state: reducer(s.state, {
//         type: "DELETE_MESSAGE",
//         convId,
//         messageId,
//       } as Action),
//     })),
//   removeConversation: (convId: string) =>
//     set((s) => ({
//       state: reducer(s.state, {
//         type: "REMOVE_CONVERSATION",
//         convId,
//       } as Action),
//     })),

//   loadChats: async () => {
//     const token = get().state.token;
//     if (!token) return;
//     try {
//       const ws = wsRef;
//       if (ws && ws.readyState === WebSocket.OPEN) {
//         ws.send(JSON.stringify({ action: "getUserConversations", data: {} }));
//         return;
//       }
//     } catch (e) {}

//     try {
//       const res = await fetch(
//         (process.env.NEXT_PUBLIC_API_BASE || "") + "/api/chats",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       if (!res.ok) return;
//       const body = await res.json();
//       set((s) => ({
//         state: reducer(s.state, {
//           type: "LOAD_CHATS",
//           conversations: body.conversations ?? [],
//           chats: body.chats ?? {},
//         } as Action),
//       }));
//     } catch (err) {}
//   },

//   loadMessages: (convId: string) => {
//     try {
//       const ws = wsRef;
//       if (ws && ws.readyState === WebSocket.OPEN) {
//         ws.send(
//           JSON.stringify({
//             action: "getAllMessages",
//             data: { conversationId: convId },
//           })
//         );
//         return;
//       }
//     } catch (e) {}

//     const token = get().state.token;
//     if (!token) return;
//     void (async () => {
//       try {
//         const res = await fetch(
//           (process.env.NEXT_PUBLIC_API_BASE || "") +
//             `/api/conversations/${convId}/messages`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         if (!res.ok) return;
//         const body = await res.json();
//         const messages: Message[] = body ?? [];
//         set((s) => ({
//           state: reducer(s.state, {
//             type: "LOAD_MESSAGES",
//             convId,
//             messages,
//           } as Action),
//         }));
//       } catch (err) {}
//     })();
//   },

//   setConversationFilter: (filter: "all" | "group" | "personal" | "broadcast") =>
//     set((s) => ({
//       state: reducer(s.state, {
//         type: "SET_CONVERSATION_FILTER",
//         filter,
//       } as Action),
//     })),

//   sendSocketAction: (action: string, data: unknown = {}) => {
//     try {
//       const ws = wsRef;
//       if (ws && ws.readyState === WebSocket.OPEN) {
//         ws.send(JSON.stringify({ action, data }));
//         return true;
//       }
//     } catch (e) {}
//     return false;
//   },

//   sendSocketActionRequest: (
//     action: string,
//     data: unknown = {},
//     timeout = 10000
//   ) => {
//     return new Promise((resolve, reject) => {
//       try {
//         const ws = wsRef;
//         if (!ws || ws.readyState !== WebSocket.OPEN)
//           return reject(new Error("socket-not-open"));
//         const id = `req_${Date.now()}_${++reqCounter}`;
//         const payload = {
//           action,
//           data:
//             typeof data === "object" && data !== null
//               ? { ...(data as Record<string, unknown>) }
//               : data,
//           requestId: id,
//         };
//         const tid = window.setTimeout(() => {
//           if (pendingRequests[id]) {
//             pendingRequests[id].reject(new Error("timeout"));
//             delete pendingRequests[id];
//           }
//         }, timeout);
//         pendingRequests[id] = { resolve, reject, timeoutId: tid };
//         ws.send(JSON.stringify(payload));
//       } catch (e) {
//         reject(e);
//       }
//     });
//   },
// }));

export { useChatStore }

// A small client component that initializes store (restores auth from localStorage)
export const ChatStoreInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
		const token = useChatStore((s) => s.state.token)
		const setAuthFromLogin = useChatStore((s) => s.setAuthFromLogin)
		const connectSocket = useChatStore((s) => s.connectSocket)
		const pathname = usePathname()

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

		// connect only when token is present AND the user is on /chat route
		useEffect(() => {
			try {
				if (token && pathname && pathname.startsWith("/chat")) connectSocket()
			} catch (e) {}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [token, pathname])

	return <>{children}</>
}

export default useChatStore

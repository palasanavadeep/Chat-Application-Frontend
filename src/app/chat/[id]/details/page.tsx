// "use client"

// import React from "react"
// import Image from 'next/image'
// import { useParams } from "next/navigation"
// import { useChatStore } from "@/lib/store/useChatStore"
// import { base64ToDataUrl } from "@/lib/utils"
// // using built-in toLocaleDateString to avoid new deps

// export default function ConversationDetailsPage() {
//   const params = useParams()
//   const id = params?.id as string | undefined
//   const conversation = useChatStore((s) => s.state.conversations.find((c) => String(c.id) === String(id)))

//   if (!id) return <div className="p-6">No conversation selected</div>
//   if (!conversation) return <div className="p-6">Loading conversation...</div>

//   const isGroup = (conversation.type?.lookupCode ?? '').toLowerCase() === 'group'

//   // const name = isGroup ? conversation.name : conversation.conversationParticipants.
//   const sendSocketAction = useChatStore((s) => s.sendSocketAction)

//   React.useEffect(() => {
//     // If it's a group and we don't have participant details, request full conversation
//     // from server. We assume server accepts action "getConversation" with { conversationId }
//     // and will push a "getConversationResponse" containing the conversation (including participants).
//     try {
//       if (isGroup) {
//         sendSocketAction("getConversation", { conversationId: conversation.id })
//       }
//     } catch (e) {}
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [conversation?.id])
//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <div className="flex items-start gap-4 mb-4">
//         {isGroup ? (
//           <>
//             <div className="w-20 h-20 relative rounded-full overflow-hidden">
//               <Image src={conversation.conversationImage?.file ?
//                   base64ToDataUrl(conversation.conversationImage?.file) :
//                   '/defaultImage.jpg'}
//                   alt="Conversation Image" fill sizes="80px" className="object-cover" unoptimized />
//             </div>
//             <div className="flex-1">
//               <h1 className="text-2xl font-semibold">{conversation.name ?? `Group ${conversation.id}`}</h1>
//               <div className="text-sm text-muted-foreground">{conversation.description ?? ''}</div>
//               <div className="text-xs text-muted-foreground mt-1">Created by {conversation.createdBy?.username ?? conversation.createdBy?.displayName ?? String(conversation.createdBy?.id ?? '')} on {conversation.createdAt ? new Date(conversation.createdAt).toLocaleDateString() : '—'}</div>
//             </div>
//           </>
//         ) : (
//           // personal: show the other participant's avatar and display name
//           (() => {
//             const participants = conversation.conversationParticipants ?? []
//             // console.log("getParticipants : "+JSON.stringify(participants));
//             const me = useChatStore.getState().state.user
//             const other = participants.find((p) => String(p?.user?.id) !== String(me?.id))?.user ?? participants[0]?.user
//             return (
//               <>
//                 <div className="w-20 h-20 relative rounded-full overflow-hidden">
//                   <Image src={other?.profileImage?.file ? base64ToDataUrl(other?.profileImage?.file) : '/defaultImage.jpg'}
//                         alt="person" fill sizes="80px" className="object-cover" unoptimized />
//                 </div>
//                 <div className="flex-1">
//                   <h1 className="text-2xl font-semibold">{other?.displayName ?? other?.username ?? `Conversation ${conversation.id}`}</h1>
//                   <div className="text-sm text-muted-foreground">{other?.username ?? ''}</div>
//                   <div className="text-xs text-muted-foreground mt-1">Started on {conversation.createdAt ? new Date(conversation.createdAt).toLocaleDateString() : '—'}</div>
//                 </div>
//               </>
//             )
//           })()
//         )}
//       </div>

//       <section className="mb-6">
//         <h2 className="text-lg font-medium mb-2">Participants</h2>
//         <div className="space-y-2">
//           {(conversation.conversationParticipants ?? []).map((p) => (
//             <div key={String(p?.id ?? p?.user?.id ?? Math.random())} className="p-3 border rounded flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 relative rounded-full overflow-hidden">
//                   <Image src={p?.user?.profileImage?.file ? base64ToDataUrl(p?.user?.profileImage?.file) : '/defaultImage.jpg'} alt={p?.user?.displayName ?? p?.user?.username ?? 'user'} fill sizes="40px" className="object-cover" unoptimized />
//                 </div>
//                 <div>
//                   <div className="font-medium">{p?.user?.displayName ?? p?.user?.username ?? String(p?.user?.id ?? '')}</div>
//                   <div className="text-sm text-muted-foreground">{String(p?.role ?? 'Member')}</div>
//                 </div>
//               </div>
//               <div className="text-sm text-muted-foreground">{p?.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</div>
//             </div>
//           ))}
//         </div>
//       </section>

//       <section>
//         <h2 className="text-lg font-medium mb-2">Details</h2>
//         <div className="space-y-2 text-sm text-muted-foreground">
//           <div><strong>ID:</strong> {String(conversation.id)}</div>
//           <div><strong>Type:</strong> {conversation.type?.lookupName ?? conversation.type?.lookupCode ?? '—'}</div>
//           <div><strong>Last message:</strong> {conversation.lastMessage?.body ?? '—'}</div>
//         </div>
//       </section>
//     </div>
//   )
// }

// ---------------------------------------------------------------------------------------------------------------

// "use client";

// import React from "react";
// import Image from "next/image";
// import { useParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   ContextMenu,
//   ContextMenuContent,
//   ContextMenuItem,
//   ContextMenuTrigger,
// } from "@/components/ui/context-menu";
// import { useChatStore } from "@/lib/store/useChatStore";
// import { base64ToDataUrl } from "@/lib/utils";
// import SearchUser from "@/components/SearchUser";

// export default function ConversationSettingsPage() {
//   const params = useParams();
//   const id = params?.id as string | undefined;

//   const { state, sendSocketAction } = useChatStore();
//   const { conversations, user } = state;
//   const conversation = conversations.find((c) => String(c.id) === String(id));

//   const [activeTab, setActiveTab] = React.useState<
//     "details" | "members" | "actions"
//   >("details");
//   const [searchTerm, setSearchTerm] = React.useState("");
//   const [searchResults, setSearchResults] = React.useState<any[]>([]);

//   const isGroup =
//     (conversation?.type?.lookupCode ?? "").toLowerCase() === "group";
//   const participants = conversation?.conversationParticipants ?? [];
//   const myParticipant = participants.find(
//     (p) => String(p?.user?.id) === String(user?.id)
//   );
//   const isAdmin = myParticipant?.role?.lookupCode === "ADMIN";

//   // console.log("isAdmin" + isAdmin);

  // React.useEffect(() => {
  //   if (conversation && isGroup) {
  //     try {
  //       sendSocketAction("getConversation", {
  //         conversationId: conversation.id,
  //       });
  //     } catch (e) {}
  //   }
  // }, [conversation?.id, isGroup, sendSocketAction]);

//   if (!id) return <div className="p-6">No conversation selected</div>;
//   if (!conversation) return <div className="p-6">Loading conversation...</div>;

//   const handleSearch = async (term: string) => {
//     setSearchTerm(term);
//     // Replace with actual search logic
//     if (term.trim().length > 2) {
//       setSearchResults([
//         { id: 101, username: "teja", displayName: "Teja" },
//         { id: 102, username: "pavan", displayName: "Pavan" },
//       ]);
//     } else {
//       setSearchResults([]);
//     }
//   };

//   const handleAddMember = (userId: number) => {
//     sendSocketAction("addParticipant", {
//       conversationId: conversation.id,
//       userId,
//     });
//   };

//   const handleRoleChange = (participantId: number, action: string) => {
//     if (action === "makeAdmin") {
//       sendSocketAction("updateParticipantRole", {
//         participantId,
//         role: "admin",
//       });
//     } else if (action === "removeAdmin") {
//       sendSocketAction("updateParticipantRole", {
//         participantId,
//         role: "member",
//       });
//     } else if (action === "removeParticipant") {
//       sendSocketAction("removeParticipant", { participantId });
//     }
//   };

//   const handleLeaveOrDelete = () => {
//     if (isGroup)
//       sendSocketAction("leaveConversation", {
//         conversationId: conversation.id,
//       });
//     else
//       sendSocketAction("deleteConversation", {
//         conversationId: conversation.id,
//       });
//   };

//   // --- Header Info ---
//   const headerName = isGroup
//     ? conversation.name ?? `Group ${conversation.id}`
//     : participants.find((p) => String(p.user?.id) !== String(user?.id))?.user
//         ?.displayName ?? "Conversation";

//   const headerImage = isGroup
//     ? conversation.conversationImage?.file
//     : participants.find((p) => String(p.user?.id) !== String(user?.id))?.user
//         ?.profileImage?.file;

//   const headerDate = conversation.createdAt
//     ? new Date(conversation.createdAt).toLocaleDateString("en-GB", {
//         day: "numeric",
//         month: "long",
//         year: "numeric",
//       })
//     : "—";

//   return (
//     <div className="flex flex-col h-full bg-white border-l">
//       {/* --- Header Section --- */}
//       <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 p-6 border-b">
//         {/* Conversation / Group Image */}
//         <div className="w-24 h-24 relative rounded-full overflow-hidden flex-shrink-0 shadow-lg">
//           <Image
//             src={
//               headerImage ? base64ToDataUrl(headerImage) : "/defaultImage.jpg"
//             }
//             alt="Profile"
//             fill
//             sizes="96px"
//             className="object-cover"
//             unoptimized
//           />
//         </div>

//         {/* Conversation Details */}
//         <div className="flex flex-col justify-center text-center sm:text-left">
//           <h1 className="text-2xl font-semibold">{headerName}</h1>
//           <p className="text-sm text-gray-500 mt-2">
//             Chat created on {headerDate} by{" "}
//             <strong className="font-bold text-gray-700">
//               {conversation.createdBy?.username}
//             </strong>
//           </p>
//         </div>
//       </div>

//       {/* --- Main Layout --- */}
//       <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
//         {/* Sidebar */}
//         <aside className="w-full md:w-56 border-r p-4 space-y-2">
//           <button
//             onClick={() => setActiveTab("details")}
//             className={`w-full text-left px-2 py-1 rounded ${
//               activeTab === "details"
//                 ? "bg-gray-200 font-medium"
//                 : "hover:bg-gray-100"
//             }`}
//           >
//             Basic Details
//           </button>
//           {isGroup && (
//             <button
//               onClick={() => setActiveTab("members")}
//               className={`w-full text-left px-2 py-1 rounded ${
//                 activeTab === "members"
//                   ? "bg-gray-200 font-medium"
//                   : "hover:bg-gray-100"
//               }`}
//             >
//               Members
//             </button>
//           )}
//           <button
//             onClick={() => setActiveTab("actions")}
//             className={`w-full text-left px-2 py-1 rounded text-red-600 ${
//               activeTab === "actions"
//                 ? "bg-red-100 font-medium"
//                 : "hover:bg-red-50"
//             }`}
//           >
//             {isGroup ? "Leave Group" : "Delete Chat"}
//           </button>
//         </aside>

//         {/* Main Content */}
//         <div className="flex-1 p-6 overflow-y-auto">
//           {/* Basic Details */}
//           {activeTab === "details" && (
//             <>
//               {isGroup ? (
//                 <div className="space-y-4 max-w-md">
//                   <div>
//                     <label className="block text-sm font-medium">
//                       Group Name
//                     </label>
//                     <Input
//                       value={conversation.name ?? ""}
//                       onChange={() => {}}
//                       disabled={!isAdmin}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium">
//                       Group Description
//                     </label>
//                     <Input
//                       value={conversation.description ?? ""}
//                       onChange={() => {}}
//                       disabled={!isAdmin}
//                     />
//                   </div>
//                   {isAdmin && <Button className="mt-3">Save</Button>}
//                 </div>
//               ) : (
//                 (() => {
//                   const otherUser =
//                     participants.find(
//                       (p) => String(p.user?.id) !== String(user?.id)
//                     )?.user ?? participants[0]?.user;
//                   return (
//                     <div className="flex items-start gap-4">
//                       <div className="w-20 h-20 relative rounded-full overflow-hidden">
//                         <Image
//                           src={
//                             otherUser?.profileImage?.file
//                               ? base64ToDataUrl(otherUser.profileImage.file)
//                               : "/defaultImage.jpg"
//                           }
//                           alt="Profile"
//                           fill
//                           sizes="80px"
//                           className="object-cover"
//                           unoptimized
//                         />
//                       </div>
//                       <div>
//                         <div className="text-xl font-semibold">
//                           {otherUser?.displayName ?? otherUser?.username}
//                         </div>
//                         <div className="text-sm text-gray-600">
//                           Registered on{" "}
//                           {otherUser?.createdAt
//                             ? new Date(otherUser.createdAt).toLocaleDateString()
//                             : "—"}
//                         </div>
//                         <div className="text-sm text-gray-500 mt-2">
//                           Chat started on {headerDate}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })()
//               )}
//             </>
//           )}

//           {/* Members Section (Group Only)
//           {activeTab === "members" && isGroup && (
//             <div className="space-y-6 max-w-md">
//               {isAdmin && (
//                 // <div>
//                 //   <label className="block text-sm font-medium mb-2">
//                 //     Add Members
//                 //   </label>
//                 //   <div className="flex gap-2">
//                 //     <Input
//                 //       placeholder="Search by username or email"
//                 //       value={searchTerm}
//                 //       onChange={(e) => handleSearch(e.target.value)}
//                 //     />
//                 //   </div>
//                 //   {searchResults.length > 0 && (
//                 //     <div className="border mt-2 rounded">
//                 //       {searchResults.map((u) => (
//                 //         <div
//                 //           key={u.id}
//                 //           className="flex justify-between items-center px-3 py-2 hover:bg-gray-50"
//                 //         >
//                 //           <div>{u.displayName ?? u.username}</div>
//                 //           <Button
//                 //             size="sm"
//                 //             variant="outline"
//                 //             onClick={() => handleAddMember(u.id)}
//                 //           >
//                 //             Add
//                 //           </Button>
//                 //         </div>
//                 //       ))}
//                 //     </div>
//                 //   )}
//                 // </div>
//                 <SearchUser
//                 />
//               )}

//               <div>
//                 <h3 className="font-medium mb-2">Members</h3>
//                 <div className="space-y-2">
//                   {participants.map((p) => (
//                     <ContextMenu key={p.id}>
//                       <ContextMenuTrigger>
//                         <div className="flex items-center justify-between border p-2 rounded hover:bg-gray-50">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 relative rounded-full overflow-hidden">
//                               <Image
//                                 src={
//                                   p?.user?.profileImage?.file
//                                     ? base64ToDataUrl(p.user.profileImage.file)
//                                     : "/defaultImage.jpg"
//                                 }
//                                 alt={p?.user?.displayName ?? "user"}
//                                 fill
//                                 sizes="40px"
//                                 className="object-cover"
//                                 unoptimized
//                               />
//                             </div>
//                             <div>
//                               <div className="font-medium">
//                                 {p?.user?.displayName ?? p?.user?.username}
//                               </div>
//                               <div className="text-xs text-gray-500">
//                                 {p?.role?.lookupCode ?? "member"} • Joined{" "}
//                                 {p?.createdAt
//                                   ? new Date(p.createdAt).toLocaleDateString()
//                                   : "—"}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </ContextMenuTrigger>

//                       {isAdmin && p.id !== myParticipant.id && (
//                         <ContextMenuContent>
//                           {p.role?.lookupCode !== "admin" ? (
//                             <ContextMenuItem
//                               onClick={() =>
//                                 handleRoleChange(Number(p.id), "makeAdmin")
//                               }
//                             >
//                               Make Admin
//                             </ContextMenuItem>
//                           ) : (
//                             <ContextMenuItem
//                               onClick={() =>
//                                 handleRoleChange(Number(p.id), "removeAdmin")
//                               }
//                             >
//                               Remove Admin
//                             </ContextMenuItem>
//                           )}
//                           <ContextMenuItem
//                             className="text-red-600"
//                             onClick={() =>
//                               handleRoleChange(
//                                 Number(p.id),
//                                 "removeParticipant"
//                               )
//                             }
//                           >
//                             Remove Participant
//                           </ContextMenuItem>
//                         </ContextMenuContent>
//                       )}
//                     </ContextMenu>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )} */}
//           {/* Members Section (Group Only) */}
// {activeTab === "members" && isGroup && (
//   <div className="space-y-6 max-w-md">
//     {isAdmin && (
//       <div>
//         <label className="block text-sm font-medium mb-2">
//           Add Members
//         </label>

//         {/* Use SearchUser Component */}
//         <SearchUser
//           placeholder="Search by username or email"
//           onSelect={(user) => handleAddMember(user.id)}
//         />
//       </div>
//     )}

//     <div>
//       <h3 className="font-medium mb-2">Members</h3>
//       <div className="space-y-2">
//         {participants.map((p) => (
//           <ContextMenu key={p.id}>
//             <ContextMenuTrigger>
//               <div className="flex items-center justify-between border p-2 rounded hover:bg-gray-50">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 relative rounded-full overflow-hidden">
//                     <Image
//                       src={
//                         p?.user?.profileImage?.file
//                           ? base64ToDataUrl(p.user.profileImage.file)
//                           : "/defaultImage.jpg"
//                       }
//                       alt={p?.user?.displayName ?? "user"}
//                       fill
//                       sizes="40px"
//                       className="object-cover"
//                       unoptimized
//                     />
//                   </div>
//                   <div>
//                     <div className="font-medium">
//                       {p?.user?.displayName ?? p?.user?.username}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {p?.role?.lookupCode ?? "member"} • Joined{" "}
//                       {p?.createdAt
//                         ? new Date(p.createdAt).toLocaleDateString()
//                         : "—"}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </ContextMenuTrigger>

//             {isAdmin && (
//               <ContextMenuContent>
//                 {p.role?.lookupCode !== "admin" ? (
//                   <ContextMenuItem
//                     onClick={() =>
//                       handleRoleChange(Number(p.id), "makeAdmin")
//                     }
//                   >
//                     Make Admin
//                   </ContextMenuItem>
//                 ) : (
//                   <ContextMenuItem
//                     onClick={() =>
//                       handleRoleChange(Number(p.id), "removeAdmin")
//                     }
//                   >
//                     Remove Admin
//                   </ContextMenuItem>
//                 )}
//                 <ContextMenuItem
//                   className="text-red-600"
//                   onClick={() =>
//                     handleRoleChange(Number(p.id), "removeParticipant")
//                   }
//                 >
//                   Remove Participant
//                 </ContextMenuItem>
//               </ContextMenuContent>
//             )}
//           </ContextMenu>
//         ))}
//       </div>
//     </div>
//   </div>
// )}

//           {/* Leave/Delete Section */}
//           {activeTab === "actions" && (
//             <div className="text-center mt-10">
//               <Button variant="destructive" onClick={handleLeaveOrDelete}>
//                 {isGroup ? "Leave Group" : "Delete Chat"}
//               </Button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// -------------------------------------------------------------------------------------------------------------

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useChatStore } from "@/lib/store/useChatStore";
import { base64ToDataUrl } from "@/lib/utils";
import { ROLES, CONVERSATION_TYPES } from "@/constants";
import SearchUser from "@/components/SearchUser";

export default function ConversationSettingsPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const { state, sendSocketAction ,clearSearchResults} = useChatStore();
  const { conversations, user } = state;
  const conversation = conversations.find((c) => String(c.id) === String(id));

  const [activeTab, setActiveTab] = React.useState<
    "details" | "members" | "actions"
  >("details");

  const [groupName,setGroupName] = useState(conversation?.name);
  const [groupDescription,setGroupDescription] = useState(conversation?.description);

  if (!id) return <div className="p-6">No conversation selected</div>;
  if (!conversation) return <div className="p-6">Loading conversation...</div>;

  const isGroup = conversation?.type?.lookupCode === CONVERSATION_TYPES.GROUP;
  const participants = conversation?.conversationParticipants ?? [];
  const myParticipant = participants.find(
    (p) => String(p?.user?.id) === String(user?.id)
  );
  const isAdmin = myParticipant?.role?.lookupCode === ROLES.ADMIN;

  const handleAddMember = (userId: number) => {
    sendSocketAction("addParticipant", {
      conversationId: conversation.id,
      userId,
    });
  };

  const handleRoleChange = (participantId: number, action: string) => {
    if (action === "makeAdmin") {
      sendSocketAction("updateParticipantRole", {
        participantId,
        role: ROLES.ADMIN,
      });
    } else if (action === "removeAdmin") {
      sendSocketAction("updateParticipantRole", {
        participantId,
        role: ROLES.MEMBER,
      });
    } else if (action === "removeParticipant") {
      sendSocketAction("removeParticipant", { participantId });
    }
  };

  const handleLeaveOrDelete = () => {
    if (isGroup)
      sendSocketAction("leaveConversation", {
        conversationId: conversation.id,
      });
    else
      sendSocketAction("deleteConversation", {
        conversationId: conversation.id,
      });
  };

  const handleSaveDetails = () => {
    if(isGroup && isAdmin){
      if(conversation.name !== groupName || conversation.description !== groupDescription){
        sendSocketAction(
          "updateConversation" , 
          {conversationId : conversation.id ,name : groupName , description : groupDescription});
      }else{
        console.log("unchanged details")
      }
    }else{
      console.log("Can't un authorized to complete this action");
    }
  }

  const headerName = isGroup
    ? conversation.name ?? `Group ${conversation.id}`
    : participants.find((p) => String(p.user?.id) !== String(user?.id))?.user
        ?.displayName ?? "Conversation";

  const headerImage = isGroup
    ? conversation.conversationImage?.file
    : participants.find((p) => String(p.user?.id) !== String(user?.id))?.user
        ?.profileImage?.file;

  const headerDate = conversation.createdAt
    ? new Date(conversation.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  React.useEffect(() => {
    
      if (conversation && isGroup) {
        try {
          sendSocketAction("getConversation", {
            conversationId: conversation.id,
          });
        } catch (e) {
          console.log(e);
        }
      }
  }, [conversation?.id, isGroup, sendSocketAction]);



  return (
    <div className="flex flex-col h-full bg-white border-l">
      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 p-6 border-b">
        <div className="w-24 h-24 relative rounded-full overflow-hidden flex-shrink-0 shadow-lg">
          <Image
            src={
              headerImage ? base64ToDataUrl(headerImage) : "/defaultImage.jpg"
            }
            alt="Profile"
            fill
            sizes="96px"
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex flex-col justify-center text-center sm:text-left">
          <h1 className="text-2xl font-semibold">{headerName}</h1>
          <p className="text-sm text-gray-500 mt-2">
            Chat created on {headerDate} by{" "}
            <strong className="font-bold text-gray-700">
              {conversation.createdBy?.username}
            </strong>
          </p>
        </div>
      </div>

      {/* --- Main Layout --- */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-56 border-r p-4 space-y-2">
          <button
            onClick={() => setActiveTab("details")}
            className={`w-full text-left px-2 py-1 rounded ${
              activeTab === "details"
                ? "bg-gray-200 font-medium"
                : "hover:bg-gray-100"
            }`}
          >
            Basic Details
          </button>
          {isGroup && (
            <button
              onClick={() => {
                setActiveTab("members");
                clearSearchResults();
              }}
              className={`w-full text-left px-2 py-1 rounded ${
                activeTab === "members"
                  ? "bg-gray-200 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              Members
            </button>
          )}
          <button
            onClick={() => setActiveTab("actions")}
            className={`w-full text-left px-2 py-1 rounded text-red-600 ${
              activeTab === "actions"
                ? "bg-red-100 font-medium"
                : "hover:bg-red-50"
            }`}
          >
            {isGroup ? "Leave Group" : "Delete Chat"}
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Basic Details */}
          {activeTab === "details" && (
            <>
              {isGroup ? (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium">
                      Group Name
                    </label>
                    <Input
                      value={groupName || conversation.name || "conversation Name"}
                      onChange={(e) => setGroupName(e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Group Description
                    </label>
                    <Input
                      value={groupDescription || conversation.description || "conversation descritption"}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                  {isAdmin && <Button className="mt-3" onClick={handleSaveDetails}>Save</Button>}
                </div>
              ) : (
                (() => {
                  const otherUser =
                    participants.find(
                      (p) => String(p.user?.id) !== String(user?.id)
                    )?.user ?? participants[0]?.user;
                  return (
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 relative rounded-full overflow-hidden">
                        <Image
                          src={
                            otherUser?.profileImage?.file
                              ? base64ToDataUrl(otherUser.profileImage.file)
                              : "/defaultImage.jpg"
                          }
                          alt="Profile"
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="text-xl font-semibold">
                          {otherUser?.displayName ?? otherUser?.username}
                        </div>
                        <div className="text-sm text-gray-600">
                          Registered on{" "}
                          {otherUser?.createdAt
                            ? new Date(otherUser.createdAt).toLocaleDateString()
                            : "—"}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          Chat started on {headerDate}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </>
          )}

          {/* Members Section (Group Only) */}
          {activeTab === "members" && isGroup && (
            <div className="space-y-6 max-w-md">
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Add Members
                  </label>
                  <SearchUser
                    placeholder="Search by username or email"
                    onSelect={(user) => handleAddMember(user.id)}
                  />
                </div>
              )}

              <div>
                <h3 className="font-medium mb-2">Members</h3>
                <div className="space-y-2">
                  {participants.map((p) => (
                    <ContextMenu key={p.id}>
                      <ContextMenuTrigger>
                        <div className="flex items-center justify-between border p-2 rounded hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative rounded-full overflow-hidden">
                              <Image
                                src={
                                  p?.user?.profileImage?.file
                                    ? base64ToDataUrl(p.user.profileImage.file)
                                    : "/defaultImage.jpg"
                                }
                                alt={p?.user?.displayName ?? "user"}
                                fill
                                sizes="40px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <div className="font-medium">
                                {p?.user?.displayName ?? p?.user?.username}
                              </div>
                              <div className="text-xs text-gray-500">
                                {p?.role?.lookupCode ?? ROLES.MEMBER} • Joined{" "}
                                {p?.createdAt
                                  ? new Date(p.createdAt).toLocaleDateString()
                                  : "—"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </ContextMenuTrigger>

                      {isAdmin && conversation.createdBy && p.user 
                        && conversation.createdBy.id !== p.user.id && (
                        <ContextMenuContent>
                          {p.role?.lookupCode !== ROLES.ADMIN ? (
                            <ContextMenuItem
                              onClick={() =>
                                handleRoleChange(Number(p.id), "makeAdmin")
                              }
                            >
                              Make Admin
                            </ContextMenuItem>
                          ) : (
                            <ContextMenuItem
                              onClick={() =>
                                handleRoleChange(Number(p.id), "removeAdmin")
                              }
                            >
                              Remove Admin
                            </ContextMenuItem>
                          )}
                          <ContextMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleRoleChange(
                                Number(p.id),
                                "removeParticipant"
                              )
                            }
                          >
                            Remove Participant
                          </ContextMenuItem>
                        </ContextMenuContent>
                      )}
                    </ContextMenu>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Leave/Delete Section */}
          {activeTab === "actions" && (
            <div className="text-center mt-10">
              <Button variant="destructive" onClick={handleLeaveOrDelete}>
                {isGroup ? "Leave Group" : "Delete Chat"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

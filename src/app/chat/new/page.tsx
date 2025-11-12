// "use client"

// import React, { useState } from "react"
// import SearchUser from "@/components/SearchUser"
// import { useChatStore } from "@/lib/store"
// import type { User } from "@/lib/types"
// import { useRouter } from "next/navigation"

// export default function NewChatPage() {
//   const [mode, setMode] = useState<"personal" | "group" | "broadcast">("group")
//   const [groupName, setGroupName] = useState("")
//   const [groupDesc, setGroupDesc] = useState("")
//   const [members, setMembers] = useState<User[]>([])
//   const { sendSocketAction, state, clearSearchResults, setSearchResults } = useChatStore()
//   const router = useRouter()

//   const addMember = (user: User) => {
//     if (members.find((m) => m.id === user.id)) return
//     setMembers((s) => [...s, user])
//     try {
//       // remove the added user from search results so they don't appear in the list anymore
//       const results = state.searchResults ?? []
//       const filtered = results.filter((u) => u.id !== user.id)
//       setSearchResults(filtered)
//     } catch (e) {}
//   }

//   const removeMember = (id: string | number) => setMembers((s) => s.filter((m) => m.id !== id))

//   const createPersonal = async (user: User) => {
//     // send ws action to create personal conversation
//     try {
//       sendSocketAction("createNewConversation", { type: "PERSONAL", participants: [user.id] })
//     } catch (e) {}
//     router.push('/chat')
//   }

//   const createGroup = async () => {
//     const participantIds = members.map((m) => m.id)
//     try {
//       sendSocketAction("createNewConversation", { type: "GROUP", name: groupName, description: groupDesc, participants: participantIds })
//     } catch (e) {}
//     router.push('/chat')
//   }

//   return (
//     <div className="h-full">
//       <h2 className="text-2xl font-semibold mb-2 p-2">Start a New Chat</h2>
//       <div className="flex h-[calc(100%-56px)] border rounded overflow-hidden">
//         <div className="w-48 bg-gray-50">
//           <button className={`w-full p-3 text-left ${mode === 'personal' ? 'bg-gray-200' : ''}`} onClick={() => { setMode('personal'); clearSearchResults(); }}>Personal Chat</button>
//           <button className={`w-full p-3 text-left ${mode === 'group' ? 'bg-gray-200' : ''}`} onClick={() => { setMode('group'); clearSearchResults(); }}>New Group</button>
//           <button className={`w-full p-3 text-left ${mode === 'broadcast' ? 'bg-gray-200' : ''}`} onClick={() => { setMode('broadcast'); clearSearchResults(); }}>New Broadcast</button>
//         </div>

//         <div className="flex-1 p-6">
//           {mode === 'personal' && (
//             <div>
//               <h3 className="font-semibold mb-3">Create Personal Conversation</h3>
//               {/* exact lookup by username for personal conversations */}
//               <SearchUser  onSelect={(u) => createPersonal(u)} />
//             </div>
//           )}

//           {mode === 'group' && (
//             <div>
//               <h3 className="font-semibold mb-3">Create new GroupChat</h3>
//               <div className="mb-3">
//                 <label className="block text-sm mb-1">Group Name</label>
//                 <input value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full p-3 border rounded" />
//               </div>
//               <div className="mb-3">
//                 <label className="block text-sm mb-1">Group Description</label>
//                 <textarea value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} className="w-full p-3 border rounded" />
//               </div>

//               <div className="mb-3">
//                 <label className="block text-sm mb-1">Members</label>
//                 <div className="space-y-2">
//                   {members.map((m) => (
//                     <div key={m.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
//                       <div>{m.displayName ?? m.username}</div>
//                       <button onClick={() => removeMember(m.id)} className="text-sm text-red-500">X</button>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label className="block text-sm mb-1">Add Members into the Group</label>
//                 <SearchUser onSelect={addMember} />
//               </div>

//               <div>
//                 <button onClick={createGroup} className="px-4 py-2 bg-blue-500 text-white rounded">Create Group</button>
//               </div>
//             </div>
//           )}

//           {mode === 'broadcast' && (
//             <div>
//               <h3 className="font-semibold mb-3">Create Broadcast (TODO)</h3>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

"use client";

import React, { useState, useEffect } from "react";
import SearchUser from "@/components/SearchUser";
import { useChatStore } from "@/lib/ChatStoreInitializer";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import FileUploadComponent from "@/components/FileUploadComponent";
import { base64ToDataUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function NewChatPage() {
  const [mode, setMode] = useState<"personal" | "group" | "broadcast">("group");
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [members, setMembers] = useState<User[]>([]);
  const [groupImage, setGroupImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { sendSocketAction, state, clearSearchResults, setSearchResults } =
    useChatStore();
  const router = useRouter();

  // cleanup preview URL when file changes or unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const addMember = (user: User) => {
    // check user already exists
    if (members.find((m) => m.id === user.id)) return;
    if(user.id === state.user?.id){
      toast.info("You are already in the Chat because you are the creator of this chat",
        {
          style: {
            '--normal-bg': 'var(--background)',
            '--normal-text': 'light-dark(var(--color-sky-600), var(--color-sky-400))',
            '--normal-border': 'light-dark(var(--color-sky-600), var(--color-sky-400))'
          } as React.CSSProperties,
          position : "top-right"
        }
      );
      return;
    }
    setMembers((s) => [...s, user]);
    try {
      const results = state.searchResults ?? [];
      const filtered = results.filter((u) => u.id !== user.id);
      setSearchResults(filtered);
    } catch (e) {}
  };

  const removeMember = (id: string | number) =>
    setMembers((s) => s.filter((m) => m.id !== id));

  const createPersonal = async (user: User) => {
    try {
      sendSocketAction("createNewConversation", {
        type: "PERSONAL",
        participants: [user.id],
      });
    } catch (e) {}
    router.push("/chat");
  };

  const createGroup = async () => {
    const participantIds = members.map((m) => m.id);
    try {
      // prepare form data to include the file
      const formData = new FormData();
      formData.append("type", "GROUP");
      formData.append("name", groupName);
      formData.append("description", groupDesc);
      formData.append("participants", JSON.stringify(participantIds));
      if (groupImage) formData.append("image", groupImage);

      // send via socket or through an API endpoint
      // if socket supports binary, you can pass the file directly
      // otherwise, you can upload via REST API and send the image URL in socket payload

      sendSocketAction(
        "createNewConversation",
        {
          type: "GROUP",
          name: groupName,
          description: groupDesc,
          participants: participantIds
        },
        groupImage
      );
    } catch (e) {
      console.error("Error creating group:", e);
    }
    router.push("/chat");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="h-full">
      <h2 className="text-2xl font-semibold mb-2 p-2">Start a New Chat</h2>
      <div className="flex h-[calc(100%-56px)] border rounded overflow-hidden">
        {/* Left sidebar */}
        <div className="w-48 bg-gray-50">
          <button
            className={`w-full p-3 text-left ${
              mode === "personal" ? "bg-gray-200" : ""
            }`}
            onClick={() => {
              setMode("personal");
              clearSearchResults();
            }}
          >
            Personal Chat
          </button>
          <button
            className={`w-full p-3 text-left ${
              mode === "group" ? "bg-gray-200" : ""
            }`}
            onClick={() => {
              setMode("group");
              clearSearchResults();
            }}
          >
            New Group
          </button>
          {/* Broadcast button */}
          {/* <button
            className={`w-full p-3 text-left ${
              mode === "broadcast" ? "bg-gray-200" : ""
            }`}
            onClick={() => {
              setMode("broadcast");
              clearSearchResults();
            }}
          >
            New Broadcast
          </button> */}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Personal Chat */}
          {mode === "personal" && (
            <div>
              <h3 className="font-semibold mb-3">
                Create Personal Conversation
              </h3>
              <SearchUser onSelect={(u) => createPersonal(u)} />
            </div>
          )}

          {/* Group Chat */}
          {mode === "group" && (
            <div>
              <h3 className="font-semibold mb-3">Create New Group Chat</h3>

              {/* Group image upload */}

              {/* Group name */}
              <div className="mb-3">
                <label className="block text-sm mb-1">Group Name</label>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full p-3 border rounded"
                />
              </div>

              {/* Group description */}
              <div className="mb-3">
                <label className="block text-sm mb-1">Group Description</label>
                <textarea
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full p-3 border rounded"
                />
              </div>

              <div className="mb-3">
                <p className="block text-sm mb-1">Group Image</p>
                <FileUploadComponent
                  id="group-image-upload"
                  file={groupImage}
                  setFile={setGroupImage}
                  styles="w-32 p-2 bg-white shadow-sm"
                />
              </div>

              {/* Members list */}
              <div className="mb-3">
                <label className="block text-sm mb-1 font-medium">
                  Members
                </label>
                <div className="space-y-2">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2 bg-gray-100 rounded"
                    >
                      <div className="flex items-center space-x-3">
                        {/* Profile Image */}
                        <img
                          src={
                            m.profileImage
                              ? base64ToDataUrl(m.profileImage?.file)
                              : "/defaultImage.png"
                          } // fallback image if no profileImage
                          alt={m.displayName || m.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />

                        {/* Name / Username */}
                        <div className="text-sm font-medium">{m.username}</div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeMember(m.id)}
                        className="pr-2 text-md text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search user to add members */}
              <div className="mb-4">
                <label className="block text-sm mb-1">
                  Add Members into the Group
                </label>
                <SearchUser onSelect={addMember} />
              </div>

              {/* Create group button */}
              <div>
                <button
                  onClick={createGroup}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Group
                </button>
              </div>
            </div>
          )}

          {/* Broadcast (TODO) */}
          {mode === "broadcast" && (
            <div>
              <h3 className="font-semibold mb-3">Create Broadcast (TODO)</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

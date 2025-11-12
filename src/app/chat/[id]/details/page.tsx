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
import { useRouter } from "next/navigation";

export default function ConversationSettingsPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();

  // ✅ All hooks must be defined before any conditional returns
  const sendSocketAction = useChatStore((s) => s.sendSocketAction);
  const conversation = useChatStore((s) =>
    s.state.conversations.find((c) => String(c.id) === String(id))
  );
  const user = useChatStore((s) => s.state.user);
  const clearSearchResults = useChatStore((s) => s.clearSearchResults);

  const [activeTab, setActiveTab] = useState<"details" | "members" | "actions">(
    "details"
  );
  const [groupName, setGroupName] = useState(conversation?.name ?? "");
  const [groupDescription, setGroupDescription] = useState(
    conversation?.description ?? ""
  );
  
  // ✅ Effect to request conversation data if needed
  useEffect(() => {
    try {
      const isGroupNow =
        (conversation?.type?.lookupCode ?? "").toLowerCase() === "group";
      if (
        isGroupNow && conversation
      ) {
        sendSocketAction("getConversation", { conversationId: conversation.id });
      }
    } catch (e) {
      console.error(e);
    }
  }, [conversation?.id, sendSocketAction]);
    useEffect(() => {
    if (!id || !conversation) {
      router.push("/chat");
    }
    }, [id, conversation, router]);


  // ✅ Early returns AFTER hooks
  if (!id) {
    return <div className="p-6">No conversation selected</div>;
  }
  if (!conversation) {
    return <div className="p-6">Loading conversation...</div>;
  }

  const isGroup = conversation?.type?.lookupCode === CONVERSATION_TYPES.GROUP;
  const participants = conversation?.conversationParticipants ?? [];
  const myParticipant = participants.find(
    (p) => String(p?.user?.id) === String(user?.id)
  );
  const isAdmin = myParticipant?.role?.lookupCode === ROLES.ADMIN;

  // ✅ Handlers
  const handleAddMember = (userId: number) => {
    sendSocketAction("addUserToConversation", {
      conversationId: conversation.id,
      newUserId: userId,
    });
    clearSearchResults();
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
      sendSocketAction("removeUserFromConversation", { participantId });
    }
  };

  const handleLeaveOrDelete = () => {
    sendSocketAction("leaveConversation", {
      conversationId: conversation.id,
    });
  };

  const handleSaveDetails = () => {
    if (isGroup && isAdmin) {
      if (
        conversation.name !== groupName ||
        conversation.description !== groupDescription
      ) {
        sendSocketAction("updateConversation", {
          conversationId: conversation.id,
          name: groupName,
          description: groupDescription,
        });
      } else {
        console.log("No changes detected.");
      }
    } else {
      console.warn("Unauthorized to modify this conversation.");
    }
  };

  // ✅ Header details
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

  

  // ✅ Render
  return (
    <div className="flex flex-col h-full bg-white border-l">
      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-6 border-b">
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
          {/* --- Basic Details --- */}
          {activeTab === "details" && (
            <>
              {isGroup ? (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium">
                      Group Name
                    </label>
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Group Description
                    </label>
                    <Input
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                  {isAdmin && (
                    <Button className="mt-3" onClick={handleSaveDetails}>
                      Save
                    </Button>
                  )}
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

          {/* --- Members Section (Group Only) --- */}
          {activeTab === "members" && isGroup && (
            <div className="space-y-6 max-w-md">
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Add Members
                  </label>
                  <SearchUser
                    placeholder="Search by username"
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
                                {p?.leftAt
                                  ? " • Left " +
                                    new Date(p.leftAt).toLocaleDateString()
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      </ContextMenuTrigger>

                      {isAdmin &&
                        conversation.createdBy &&
                        p.user &&
                        conversation.createdBy.id !== p.user.id && (
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

          {/* --- Leave/Delete Section --- */}
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

// import React from 'react';
// import Image from 'next/image'
// import { Message, User,Attachment } from "@/lib/types"
// import { base64ToDataUrl } from '@/lib/utils';

// interface MessageProps {
//   message: Message;
//   currentUserId: number;
// }

// const MessageComponent: React.FC<MessageProps> = ({ message, currentUserId }) => {
//   const isCurrentUser = message?.sender.id === currentUserId;

//   const renderAttachment = (attachment?: Attachment): string | undefined => {
//     if (!attachment) return undefined;
//     return base64ToDataUrl(attachment.file);
//   };

//   const attachmentSrc = renderAttachment(message.attachment);

//   return (
    // <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} my-2`}>
    //   <div className={`max-w-[70%] p-3 rounded-lg ${isCurrentUser ? 'bg-green-100' : 'bg-gray-100'}`}>
    //     <div className="text-sm text-gray-700">{message.body}</div>
    //     {attachmentSrc && (
    //       <div className="mt-2">
    //         <Image src={attachmentSrc} alt="attachment" width={400} height={300} className="rounded" unoptimized />
    //       </div>
    //     )}
    //     <div className="text-xs text-muted-foreground">
    //     {message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}</div>
    //   </div>
      
    // </div>
//   );
// };

// export default MessageComponent;


// "use client";

// import React from "react";
// import { Message, User, Attachment } from "@/lib/types";
// import { base64ToDataUrl } from "@/lib/utils";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { MoreVertical } from "lucide-react";

// interface MessageProps {
//   message: Message;
//   currentUserId: number;
//   socket?: WebSocket; // optional, to emit events
// }

// const MessageComponent: React.FC<MessageProps> = ({
//   message,
//   currentUserId,
//   socket,
// }) => {
//   const isCurrentUser = message?.sender.id === currentUserId;

//   const attachmentSrc = message.attachment
//     ? base64ToDataUrl(message.attachment.file)
//     : undefined;

//   const handleEdit = () => {
//     if (socket && socket.readyState === WebSocket.OPEN) {
//       socket.send(
//         JSON.stringify({
//           type: "editMessage",
//           payload: { messageId: message.id },
//         })
//       );
//     }
//     console.log("Edit message:", message.id);
//   };

//   const handleDelete = () => {
//     if (socket && socket.readyState === WebSocket.OPEN) {
//       socket.send(
//         JSON.stringify({
//           type: "deleteMessage",
//           payload: { messageId: message.id },
//         })
//       );
//     }
//     console.log("Delete message:", message.id);
//   };

//   return (
//     <div
//       className={`flex ${
//         isCurrentUser ? "justify-end" : "justify-start"
//       } my-2 px-3`}
//     >
//       <Card
//         className={`relative group max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
//           isCurrentUser
//             ? "bg-primary text-primary-foreground"
//             : "bg-muted text-foreground"
//         }`}
//       >
//         {/* Dropdown Trigger (visible on hover) */}
//         <div
//           className={`absolute top-2 ${
//             isCurrentUser ? "right-2" : "left-2"
//           } opacity-0 group-hover:opacity-100 transition-opacity`}
//         >
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-6 w-6 p-0 hover:bg-transparent"
//               >
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align={isCurrentUser ? "end" : "start"}>
//               <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
//               <DropdownMenuItem onClick={handleDelete}>
//                 Delete
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>

//         {/* Message Content */}
//         <div className="text-sm whitespace-pre-wrap break-words">
//           {message.body}
//         </div>

//         {/* Attachment (image preview) */}
//         {attachmentSrc && (
//           <img
//             src={attachmentSrc}
//             alt="Attachment"
//             className="mt-2 rounded-lg max-h-48 object-contain"
//           />
//         )}

//         {/* Timestamp */}
//         <div
//           className={`text-[10px] mt-2 ${
//             isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
//           } text-right`}
//         >
//           {message.createdAt
//             ? new Date(message.createdAt).toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               })
//             : ""}
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default MessageComponent;

"use client";

import React, { useState } from "react";
import { Message, Attachment } from "@/lib/types";
import { base64ToDataUrl } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useChatStore } from "@/lib/store"

interface MessageProps {
  message: Message;
  currentUserId: number;
}

const MessageComponent: React.FC<MessageProps> = ({
  message,
  currentUserId,
}) => {
  const isCurrentUser = message?.sender.id === currentUserId;
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(message.body || "");

  const { sendSocketAction } = useChatStore()


  const attachmentSrc = message.attachment
    ? base64ToDataUrl(message.attachment.file)
    : undefined;



  // --- Socket Emitters ---
  const emitSocketEvent = (type: string, payload: any) => {
    try {
      const ok = sendSocketAction(type, payload);
      if (!ok) {
        // could show toast
        console.warn("socket not open")
      }
    } catch (e) {}
  };

  const handleEdit = () => setIsEditing(true);

  const handleDeleteForMe = () => {
    emitSocketEvent("deleteMessageForMe", { messageId: message.id });
  };
  const handleDeleteForEveryone = () => {
    emitSocketEvent("deleteMessageForEveryone", { messageId: message.id , conversationId : message.conversationId});
  };

  const handleCancelEdit = () => {
    setEditedBody(message.body || "");
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (editedBody.trim().length === 0) return;
    emitSocketEvent("editMessage", {
      messageId: message.id,
      messageContent : editedBody.trim(),
    });
    setEditedBody(editedBody.trim());
    setIsEditing(false);
  };

  return (
    <div
      className={`flex ${
        isCurrentUser ? "justify-end" : "justify-start"
      } my-2 px-1 justify-end`}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <Card
              className={`relative rounded-2xl px-4 py-3 shadow-sm transition-all
              ${isCurrentUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted mr-auto"}
              max-w-[75%]
            `}
          >
            {/* Editing Mode */}
            {isEditing ? (
              <div className="flex flex-col space-y-2">
                <Input
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="bg-background text-foreground"
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-green-500 hover:text-green-600"
                    onClick={handleSaveEdit}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Message Body */}
                <div className="text-sm whitespace-pre-wrap break-words ">
                  {message.body}
                </div>

                {/* Attachment */}
                {attachmentSrc && (
                  <img
                    src={attachmentSrc}
                    alt="Attachment"
                    className="mt-1 rounded-lg max-h-52 object-contain"
                  />
                )}

                {/* Timestamp */}
                <div
                  className={`text-[10px] mt-2 text-right ${
                    isCurrentUser
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.createdAt
                    ? new Date(message.createdAt).toLocaleDateString()+
                    " " + new Date(message.createdAt).toLocaleTimeString()
                    : ""}
                </div>
              </>
            )}
          </Card>
        </ContextMenuTrigger>

        {/* Right-click menu */}
        {!isEditing && (
          <ContextMenuContent>
            {
              message.sender.id === currentUserId && 
              <>
                <ContextMenuItem onClick={handleEdit}>Edit</ContextMenuItem>
                <ContextMenuItem onClick={handleDeleteForEveryone}>Delete for Everyone</ContextMenuItem>
              </>
            }
            <ContextMenuItem onClick={handleDeleteForMe}>Delete from Me</ContextMenuItem>
          
          </ContextMenuContent>
        )}
      </ContextMenu>
    </div>
  );
};

export default MessageComponent;

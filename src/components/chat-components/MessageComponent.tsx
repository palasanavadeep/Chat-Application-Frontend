import React from 'react';
import { Message, User,Attachment } from "@/lib/types"
import { base64ToDataUrl } from '@/lib/utils';

interface MessageProps {
  message: Message;
  currentUserId: number;
}

const MessageComponent: React.FC<MessageProps> = ({ message, currentUserId }) => {
  const isCurrentUser = message?.sender.id === currentUserId;

  const renderAttachment = (attachment?: Attachment): string | undefined => {
    if (!attachment) return undefined;
    return base64ToDataUrl(attachment.file);
  };

  const attachmentSrc = renderAttachment(message.attachment);

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div className={`max-w-[70%] p-3 rounded-lg ${isCurrentUser ? 'bg-green-100' : 'bg-gray-100'}`}>
        <div className="text-sm text-gray-700">{message.body}</div>
        {attachmentSrc && <img src={attachmentSrc} alt="attachment" />}
        <div className="text-xs text-muted-foreground">
        {message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}</div>
      </div>
      
    </div>
  );
};

export default MessageComponent;

import React from 'react';
import type { Conversation } from '@/lib/types'

interface ChatListItemProps {
    conversation: Conversation
}

const ChatListItem: React.FC<ChatListItemProps> = ({ conversation }) => {
    // Determine display name
    const isGroup = (conversation.type ?? '').toLowerCase() === 'group'
    const displayName = isGroup ? (conversation.name ?? conversation.title ?? `Group ${conversation.id}`) : (() => {
        // personal: try to find the other participant's name
        const parts = conversation.conversationParticipants ?? []
        // if two participants, pick the one that's not the current user (store not accessible here)
        const other = parts.length === 2 ? parts[0] : parts[0]
        return other?.user?.displayName ?? other?.user?.username ?? conversation.title ?? `Conversation ${conversation.id}`
    })()

    const lastMessage = conversation.lastMessage?.content ?? ''
    const hasUnread = !!conversation.hasUnreadMessages || !!conversation.unreadCount

    const imageSrc = conversation.conversationImage?.file ?? '/defaultImage.png'

    return (
        <div className="flex items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition">
            <img
                src={imageSrc}
                alt={`${displayName} profile`}
                className="w-12 h-12 rounded-full object-cover mr-3"
            />
            <div className="flex-1">
                <div className="text-base font-semibold text-gray-800">{displayName}</div>
                <div className="text-sm text-gray-600 truncate">{lastMessage}</div>
            </div>
            {hasUnread && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
        </div>
    );
};

export default ChatListItem;

"use client";

import React, { useEffect } from 'react';
import type { Conversation } from '@/lib/types'
import { useChatStore } from '@/lib/store'
import { base64ToDataUrl } from '@/lib/utils';

interface ChatListItemProps {
    conversation: Conversation
}

const ChatListItem: React.FC<ChatListItemProps> = ({ conversation }) => {
    // Determine display name and image depending on conversation type
    const isGroup = (conversation.type?.lookupCode ?? '').toLowerCase() === 'group'
    const me = useChatStore((s) => s.state.user)
    
    let displayName: string
    let imageSrc: string

    useEffect(()=>{
        console.log(conversation)
    },[])

    if (isGroup) {
        displayName = conversation.name ?? `Group ${conversation.id}`
        imageSrc = conversation.conversationImage?.file || '/defaultImage.jpg';
    } else {
        // personal: pick the other participant (user.id !== current user id)
        const parts = conversation.conversationParticipants ?? []
        const myId = Number(me?.id)
        const otherPart = parts.find(p => Number(p?.user?.id) !== myId) ?? parts[0]
        const otherUser = otherPart?.user
        displayName = otherUser?.displayName ?? otherUser?.username ?? conversation.name ?? `Conversation ${conversation.id}`
        imageSrc = otherUser?.profileImage?.file ?? conversation.conversationImage?.file ?? '/defaultImage.jpg'
    }

    const lastMessage = conversation.lastMessage?.body ?? 'Start Chat'
    const hasUnread = !!conversation.hasUnreadMessages || !!conversation.unreadCount

    return (
        <div className="flex items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition">
            <img
                src={ imageSrc === '/defaultImage.jpg' ? '/defaultImage.jpg' : base64ToDataUrl(imageSrc)}
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

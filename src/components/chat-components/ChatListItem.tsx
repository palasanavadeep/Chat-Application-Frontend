import React from 'react';

interface ChatListItemProps {
    profileImage: string;
    chatName: string;
    lastMessage: string;
    unreadMessages: boolean;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ profileImage, chatName, lastMessage, unreadMessages }) => {
    return (
        <div className="flex items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition">
            <img
                src={profileImage}
                alt={`${chatName} profile`}
                className="w-12 h-12 rounded-full object-cover mr-3"
            />
            <div className="flex-1">
                <div className="text-base font-semibold text-gray-800">{chatName}</div>
                <div className="text-sm text-gray-600 truncate">{lastMessage}</div>
            </div>
            {unreadMessages && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
        </div>
    );
};

export default ChatListItem;

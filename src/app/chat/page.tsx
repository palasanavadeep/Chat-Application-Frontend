import ChatListItem from '@/components/chat-components/ChatListItem'
import React from 'react'



export default function  ChatPage(){
    return <>
    <ChatListItem
    profileImage='/defaultImage.png'
    chatName='test'
    lastMessage='msg'
    unreadMessages={true}
    />
    <ChatListItem
    profileImage='/defaultImage.png'
    chatName='test'
    lastMessage='msg'
    unreadMessages={true}
    />
    <ChatListItem
    profileImage='/defaultImage.png'
    chatName='test'
    lastMessage='msg'
    unreadMessages={true}
    />
    <ChatListItem
    profileImage='/defaultImage.png'
    chatName='test'
    lastMessage='msg'
    unreadMessages={true}
    />
    </>
}

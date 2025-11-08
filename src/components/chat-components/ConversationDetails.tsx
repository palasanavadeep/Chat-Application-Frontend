"use client"

import React from "react"
import Image from 'next/image'
import type { Conversation } from "@/lib/types"
import { useChatStore } from '@/lib/store'
import { base64ToDataUrl } from "@/lib/utils"
import { useRouter } from 'next/navigation'

interface Props {
  conversation: Conversation
}

export default function ConversationDetails({ conversation }: Props) {
  const me = useChatStore((s) => s.state.user)
  const router = useRouter()

  const isGroup = (conversation.type?.lookupCode ?? '').toLowerCase() === 'group'

  let title: string
  let subtitle: string | null = null
  let imageSrc = conversation.conversationImage?.file ?? '/defaultImage.jpg'

  if (isGroup) {
    title = conversation.name ?? `Group ${conversation.id}`
    subtitle = conversation.description ?? (conversation.lastMessage ? conversation.lastMessage.body : null)
    imageSrc = conversation.conversationImage?.file ?? '/defaultImage.jpg'
  } else {
    // personal: show the other participant
    const parts = conversation.conversationParticipants ?? []
    const otherPart = parts.find((p) => String(p?.user?.id) !== String(me?.id)) ?? parts[0]
    const other = otherPart?.user
    title = other?.displayName ?? other?.username ?? `Conversation ${conversation.id}`
    imageSrc = other?.profileImage?.file ?? conversation.conversationImage?.file ?? '/defaultImage.jpg'
    subtitle = conversation.lastMessage ? conversation.lastMessage.body : null
  }

  const openDetails = () => {
    try {
      if (conversation && conversation.id) {
        router.push(`/chat/${conversation.id}/details`)
      }
    } catch (e) {}
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10 ">
      <button onClick={openDetails} className="flex items-center gap-4 text-left w-full hover:cursor-pointer">
        <div className="w-12 h-12 relative rounded-full overflow-hidden">
          <Image src={imageSrc === '/defaultImage.jpg' ? '/defaultImage.jpg' : base64ToDataUrl(imageSrc)} alt={`${title} avatar`} fill sizes="48px" className="object-cover" unoptimized />
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{subtitle ?? 'No messages yet'}</div>
        </div>
      </button>
    </div>
  )
}

"use client"

import React from "react"
import type { Conversation } from "@/lib/types"
import { useChatStore } from '@/lib/store'
import { base64ToDataUrl } from "@/lib/utils"

interface Props {
  conversation: Conversation
}

export default function ConversationDetails({ conversation }: Props) {
  const me = useChatStore((s) => s.state.user)

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

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={imageSrc === '/defaultImage.jpg' ? '/defaultImage.jpg' : base64ToDataUrl(imageSrc)} alt={`${title} avatar`} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="text-sm text-muted-foreground">{subtitle ?? 'No messages yet'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

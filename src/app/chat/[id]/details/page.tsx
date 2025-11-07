"use client"

import React from "react"
import Image from 'next/image'
import { useParams } from "next/navigation"
import { useChatStore } from "@/lib/store/useChatStore"
import type { Conversation } from "@/lib/types"

export default function ConversationDetailsPage() {
  const params = useParams()
  const id = params?.id as string | undefined
  const conversation = useChatStore((s) => s.state.conversations.find((c) => String(c.id) === String(id)))

  if (!id) return <div className="p-6">No conversation selected</div>
  if (!conversation) return <div className="p-6">Loading conversation...</div>

  const isGroup = (conversation.type?.lookupCode ?? '').toLowerCase() === 'group'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 relative rounded-full overflow-hidden">
          <Image src={conversation.conversationImage?.file ?? '/defaultImage.jpg'} alt="conv" fill sizes="80px" className="object-cover" unoptimized />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{conversation.name ?? `Conversation ${conversation.id}`}</h1>
          <div className="text-sm text-muted-foreground">{isGroup ? (conversation.description ?? '') : 'Personal conversation'}</div>
          <div className="text-xs text-muted-foreground mt-1">Created by {conversation.createdBy?.displayName ?? conversation.createdBy?.username ?? String(conversation.createdBy?.id ?? '')} on {conversation.createdAt ? new Date(conversation.createdAt).toLocaleDateString() : '—'}</div>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Participants</h2>
        <div className="space-y-2">
          {(conversation.conversationParticipants ?? []).map((p) => (
            <div key={String(p?.id ?? p?.user?.id ?? Math.random())} className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{p?.user?.displayName ?? p?.user?.username ?? String(p?.user?.id ?? '')}</div>
                <div className="text-sm text-muted-foreground">{String(p?.role ?? 'Member')}</div>
              </div>
              <div className="text-sm text-muted-foreground">{p?.user?.profileImage?.file ? 'Has image' : ''}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Details</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div><strong>ID:</strong> {String(conversation.id)}</div>
          <div><strong>Type:</strong> {conversation.type?.lookupName ?? conversation.type?.lookupCode ?? '—'}</div>
          <div><strong>Last message:</strong> {conversation.lastMessage?.body ?? '—'}</div>
        </div>
      </section>
    </div>
  )
}

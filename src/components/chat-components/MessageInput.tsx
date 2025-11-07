"use client"

import React, { useState } from "react"
import { useChatStore } from "@/lib/store"

interface Props {
  convId: string | number
}

export default function MessageInput({ convId }: Props) {
  const [text, setText] = useState("")
  const { sendSocketAction } = useChatStore()

  const send = () => {
    if (!text.trim()) return
    try {
      const ok = sendSocketAction("sendMessage", { conversationId: convId, messageContent : text })
      if (!ok) {
        // could show toast
        console.warn("socket not open")
      }
    } catch (e) {}
    setText("")
  }

  return (
    <div className="p-3 border-t bg-white flex items-center gap-3 flex-none">
      <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Type a message..." />
      <button onClick={send} className="px-4 py-2 bg-blue-500 text-white rounded">Send</button>
    </div>
  )
}

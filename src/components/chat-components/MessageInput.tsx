// "use client"

// import React, { useState } from "react"
// import { useChatStore } from "@/lib/store"

// interface Props {
//   convId: string | number
// }

// export default function MessageInput({ convId }: Props) {
//   const [text, setText] = useState("")
//   const { sendSocketAction } = useChatStore()

//   const send = () => {
//     if (!text.trim()) return
//     try {
//       const ok = sendSocketAction("sendMessage", { conversationId: convId, messageContent : text })
//       if (!ok) {
//         // could show toast
//         console.warn("socket not open")
//       }
//     } catch (e) {}
//     setText("")
//   }

//   return (
//     <div className="p-3 border-t bg-white flex items-center gap-3 flex-none">
//       <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Type a message..." />
//       <button onClick={send} className="px-4 py-2 bg-blue-500 text-white rounded">Send</button>
//     </div>
//   )
// }


"use client"

import React, { useState, useRef } from "react"
import { Paperclip, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChatStore } from "@/lib/ChatStoreInitializer"
import Image from "next/image"

interface Props {
  convId: string | number
}

export default function MessageInput({ convId }: Props) {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { sendSocketAction } = useChatStore()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleFileRemove = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const send = () => {
    if (!text.trim() && !file) return

    try {
      // Create payload
      const payload: any = { 
        conversationId: convId, 
        messageContent: text.trim() || "" 
      }

      if (file) {
        payload.file = file
      }

      const ok = sendSocketAction(
              "sendMessage", 
              { conversationId: convId, messageContent: text },
              file
            );

      if (!ok) {
        console.warn("socket not open")
      }
    } catch (e) {
      console.error("Send failed:", e)
    }

    setText("")
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="p-3 border-t bg-white flex flex-col gap-2 flex-none">
      {/* File Preview Section */}
      {file && (
        <div className="flex items-center justify-between bg-gray-50 border p-2 rounded-md">
          <div className="flex items-center gap-3">
            {file.type.startsWith("image/") && (
              <div className="w-12 h-12 relative">
                <Image
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}
            <div className="text-sm text-gray-700 truncate">{file.name}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFileRemove}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Input + Actions */}
      <div className="flex items-center gap-3">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1"
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />

        <Button
          onClick={send}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </Button>
      </div>
    </div>
  )
}

"use client"

import React, { useState } from "react"
import type { User } from "@/lib/types"
import { Search } from "lucide-react"
import { useChatStore } from "@/lib/store"

interface SearchUserProps {
  placeholder?: string
  onSelect: (user: User) => void
  exactUsernameLookup?: boolean // when true, use getUserByUsername event for exact lookup
}

export default function SearchUser({ placeholder = "Search by Username/Email", onSelect, exactUsernameLookup = false }: SearchUserProps) {
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const { sendSocketAction, state } = useChatStore()
  const searchTimeoutRef = React.useRef<number | null>(null)

  // prefer server-pushed results stored in the chat state
  const resultsFromStore = state.searchResults ?? []

  const doSearch = async () => {
    if (!q) return
    setLoading(true)
    console.log("in doSearch and q is ",q);
    // Fire-and-forget via socket; server should push results
    try {
      if (exactUsernameLookup) {
        // exact lookup - backend will respond with 'getUserByUsername' event containing a single user or null
        sendSocketAction("getUserByUsername", { username: q })
      } else {
        // generic search - backend will respond with 'searchUserResponse' containing an array
        sendSocketAction("searchUser", { username: q })
      }
    } catch (e) {}

  // we rely on the server to push results into the store; keep loading state until store updates
  // add a small timeout to clear loading if no response arrives (avoid permanently showing ...)
  const tid = window.setTimeout(() => setLoading(false), 8000)
  searchTimeoutRef.current = tid
  }

  React.useEffect(() => {
    // when server pushes results into the store, clear loading
    if ((state.searchResults ?? []).length > 0) {
      setLoading(false)
      const tid = searchTimeoutRef.current
      if (tid) {
        clearTimeout(tid)
        searchTimeoutRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.searchResults])

  return (
    <div>
      <div className="flex items-center border rounded overflow-hidden">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-2 outline-none"
        />
        <button onClick={doSearch} className="p-2 bg-gray-100">
          {loading ? "..." : <Search />}
        </button>
      </div>

      <div className="mt-2 space-y-2">
        {(resultsFromStore ?? []).map((u) => (
          <div key={u.id || u.username} className="p-2 border rounded flex justify-between items-center">
            <div>
              <div className="font-medium">{u.displayName ?? u.username}</div>
              <div className="text-sm text-muted-foreground">{u.email ?? ""}</div>
            </div>
            <button onClick={() => onSelect(u)} className="px-3 py-1 bg-blue-500 text-white rounded">Add</button>
          </div>
        ))}
      </div>
    </div>
  )
}

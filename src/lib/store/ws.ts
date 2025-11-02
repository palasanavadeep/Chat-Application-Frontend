export function wsUrlWithToken(token: string) {
//   const base = (process.env.NEXT_PUBLIC_WSS_URL as string) || (typeof window !== "undefined" ? `${window.location.origin.replace(/^http/, "ws")}/ws` : "/ws")
//   return `${base}?token=${encodeURIComponent(token)}`
    return `${process.env.NEXT_PUBLIC_WSS_URL}?token=${token}`;
}

export function createWebSocket(token: string) {
  const url = wsUrlWithToken(token)
  return new WebSocket(url)
}

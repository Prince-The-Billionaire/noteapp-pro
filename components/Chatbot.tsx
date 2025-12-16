"use client"

import { useState } from "react"
import { BiCheckDouble } from "react-icons/bi"

export default function ChatBot() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const sendMessage = async () => {
    setError(null)
    setInfo(null)

    if (!message.trim()) {
      setError("Please enter a task to enhance.")
      return
    }

    if (!message.toLowerCase().startsWith("#to-do list")) {
      setError("Message must start with #to-do list")
      return
    }

    setLoading(true)

    try {
      const title = message.replace(/^#to-do list/i, "").trim()

      // Send to your API, which finds taskId in Supabase
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to enhance task.")

      setInfo(`Enhancement requested for task: "${data.title}" (ID: ${data.taskId})`)

      setMessage("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border p-4 mt-6 flex flex-col gap-3">
      <input
        className="border p-2 w-full"
        placeholder="#to-do list Buy groceries"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading}
      />
      <button
        onClick={sendMessage}
        className="bg-black text-white px-3 py-1 rounded"
        disabled={loading}
      >
        {loading ? "Sending..." : "Enhance Task"}
      </button>

      {error && <p className="text-red-500">{error}</p>}
      {info && <p className="text-green-600"><BiCheckDouble/>Enhancing...</p>}
    </div>
  )
}

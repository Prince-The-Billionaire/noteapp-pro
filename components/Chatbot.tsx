"use client"

import { useState, useRef, useEffect } from "react"
import { BiCheckDouble, BiBot, BiX } from "react-icons/bi"
import gsap from "gsap"

export default function ChatBot() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Animate open / close
  useEffect(() => {
    if (!panelRef.current) return

    if (open) {
      gsap.fromTo(
        panelRef.current,
        { scale: 0.7, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }
      )
    }
  }, [open])

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

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message: "#to-do list enhance",
          source: "chatbot",
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")

      setInfo("Enhancement requested.")
      setMessage("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50"
    >
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
        >
          <BiBot size={26} />
        </button>
      )}

      {/* Expanded Panel */}
      {open && (
        <div
          ref={panelRef}
          className="w-80 bg-white rounded-xl shadow-xl p-4 flex flex-col gap-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              Enhance To-Do List
            </h3>
            <button onClick={() => setOpen(false)}>
              <BiX size={20} />
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Use this to enhance an existing task.
            <br />
            Start with <b>#to-do list</b>
          </p>

          <input
            className="border p-2 text-sm rounded"
            placeholder="#to-do list Buy groceries"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-black text-white text-sm py-2 rounded"
          >
            {loading ? "Sending..." : "Enhance Task"}
          </button>

          {error && <p className="text-xs text-red-500">{error}</p>}
          {info && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <BiCheckDouble /> Enhancing...
            </p>
          )}
        </div>
      )}
    </div>
  )
}

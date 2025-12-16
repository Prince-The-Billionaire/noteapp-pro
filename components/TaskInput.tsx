"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { BiPlus } from "react-icons/bi"

interface Props {
  userIdentifier: string
  onTaskAdded: () => void
}

export default function TaskInput({ userIdentifier, onTaskAdded }: Props) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")

  const addTask = async () => {
    if (!title.trim()) return
    setLoading(true)
    const { data } = await supabase
      .from("tasks")
      .insert({ title, user_identifier: userIdentifier })
      .select()
      .single()

    await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: data.id,
        title: data.title,
        message: "#to-do list enhance",
      }),
    })

    setTitle("")
    setLoading(false)
    onTaskAdded()
  }


  return (
    <div className="flex gap-2">
      <input
        className="border p-2 flex-1 rounded"
        placeholder="Add a task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTask()}
      />
      <button
        onClick={addTask}
        disabled={loading}
        className="bg-black text-white px-4 rounded flex flex-row items-center justify-center hover:bg-black/80 cursor-pointer"
      >
        <BiPlus size={24} />
        Add
      </button>
    </div>
  )
}

"use client"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { FiEdit2, FiTrash2 } from "react-icons/fi"
import gsap from "gsap"

interface Task {
  id: string
  title: string
  enhanced_title?: string | null
  completed: boolean
}

interface Props {
  task: Task
  onChange: () => void
}

export default function TaskItem({ task, onChange }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [optimisticCompleted, setOptimisticCompleted] = useState(task.completed)

  const editRef = useRef<HTMLButtonElement>(null)
  const deleteRef = useRef<HTMLButtonElement>(null)

  // GSAP hover animation
  const hoverIn = (el: HTMLButtonElement | null) => {
    if (!el) return
    gsap.to(el, { scale: 1.15, duration: 0.2, ease: "power2.out" })
  }

  const hoverOut = (el: HTMLButtonElement | null) => {
    if (!el) return
    gsap.to(el, { scale: 1, duration: 0.2, ease: "power2.out" })
  }

  /** ✅ Optimistic completion toggle */
  const toggleComplete = async () => {
    setOptimisticCompleted(!optimisticCompleted)

    await supabase
      .from("tasks")
      .update({ completed: !optimisticCompleted })
      .eq("id", task.id)

    onChange()
  }

  /** ✅ Save edit + trigger AI enhancement */
  const saveEdit = async () => {
    if (!title.trim()) return

    // Update title immediately
    await supabase
      .from("tasks")
      .update({ title, enhanced_title: null })
      .eq("id", task.id)

    // Call AI via n8n
    await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: task.id,
        title,
        message: "",
      }),
    })

    setIsModalOpen(false)
    onChange()
  }

  const deleteTask = async () => {
    await supabase.from("tasks").delete().eq("id", task.id)
    onChange()
  }

  return (
    <>
      {/* Task Row */}
      <div className="flex items-center gap-3 border border-black/20 shadow-md shadow-black/20 p-3 rounded justify-between">
        <div className="flex items-center gap-3 flex-1">
          <input
            type="checkbox"
            className="w-5 h-5 hover:cursor-pointer"
            checked={optimisticCompleted}
            onChange={toggleComplete}
          />

          <span
            className={`${
              optimisticCompleted ? "line-through text-gray-400" : ""
            }`}
          >
            {task.enhanced_title || task.title}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            ref={editRef}
            onMouseEnter={() => hoverIn(editRef.current)}
            onMouseLeave={() => hoverOut(editRef.current)}
            onClick={() => setIsModalOpen(true)}
            className="text-blue-500"
          >
            <FiEdit2 size={18} />
          </button>

          <button
            ref={deleteRef}
            onMouseEnter={() => hoverIn(deleteRef.current)}
            onMouseLeave={() => hoverOut(deleteRef.current)}
            onClick={deleteTask}
            className="text-red-500"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="text-lg font-semibold mb-4">Edit Task</h2>

            <input
              className="border p-2 w-full mb-4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-3 py-1 bg-black text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

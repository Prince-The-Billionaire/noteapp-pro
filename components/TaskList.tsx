"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import TaskItem from "./TaskItem"

interface Task {
  id: string
  title: string
  enhanced_title?: string | null
  completed: boolean
}

interface Props {
  userIdentifier: string
  refreshSignal?: number
}

export default function TaskList({ userIdentifier, refreshSignal }: Props) {
  const [tasks, setTasks] = useState<Task[]>([])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_identifier", userIdentifier)
      .order("created_at", { ascending: true })

    setTasks(data || [])
  }

  useEffect(() => {
    fetchTasks()

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_identifier=eq.${userIdentifier}`,
        },
        () => {
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // 👇 keep refreshSignal working exactly as before
  useEffect(() => {
    if (refreshSignal !== undefined) {
      fetchTasks()
    }
  }, [refreshSignal])

  return (
    <div className="flex flex-col bg-gray-100 text-black gap-2 mt-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onChange={fetchTasks}
        />
      ))}
    </div>
  )
}

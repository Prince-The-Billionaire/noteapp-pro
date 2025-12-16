import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const { title } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 })

  // Search existing task
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .ilike("title", `%${title.trim()}%`)
    .limit(1)
    .single()

  if (error || !data) return NextResponse.json({ error: "Task not found" }, { status: 404 })

  // Send to n8n webhook for AI enhancement
  await fetch(process.env.N8N_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      taskId: data.id,
      title: data.title,
      user_identifier: data.user_identifier,
      message: "#to-do list enhance",
    }),
  })

  return NextResponse.json({ ok: true, taskId: data.id, title: data.title })
}

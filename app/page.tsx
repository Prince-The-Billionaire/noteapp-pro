"use client"

import { useState } from "react"
import TaskInput from "@/components/TaskInput"
import TaskList from "@/components/TaskList"
import ChatBot from "@/components/Chatbot"

export default function Home() {
  const [userIdentifier, setUserIdentifier] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  if (!userIdentifier) {
    return (
      <main className="min-h-screen bg-gray-100 text-black flex items-center justify-center">
        <div className="border border-black/20 shadow shadow-md-black/40 p-6 rounded-2xl w-md">
          <h2 className="text-black/50">Sign Up or Sign In to Lista</h2>
          <img className="h-20" src={'/lista_logo.png'}/>
          <h1 className="text-2xl mb-4 font-semibold">Enter your email</h1>
          <input
            className="border border-black/50 rounded-2xl bg-black/10 backdrop-blur-sm p-2 w-full"
            placeholder="you@example.com"
            onKeyDown={(e) =>
              e.key === "Enter" &&
              setUserIdentifier((e.target as HTMLInputElement).value)
            }
          />
          <button 
            onClick={() => {
              const input = document.querySelector(
                "input"
              ) as HTMLInputElement
              setUserIdentifier(input.value)
            }}
          className="mt-4 w-full bg-black text-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-black/80">
            SignUp/Login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 w-screen justify-center md:px-12  text-black">
      <img className="h-20" src={'/lista_logo.png'}/>
      <h1 className="text-2xl font-bold mb-4">To-Do List</h1>
      <TaskInput
        userIdentifier={userIdentifier}
        onTaskAdded={() => setRefreshKey((k) => k + 1)}
      />

      <TaskList
        userIdentifier={userIdentifier}
        refreshSignal={refreshKey}
      />
       <ChatBot />
    </main>
  )
}

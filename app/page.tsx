"use client"

import { supabase } from "./supabase"

export default function Home() {

const loginWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  })
}


  return (
    <main className="flex items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 text-center">

        <h1 className="text-3xl font-bold mb-2">
          Smart Bookmark
        </h1>

        <p className="text-gray-400 mb-8">
          Private. Real-time. Clean.
        </p>

        <button
          onClick={loginWithGoogle}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:scale-105 transition-transform duration-200"
        >
          Continue with Google
        </button>

      </div>
    </main>
  )
}

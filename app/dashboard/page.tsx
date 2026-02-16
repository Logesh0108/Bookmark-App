"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editUrl, setEditUrl] = useState("")
  const [loading, setLoading] = useState(true)

  // ✅ INIT
  useEffect(() => {
    let channel: any

    const init = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        window.location.href = "/"
        return
      }

      setUser(data.user)
      await fetchBookmarks(data.user.id)
      setLoading(false)

      channel = supabase
        .channel("bookmarks-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookmarks" },
          () => fetchBookmarks(data.user!.id)
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  // ✅ FETCH
  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!error) {
      setBookmarks(data || [])
      setSelectedIds([])
    }
  }

  // ✅ ADD
  const addBookmark = async () => {
  if (!title || !url) return alert("Fill all fields")

  let formattedUrl = url.trim()

  // Add https:// if missing
  if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
    formattedUrl = "https://" + formattedUrl
  }

  const { error } = await supabase.from("bookmarks").insert([
    { title, url: formattedUrl, user_id: user.id },
  ])

  if (error) {
    alert(error.message)
    return
  }

  setTitle("")
  setUrl("")
}


  // ✅ DELETE SINGLE
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
  }

  // ✅ DELETE MULTIPLE
  const deleteSelected = async () => {
    if (selectedIds.length === 0) return

    await supabase.from("bookmarks").delete().in("id", selectedIds)
    setSelectedIds([])
  }

  // ✅ UPDATE (Fixed Properly)
  const updateBookmark = async () => {
  if (!editingId || !editTitle.trim() || !editUrl.trim()) {
    alert("Fill all fields")
    return
  }

  // 🔥 Format URL properly
  let formattedUrl = editUrl.trim()

  if (
    !formattedUrl.startsWith("http://") &&
    !formattedUrl.startsWith("https://")
  ) {
    formattedUrl = "https://" + formattedUrl
  }

  const { error } = await supabase
    .from("bookmarks")
    .update({
      title: editTitle.trim(),
      url: formattedUrl,
    })
    .eq("id", editingId)
    .eq("user_id", user.id) // extra security

  if (error) {
    console.error("Update error:", error)
    alert(error.message)
    return
  }

  // 🔥 Clear edit mode
  setEditingId(null)
  setEditTitle("")
  setEditUrl("")

  // 🔥 Refresh bookmarks
  await fetchBookmarks(user.id)
}


  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === bookmarks.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(bookmarks.map((b) => b.id))
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Smart Bookmark Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <p className="mb-6 text-gray-400">
        Welcome {user?.email}
      </p>

      {/* ADD FORM */}
      <div className="bg-gray-900 p-4 rounded-lg mb-8 flex gap-3">
        <input
          placeholder="Bookmark Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white flex-1"
        />
        <input
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white flex-1"
        />
        <button
          onClick={addBookmark}
          className="bg-green-500 px-4 py-2 rounded-lg"
        >
          Add
        </button>
      </div>

      {/* MULTI DELETE */}
      {bookmarks.length > 0 && (
        <div className="flex items-center gap-4 mb-4">
          <input
            type="checkbox"
            checked={selectedIds.length === bookmarks.length}
            onChange={toggleSelectAll}
          />
          <span>Select All</span>

          <button
            onClick={deleteSelected}
            disabled={selectedIds.length === 0}
            className="bg-red-600 px-4 py-1 rounded disabled:opacity-50"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-4">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
          >
            {editingId === bookmark.id ? (
              <div className="flex gap-2 flex-1">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="p-2 rounded bg-gray-700 text-white flex-1"
                />
                <input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="p-2 rounded bg-gray-700 text-white flex-1"
                />
                <button
                  onClick={updateBookmark}
                  className="bg-green-600 px-3 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-600 px-3 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(bookmark.id)}
                    onChange={() => toggleSelect(bookmark.id)}
                  />
                  <a
                    href={bookmark.url}
                    target="_blank"
                    className="text-blue-400 hover:underline"
                  >
                    {bookmark.title}
                  </a>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingId(bookmark.id)
                      setEditTitle(bookmark.title)
                      setEditUrl(bookmark.url)
                    }}
                    className="text-yellow-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}

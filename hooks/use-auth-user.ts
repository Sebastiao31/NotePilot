"use client"

import { useEffect, useMemo, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"

export type AuthUserInfo = {
  user: User | null
  displayName: string
  email: string
  photoURL: string
  initials: string
}

export function useAuthUser(): AuthUserInfo {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const { displayName, email, photoURL, initials } = useMemo(() => {
    const displayName = user?.displayName ?? "User"
    const email = user?.email ?? ""
    const photoURL = user?.photoURL ?? ""
    const source = displayName || email
    const parts = source.split(/\s|\./).filter(Boolean)
    const first = parts[0]?.[0] ?? "?"
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""
    return {
      displayName,
      email,
      photoURL,
      initials: `${first.toUpperCase()}${second.toUpperCase()}`,
    }
  }, [user])

  return { user, displayName, email, photoURL, initials }
}



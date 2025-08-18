"use client"

import { useState } from "react"
import { auth, googleProvider, db } from "@/lib/firebase"
import { signInWithPopup } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { IconBrandGoogleFilled } from "@tabler/icons-react"
import { toast } from "sonner"

export default function SignUpWithGoogle() {
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)

      // Persist/merge the user document in Firestore
      const user = result.user
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email ?? null,
          displayName: user.displayName ?? null,
          photoURL: user.photoURL ?? null,
          providerId: user.providerData?.[0]?.providerId ?? "google",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      )

      toast.success(`Signed in as ${user.email ?? user.uid}`)
      // TODO: redirect to dashboard after successful auth
      window.location.href = "/dashboard"
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Google sign-in failed: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleGoogle} disabled={loading} className="gap-2">
      <IconBrandGoogleFilled />
      {loading ? "Signing in..." : "Sign up with Google"}
    </Button>
  )
}



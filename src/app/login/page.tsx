"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { useEffect } from "react";
import { useUser } from "@/firebase";

export default function LoginPage() {
  const auth = useAuth();
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
            <Leaf className="h-24 w-24 text-primary opacity-80 mb-6" />
            <h1 className="text-3xl font-bold font-headline text-primary">Welcome to EcoNote</h1>
            <p className="text-lg text-foreground/80 max-w-md text-center">
                Your sustainable note-taking journey starts here. Sign in to continue.
            </p>
            <Button onClick={handleGoogleSignIn} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Sign in with Google
            </Button>
        </div>
    </div>
  );
}

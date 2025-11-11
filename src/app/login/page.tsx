"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { useEffect } from "react";
import { useUser } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  
  if (loading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Leaf className="mx-auto h-16 w-16 text-primary opacity-80 mb-4" />
            <CardTitle className="text-2xl font-headline">Welcome to EcoNote</CardTitle>
            <CardDescription>
                Your sustainable note-taking journey starts here. Sign in to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Button onClick={handleGoogleSignIn} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Sign in with Google
            </Button>
             <Button variant="outline" className="w-full" onClick={() => router.push('/settings')}>
              Configure Firebase
            </Button>
          </CardContent>
        </Card>
    </div>
  );
}

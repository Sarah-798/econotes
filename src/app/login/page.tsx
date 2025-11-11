"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export default function EmailLogin() {
  const router = useRouter();
  const auth = useAuth();

  const [mounted, setMounted] = useState(false);
  const [userChecked, setUserChecked] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  // Redirect logged-in users automatically
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      } else {
        setUserChecked(true);
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  const handleAuth = async () => {
    if (!auth) return alert("Firebase not initialized yet.");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully!");
        setIsLogin(true);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !userChecked) return null;

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <Leaf className="mx-auto h-16 w-16 text-primary opacity-80 mb-4" />
          <CardTitle className="text-2xl font-headline">
            {isLogin ? "Welcome Back 🌿" : "Join EcoNote Today"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to continue your sustainable note journey."
              : "Create an account to start making greener notes."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-md p-2 w-full focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-md p-2 w-full focus:ring-2 focus:ring-green-500"
          />

          <Button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-green-600 text-white hover:bg-green-700 transition"
          >
            {loading
              ? "Processing..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Need an account? Sign Up"
              : "Already have an account? Login"}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-sm text-muted-foreground"
            onClick={() => router.push("/settings")}
          >
            Configure Firebase
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

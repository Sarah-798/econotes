"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

async function updateFirebaseConfig(config: { projectId: string; apiKey: string; authDomain: string; }) {
  // In a real application, this would make a call to a secure backend endpoint
  // to update environment variables. Here we'll just show that it's been called.
  console.log("Simulating update for config:", config);
  // We can't actually set environment variables on the client-side for security reasons.
  // We will store them in localStorage for this prototype.
  if (typeof window !== 'undefined') {
    localStorage.setItem('NEXT_PUBLIC_FIREBASE_PROJECT_ID', config.projectId);
    localStorage.setItem('NEXT_PUBLIC_FIREBASE_API_KEY', config.apiKey);
    localStorage.setItem('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', config.authDomain);
  }
  return { success: true };
}


export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [projectId, setProjectId] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || '' : '');
  const [apiKey, setApiKey] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('NEXT_PUBLIC_FIREBASE_API_KEY') || '' : '');
  const [authDomain, setAuthDomain] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') || '' : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        await updateFirebaseConfig({ projectId, apiKey, authDomain });

        toast({
            title: "Configuration Updated",
            description: "Your Firebase project details have been saved. The app will now reload.",
        });

        // Reload the page to re-initialize Firebase with the new config
        setTimeout(() => window.location.reload(), 2000);

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save the configuration. Please try again.",
        });
        setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Firebase Project Configuration</CardTitle>
          <CardDescription>
            Enter the details for your Firebase project here. These values can be found in your Firebase project's settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-id">Project ID</Label>
              <Input
                id="project-id"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="your-firebase-project-id"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="your-firebase-api-key"
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="auth-domain">Auth Domain</Label>
              <Input
                id="auth-domain"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="your-project-id.firebaseapp.com"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save and Reload'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/login')} disabled={loading}>
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

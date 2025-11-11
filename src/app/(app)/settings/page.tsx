"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/firebase';

// This is a placeholder function. In a real app, you would have a server action
// to securely update environment variables or your backend configuration.
async function updateFirebaseConfig(config: { projectId: string; apiKey: string; authDomain: string; }) {
  console.log("Updating config with:", config);
  // In a real application, this would make a call to a secure backend endpoint.
  // For this prototype, we'll simulate a successful update.
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
}


export default function SettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '');
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '');
  const [authDomain, setAuthDomain] = useState(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // This is a mock update. In a real scenario, this would trigger
        // a backend process to update the environment and possibly restart the app.
        await updateFirebaseConfig({ projectId, apiKey, authDomain });

        toast({
            title: "Configuration Updated",
            description: "Your Firebase project details have been saved. Please reload the application for changes to take effect.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save the configuration. Please try again.",
        });
    } finally {
        setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">Settings</h1>
      <Card className="max-w-2xl">
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

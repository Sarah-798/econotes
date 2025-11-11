"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Plus, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  const noteCount = 0; // This will be dynamic later
  const paperSaved = noteCount * 2;
  const co2Reduced = (noteCount * 0.025).toFixed(2);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline text-primary">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes Created</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noteCount}</div>
            <p className="text-xs text-muted-foreground">Total notes you've written</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paper Saved</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paperSaved} sheets</div>
            <p className="text-xs text-muted-foreground">Equivalent sheets of paper</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO₂ Reduced</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M12 3v18" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 9l-4 4-4-4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{co2Reduced} kg</div>
            <p className="text-xs text-muted-foreground">Approximate carbon footprint reduction</p>
          </CardContent>
        </Card>
      </div>

       <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4">You don't have any notes yet.</p>
        <p className="text-muted-foreground text-sm">Click 'New Note' in the sidebar to create one!</p>
      </div>
    </div>
  );
}

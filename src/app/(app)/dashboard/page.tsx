"use client";

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Note } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Plus, BookOpen, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const notesQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'notes'), where('uid', '==', user.uid));
  }, [user, firestore]);

  const { data: notes, loading } = useCollection<Note>(notesQuery);

  const noteCount = notes?.length ?? 0;
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
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{co2Reduced} kg</div>
            <p className="text-xs text-muted-foreground">Approximate carbon footprint reduction</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-headline text-primary mb-4">Recent Notes</h2>
        {loading ? (
           <div className="text-center py-10 border-2 border-dashed rounded-lg">
             <p className="text-muted-foreground">Loading notes...</p>
           </div>
        ) : notes && notes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map(note => (
              <Card key={note.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/notes/${note.id}`)}>
                <CardHeader>
                  <CardTitle className="truncate">{note.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{note.content || 'No content'}</p>
                   <div className="text-xs text-muted-foreground mt-4">
                    {note.createdAt ? formatDistanceToNow(note.createdAt.toDate(), { addSuffix: true }) : ''}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No notes yet</h3>
            <p className="text-muted-foreground mt-1 text-sm">Click 'New Note' in the sidebar to create one!</p>
          </div>
        )}
      </div>
    </div>
  );
}

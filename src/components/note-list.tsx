"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  SidebarHeader,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Leaf, Plus, Trash2, BookOpen } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesData: Note[] = [];
      querySnapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() } as Note);
      });
      setNotes(notesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const createNewNote = async () => {
    try {
      const newNoteRef = await addDoc(collection(db, 'notes'), {
        title: 'Untitled Note',
        content: '',
        createdAt: serverTimestamp(),
      });
      router.push(`/notes/${newNoteRef.id}`);
    } catch (error) {
      console.error("Error creating new note: ", error);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      if (pathname === `/notes/${noteId}`) {
        router.push('/');
      }
    } catch (error) {
      console.error("Error deleting note: ", error);
    }
  };
  
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
            <Leaf className="h-5 w-5" />
          </Button>
          <h2 className="font-headline text-lg font-semibold text-primary">EcoNote</h2>
        </div>
        <Button onClick={createNewNote} size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </SidebarHeader>
      <SidebarContent asChild>
        <ScrollArea>
          {loading ? (
            <div className="p-2 space-y-2">
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
            </div>
          ) : (
            <SidebarMenu>
              {notes.map((note) => (
                <SidebarMenuItem key={note.id}>
                  <SidebarMenuButton
                    onClick={() => router.push(`/notes/${note.id}`)}
                    isActive={pathname === `/notes/${note.id}`}
                    className="truncate"
                  >
                    {note.title}
                  </SidebarMenuButton>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <SidebarMenuAction showOnHover>
                        <Trash2 />
                      </SidebarMenuAction>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your note.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(note.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground/80">
          <BookOpen className="h-5 w-5 text-primary"/>
          <span>{notes.length} Pages Saved</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

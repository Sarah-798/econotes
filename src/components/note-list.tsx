"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { useUser } from '@/firebase'; // Assuming useUser hook
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
import { Leaf, Plus, Trash2, BookOpen, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      const q = query(
        collection(db, 'notes'), 
        where('uid', '==', user.uid), 
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notesData: Note[] = [];
        querySnapshot.forEach((doc) => {
          notesData.push({ id: doc.id, ...doc.data() } as Note);
        });
        setNotes(notesData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching notes:", error);
        toast({
          title: "Error",
          description: "Could not fetch notes.",
          variant: "destructive"
        })
        setLoading(false);
      });
      return () => unsubscribe();
    } else if (!user && !loading) {
       // if user is null and we are not in initial loading state
      router.push('/login');
    } else {
      setNotes([]);
      setLoading(false);
    }
  }, [user, loading, router, toast]);

  const createNewNote = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create a note.",
        variant: "destructive"
      });
      router.push('/login');
      return;
    }
    try {
      const newNoteRef = await addDoc(collection(db, 'notes'), {
        uid: user.uid,
        title: 'Untitled Note',
        content: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push(`/notes/${newNoteRef.id}`);
    } catch (error) {
      console.error("Error creating new note: ", error);
       toast({
        title: "Error",
        description: "Could not create a new note.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      if (pathname === `/notes/${noteId}`) {
        router.push('/dashboard');
      }
       toast({
        title: "Note Deleted",
        description: "Your note has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting note: ", error);
      toast({
        title: "Error",
        description: "Could not delete the note.",
        variant: "destructive"
      });
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Logout Failed",
        description: "An error occurred while signing out.",
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer w-full p-2 rounded-md hover:bg-sidebar-accent">
                   <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-semibold truncate">{user.displayName || 'Eco User'}</span>
                    <span className="text-xs text-sidebar-foreground/70 truncate">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
              <Leaf className="h-5 w-5" />
            </Button>
            <h2 className="font-headline text-lg font-semibold text-primary">EcoNote</h2>
          </div>
        )}
        <Button onClick={createNewNote} size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </SidebarHeader>
      <SidebarContent asChild>
        <ScrollArea>
          {loading && !user ? (
            <div className="p-2 space-y-2">
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
            </div>
          ) : !user ? (
             <div className="p-4 text-center text-sm text-sidebar-foreground/70">
              Please log in to see your notes.
            </div>
          ) : (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => router.push('/dashboard')}
                  isActive={pathname === '/dashboard'}
                >
                  <LayoutDashboard />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
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
          <span>{user ? `${notes.length} Pages Saved` : 'Log in to save pages'}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

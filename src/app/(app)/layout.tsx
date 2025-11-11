"use client";

import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { NoteList } from '@/components/note-list';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <NoteList />
        <SidebarInset className="bg-background">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

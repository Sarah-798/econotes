"use client";

import React, { useState, useEffect, useCallback, useTransition, useMemo } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Note } from '@/lib/types';
import { useDebounce } from '@/lib/hooks';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Mic, Volume2, MapPin, Sparkles, Loader2, StopCircle } from 'lucide-react';
import { LocationMap } from './location-map';
import { summarizeNote } from '@/ai/flows/summarize-note';
import { generateNoteTitle } from '@/ai/flows/generate-note-title';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDoc, useFirestore } from '@/firebase';

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const firestore = useFirestore();
  
  const noteRef = useMemo(() => {
    if (!firestore || !noteId) return null;
    return doc(firestore, "notes", noteId);
  }, [firestore, noteId]);

  const { data: note, loading: noteLoading } = useDoc<Note>(noteRef);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAiSummarizing, startAiSummaryTransition] = useTransition();
  const [isAiTitleGenerating, startAiTitleTransition] = useTransition();

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);
  const { toast } = useToast();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const updateNoteInDb = useCallback(async (data: { title?: string; content?: string; latitude?: number | null; longitude?: number | null }) => {
    if (!noteRef) return;
    await updateDoc(noteRef, { ...data, updatedAt: serverTimestamp() });
  }, [noteRef]);

  useEffect(() => {
    if (note && debouncedTitle !== note.title) {
      updateNoteInDb({ title: debouncedTitle });
    }
  }, [debouncedTitle, note, updateNoteInDb]);

  useEffect(() => {
    if (note && debouncedContent !== note.content) {
      updateNoteInDb({ content: debouncedContent });
    }
  }, [debouncedContent, note, updateNoteInDb]);

  const handleSpeechToText = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Browser not supported", description: "Speech recognition is not supported in your browser.", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      toast({ title: "Speech Recognition Error", description: event.error, variant: "destructive" });
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setContent(prev => prev + finalTranscript);
    };
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if ('speechSynthesis' in window && content) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        toast({ title: "Text-to-Speech Error", description: "Could not play audio.", variant: "destructive" });
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      toast({ title: "Browser not supported", description: "Text-to-speech is not supported in your browser.", variant: "destructive" });
    }
  };

  const handleAddLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateNoteInDb({ latitude, longitude });
          toast({ title: "Location Added", description: "Your current location has been attached to the note." });
        },
        () => {
          toast({ title: "Location Error", description: "Unable to retrieve your location.", variant: "destructive" });
        }
      );
    } else {
      toast({ title: "Browser not supported", description: "Geolocation is not supported by your browser.", variant: "destructive" });
    }
  };
  
  const handleRemoveLocation = () => {
    updateNoteInDb({ latitude: null, longitude: null });
    toast({ title: "Location Removed", description: "Location has been removed from the note." });
  }

  const handleGenerateTitle = () => {
    if (!content) {
      toast({ title: "Content is empty", description: "Write some content before generating a title.", variant: "destructive"});
      return;
    }
    startAiTitleTransition(async () => {
      try {
        const result = await generateNoteTitle({ noteContent: content });
        setTitle(result.title);
      } catch (e) {
        toast({ title: "AI Error", description: "Failed to generate title.", variant: "destructive" });
      }
    });
  };

  const handleSummarizeNote = () => {
    if (!content) {
        toast({ title: "Content is empty", description: "Write some content before summarizing.", variant: "destructive"});
        return;
    }
    startAiSummaryTransition(async () => {
        try {
            const result = await summarizeNote({ noteContent: content });
            setContent(result.summary);
        } catch(e) {
            toast({ title: "AI Error", description: "Failed to summarize note.", variant: "destructive" });
        }
    });
  };


  if (noteLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) {
    return null; // Or a "note not found" message
  }

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 h-full flex flex-col">
        <Card className="flex-grow flex flex-col border-0 shadow-none bg-transparent">
          <CardHeader className="p-0 pb-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="text-2xl md:text-3xl font-bold font-headline tracking-tight border-0 shadow-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </CardHeader>
          <CardContent className="p-0 flex-grow flex flex-col">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your eco-friendly note..."
              className="w-full flex-grow resize-none border-0 shadow-none px-0 text-base leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleSpeechToText} >
                <Mic className={isListening ? 'text-destructive' : ''}/>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{isListening ? 'Stop Listening' : 'Start Speech-to-Text'}</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleTextToSpeech}>
                {isSpeaking ? <StopCircle className="text-destructive" /> : <Volume2 />}
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{isSpeaking ? 'Stop Playback' : 'Read Note Aloud'}</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleAddLocation}>
                <MapPin />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Add Current Location</p></TooltipContent>
          </Tooltip>
          
          <div className="flex-grow" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleGenerateTitle} disabled={isAiTitleGenerating}>
                {isAiTitleGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Title
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Use AI to generate a title</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleSummarizeNote} disabled={isAiSummarizing}>
                {isAiSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Summarize
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Use AI to summarize the note</p></TooltipContent>
          </Tooltip>
        </div>
        
        {note.latitude && note.longitude && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Note Location</h3>
              <Button variant="link" size="sm" className="text-destructive" onClick={handleRemoveLocation}>Remove</Button>
            </div>
            <LocationMap lat={note.latitude} lng={note.longitude} />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

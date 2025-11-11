import { Leaf } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-background">
      <Leaf className="h-24 w-24 text-primary opacity-20 mb-6" />
      <h1 className="font-headline text-3xl font-bold text-primary">
        Welcome to EcoNote
      </h1>
      <p className="mt-2 max-w-md text-lg text-foreground/80">
        Select a note from the sidebar to get started, or create a new one to begin your sustainable note-taking journey.
      </p>
    </div>
  );
}

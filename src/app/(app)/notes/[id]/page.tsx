import { NoteEditor } from '@/components/note-editor';

export default function NotePage({ params }: { params: { id: string } }) {
  return (
    <div className="h-full">
      <NoteEditor noteId={params.id} />
    </div>
  );
}

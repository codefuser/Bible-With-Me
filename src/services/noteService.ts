import { VerseNote } from '../types/bible';
import { upsertCloudNote, deleteCloudNote } from './userDataService';

const NOTES_KEY = 'bible_app_user_notes';

// Key format: `${book}_${chapter}_${verse}` -> content
export const getStoredNotes = (): VerseNote[] => {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading notes from local storage:', err);
    return [];
  }
};

export const saveNote = async (
  book: string,
  chapter: number,
  verse: number,
  content: string,
  userId?: string | null
): Promise<VerseNote[]> => {
  const notes = getStoredNotes();
  const existingIndex = notes.findIndex(
    (n) => n.book.toUpperCase() === book.toUpperCase() && n.chapter === chapter && n.verse === verse
  );

  const now = new Date().toISOString();

  if (!content.trim()) {
    // Delete note if content is empty
    if (existingIndex !== -1) {
      notes.splice(existingIndex, 1);
    }
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (err) {
      console.error('Error updating local notes:', err);
    }

    if (userId) {
      await deleteCloudNote(userId, book, chapter, verse);
    }
    return notes;
  }

  if (existingIndex !== -1) {
    notes[existingIndex] = {
      ...notes[existingIndex],
      content,
      updated_at: now
    };
  } else {
    notes.push({
      book,
      chapter,
      verse,
      content,
      created_at: now,
      updated_at: now
    });
  }

  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Error saving note locally:', err);
  }

  if (userId) {
    await upsertCloudNote(userId, book, chapter, verse, content);
  }

  return notes;
};

export const getVerseNote = (
  notes: VerseNote[],
  book: string,
  chapter: number,
  verse: number
): VerseNote | null => {
  return (
    notes.find(
      (n) => n.book.toUpperCase() === book.toUpperCase() && n.chapter === chapter && n.verse === verse
    ) || null
  );
};

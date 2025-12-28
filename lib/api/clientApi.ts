import { api } from './api';
import type { User } from '@/types/user';
import type { Note, NoteTag } from '@/types/note';

/* Auth */

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export async function register(data: RegisterRequest): Promise<User> {
  const res = await api.post<User>('/auth/register', data, {
    withCredentials: true
  });
  return res.data;
}

export async function login(data: LoginRequest): Promise<User> {
  const res = await api.post<User>('/auth/login', data, {
    withCredentials: true,
  });
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout', {}, {
    withCredentials: true
  });
}

export async function checkSession(): Promise<User | null> {
  try {
    const res = await api.get<User>('/auth/session', {
      withCredentials: true
    });
    return res.data ?? null;
  } catch {
    return null;
  }
}

/* User */

export async function getMe(): Promise<User> {
  const res = await api.get<User>('/users/me', {
    withCredentials: true,
  });

  if (!res.data) {
    throw new Error('Unauthorized');
  }

  return res.data;
}


export async function updateMe(data: Partial<User>): Promise<User> {
  const res = await api.patch<User>('/users/me', data, {
    withCredentials: true,
  });

  if (!res.data) {
    throw new Error('Failed to update profile');
  }

  return res.data;
}


/* Notes */

export interface FetchNotesParams {
  search?: string;
  tag?: string;
  page?: number;
  perPage?: number;
  sortBy?: 'created' | 'updated';
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

export async function fetchNotes(params: FetchNotesParams): Promise<FetchNotesResponse> {
  try {
    const res = await api.get<FetchNotesResponse>('/notes', {
      params,
      withCredentials: true,
    });
    return res.data ?? { notes: [], totalPages: 0 };
  } catch {
    return { notes: [], totalPages: 0 };
  }
}

export async function fetchNoteById(id: string): Promise<Note> {
  const res = await api.get<Note>(`/notes/${id}`, { withCredentials: true });
  
  if (!res.data)
    throw new Error('Note not found');
  
  return res.data;
}

export async function createNote(data: CreateNoteParams): Promise<Note> {
  const res = await api.post<Note>('/notes', data, {
    withCredentials: true,
  });

  if (!res.data) {
    throw new Error('Failed to create note');
  }

  return res.data;
}


export async function deleteNote(id: string): Promise<Note> {
  const res = await api.delete<Note>(`/notes/${id}`, {
    withCredentials: true,
  });

  if (!res.data) {
    throw new Error('Failed to delete note');
  }

  return res.data;
}


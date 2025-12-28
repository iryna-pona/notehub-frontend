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
  const res = await api.post<User>('/api/auth/register', data, {
    withCredentials: true
  });
  return res.data;
}

export async function login(data: LoginRequest): Promise<User> {
  const res = await api.post<User>('/api/auth/login', data, {
    withCredentials: true,
  });
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout', {}, {
    withCredentials: true
  });
}

export async function checkSession(): Promise<User | null> {
  try {
    const res = await api.get<User>('/api/auth/session', {
      withCredentials: true
    });
    return res.data ?? null;
  } catch {
    return null;
  }
}

/* User */

export async function getMe(): Promise<User> {
  const res = await api.get<User>('/api/users/me', {
    withCredentials: true,
  });

  if (!res.data) {
    throw new Error('Unauthorized');
  }

  return res.data;
}


export async function updateMe(data: Partial<User>): Promise<User> {
  const res = await api.patch<User>('/api/users/me', data, {
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
    const res = await api.get<FetchNotesResponse>('/api/notes', {
      params,
      withCredentials: true,
    });
    return res.data ?? { notes: [], totalPages: 0 };
  } catch {
    return { notes: [], totalPages: 0 };
  }
}

export async function fetchNoteById(id: string): Promise<Note> {
  const res = await api.get<Note>(`/api/notes/${id}`, { withCredentials: true });
  
  if (!res.data)
    throw new Error('Note not found');
  
  return res.data;
}

export async function createNote(data: CreateNoteParams): Promise<Note> {
  const res = await api.post<Note>('/api/notes', data, {
    withCredentials: true,
  });

  if (!res.data) {
    throw new Error('Failed to create note');
  }

  return res.data;
}


export async function deleteNote(id: string): Promise<Note> {
  const res = await api.delete<Note>(`/api/notes/${id}`, {
    withCredentials: true,
  });

  if (!res.data) {
    throw new Error('Failed to delete note');
  }

  return res.data;
}


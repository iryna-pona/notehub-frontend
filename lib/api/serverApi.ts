import { cookies } from 'next/headers';
import { api } from './api';
import { User } from '@/types/user';

export const getServerMe = async (): Promise<User> => {
  const cookieStore = await cookies();

  const { data } = await api.get('/users/me', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return data;
};

export const checkServerSession = async () => {
  const cookieStore = await cookies();

  return api.get('/auth/session', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
};



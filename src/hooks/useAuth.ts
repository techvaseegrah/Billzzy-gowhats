import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };



  return {
    session,
    status,
    logout,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    user: session?.user
  };
}
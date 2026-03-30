import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type UserRole = 'superadmin' | 'admin_adjunto' | 'cliente' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  clientId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  clientId: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from('frozen_user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (data && data.length > 0) {
      const roles = data.map(r => r.role);
      if (roles.includes('superadmin')) return 'superadmin' as UserRole;
      if (roles.includes('admin_adjunto')) return 'admin_adjunto' as UserRole;
      return 'cliente' as UserRole;
    }
    return 'cliente' as UserRole;
  };

  const fetchClientId = async (userId: string) => {
    const { data } = await supabase
      .from('frozen_clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    return data?.id || null;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userRole = await fetchRole(session.user.id);
        setRole(userRole);
        const cId = await fetchClientId(session.user.id);
        setClientId(cId);
      } else {
        setRole(null);
        setClientId(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const userRole = await fetchRole(session.user.id);
        setRole(userRole);
        const cId = await fetchClientId(session.user.id);
        setClientId(cId);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setClientId(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, clientId, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

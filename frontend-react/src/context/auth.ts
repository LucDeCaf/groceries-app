import { Session } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

export const AuthContext = createContext<Session | null>(null);
export const useAuth = () => useContext(AuthContext);

import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const getUser = async (): Promise<User | null> => {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        if (error.name !== 'AuthSessionMissingError') {
            throw error;
        }
    }

    return user;
};

export const login = async (
    email: string,
    password: string
): Promise<User | null> => {
    const {
        data: { user },
        error,
    } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return user;
};

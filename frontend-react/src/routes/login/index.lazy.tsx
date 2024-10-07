import { createLazyFileRoute, Link, redirect } from '@tanstack/react-router';
import { FormEventHandler, useState } from 'react';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { AuthForm, FieldSet, Input } from '../../components/AuthForm';

export const Route = createLazyFileRoute('/login/')({
    component: Page,
});

function Page() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();

        const {
            data: { session },
            error,
        } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (!session || error) {
            alert('Failed to login - please try again.');
            return;
        }

        throw redirect({ to: '/' });
    };

    return (
        <main className='flex justify-center md:pt-16 p-8'>
            <AuthForm onSubmit={handleSubmit}>
                <h1 className='text-center text-xl'>Login to Groceries App</h1>

                <div className='flex flex-col gap-4'>
                    <FieldSet>
                        <label htmlFor='email'>Email</label>
                        <Input
                            id='email'
                            type='text'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </FieldSet>

                    <FieldSet>
                        <label htmlFor='password'>Password</label>
                        <Input
                            id='password'
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </FieldSet>
                </div>

                <span className='text-center text-sm'>
                    Don't have an account?{' '}
                    <Link
                        className='font-medium text-blue-600 hover:underline'
                        to='/register'
                    >
                        Sign up
                    </Link>
                </span>

                <Button variant='primary' type='submit'>
                    Login
                </Button>
            </AuthForm>
        </main>
    );
}

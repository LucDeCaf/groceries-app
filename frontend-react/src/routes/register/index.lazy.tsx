import { createLazyFileRoute, Link, useRouter } from '@tanstack/react-router';
import { AuthForm, FieldSet, Input } from '../../components/AuthForm';
import { FormEventHandler, useState } from 'react';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';

export const Route = createLazyFileRoute('/register/')({
  component: Page,
});

function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("'Password' and 'Confirm password' do not match.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert('Error creating account - please try again.');
      return;
    }

    router.navigate({ to: '/' });
  };

  return (
    <main className='flex justify-center md:pt-16 p-8'>
      <AuthForm onSubmit={handleSubmit}>
        <h1 className='text-center text-xl'>Create an Account</h1>

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

        <FieldSet>
          <label htmlFor='confirmPassword'>Confirm password</label>
          <Input
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </FieldSet>

        <span className='text-center text-sm'>
          Already signed up?{' '}
          <Link
            className='font-medium text-blue-600 hover:underline'
            to='/login'
          >
            Login
          </Link>
        </span>

        <Button variant='primary'>Sign up</Button>
      </AuthForm>
    </main>
  );
}

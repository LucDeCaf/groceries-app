import { Link, useRouter } from '@tanstack/react-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/auth';

export const Navbar = () => {
  const router = useRouter();
  const session = useAuth();

  function logout() {
    supabase.auth.signOut().then(({ error }) => {
      if (error) {
        console.error(error);
      }
    });
    router.navigate({ to: '/' });
  }

  return (
    <div className='p-4 flex justify-between shadow-md sticky'>
      {/* Left */}
      <div className='flex gap-8'>
        <Link to='/' className='[&.active]:font-bold'>
          Home
        </Link>{' '}
        <Link to='/login' className='[&.active]:font-bold'>
          Login
        </Link>{' '}
        <Link to='/register' className='[&.active]:font-bold'>
          Register
        </Link>{' '}
      </div>

      {/* Right */}
      <div className='flex gap-8'>
        {session ? (
          <button onClick={logout}>
            Logged in as <span className='underline'>{session.user.email}</span>
          </button>
        ) : (
          <Link to='/login'>Not logged in</Link>
        )}
      </div>
    </div>
  );
};

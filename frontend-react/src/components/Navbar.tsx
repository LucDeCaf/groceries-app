import { Link, useRouter } from '@tanstack/react-router';
import { supabase } from '../lib/supabase';

export const Navbar = () => {
  const router = useRouter();

  function logout() {
    supabase.auth.signOut().then(({ error }) => {
      if (error) {
        console.error(error);
      }
    });
    router.navigate({ to: '/' });
  }

  return (
    <div className='p-2 flex gap-2 shadow-md sticky'>
      <Link to='/' className='[&.active]:font-bold'>
        Home
      </Link>{' '}
      <Link to='/login' className='[&.active]:font-bold'>
        Login
      </Link>{' '}
      <Link to='/register' className='[&.active]:font-bold'>
        Register
      </Link>{' '}
      <button onClick={logout}>Logout</button>
    </div>
  );
};

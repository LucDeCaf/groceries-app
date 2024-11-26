import { Link, useRouter } from '@tanstack/react-router';
import { useAuth } from '../context/auth';
import { logout } from '@/api/auth';

export const Navbar = () => {
  const router = useRouter();
  const session = useAuth();

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
          <button
            onClick={() => {
              logout();
              router.navigate({ to: '/login' });
            }}
          >
            Logged in as <span className='underline'>{session.user.email}</span>
          </button>
        ) : (
          <Link to='/login'>Not logged in</Link>
        )}
      </div>
    </div>
  );
};

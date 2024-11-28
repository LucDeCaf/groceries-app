import { Link, useRouter } from '@tanstack/react-router';
import { useAuth } from '../context/auth';
import { logout } from '@/api/auth';

export const Navbar = () => {
  const router = useRouter();
  const session = useAuth();

  return (
    <div className='p-4 flex w-full justify-between shadow-md sticky top-0 z-50 bg-white'>
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
            <div className='underline w-min overflow-hidden overflow-ellipsis whitespace-nowrap'>
              Logout
            </div>
          </button>
        ) : (
          <Link to='/login'>Login</Link>
        )}
      </div>
    </div>
  );
};

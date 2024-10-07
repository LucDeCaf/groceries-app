import { Link } from '@tanstack/react-router';

export const Navbar = () => {
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
        </div>
    );
};

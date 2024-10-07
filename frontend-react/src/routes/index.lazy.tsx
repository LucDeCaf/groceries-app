import { useQuery } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import { getUser } from '../api/auth';

export const Route = createLazyFileRoute('/')({
    component: Page,
});

function Page() {
    const {
        data: user,
        isPending,
        isError,
        error,
    } = useQuery({
        queryKey: ['auth'],
        queryFn: getUser,
    });

    if (isPending) {
        return <main className='p-8'>Loading...</main>;
    }

    if (isError) {
        console.error(error);
        return <div>Error fetching auth data: {error.message}</div>;
    }

    return (
        <main className='p-8'>
            Welcome, {user ? user.email : '[anonymous]'}
        </main>
    );
}

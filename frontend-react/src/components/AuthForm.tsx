import { FormHTMLAttributes, InputHTMLAttributes } from 'react';

export const AuthForm = (props: FormHTMLAttributes<HTMLFormElement>) => {
    return (
        <form
            className='w-full md:w-[500px] rounded-md shadow-md p-6 flex flex-col gap-6'
            {...props}
        >
            {props.children}
        </form>
    );
};

export function FieldSet({ children }: { children?: React.ReactNode }) {
    return <div className='flex flex-col'>{children}</div>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
    return <input className='px-2 py-1 border-2 rounded-md' {...props} />;
}

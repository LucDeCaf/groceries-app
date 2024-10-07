import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant: 'primary' | 'secondary' | 'danger';
}

export const Button = (props: ButtonProps) => {
    switch (props.variant) {
        case 'primary':
            return (
                <button
                    className='rounded-md bg-blue-500 text-white text-md p-1'
                    {...props}
                ></button>
            );
        case 'secondary':
            return (
                <button
                    className='rounded-md border-2 border-blue-500 text-blue-500 bg-white text-md p-1'
                    {...props}
                ></button>
            );
        case 'danger':
            return (
                <button
                    className='rounded-md bg-red-500 text-white text-md p-1'
                    {...props}
                ></button>
            );
    }
};

import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'link' | 'danger';
}

export const Button = (props: ButtonProps) => {
  switch (props.variant) {
    case 'primary':
      return (
        <button
          {...props}
          className={twMerge(
            'rounded-md border-2 border-blue-500 bg-blue-500 text-white text-md p-2',
            props.className,
          )}
        ></button>
      );
    case 'secondary':
      return (
        <button
          {...props}
          className={twMerge(
            'rounded-md border-2 border-blue-500 text-blue-500 bg-white text-md p-2',
            props.className,
          )}
        ></button>
      );
    case 'link':
      return (
        <button
          {...props}
          className={twMerge(
            'underline text-blue-500 text-md p-0',
            props.className,
          )}
        ></button>
      );
    case 'danger':
      return (
        <button
          {...props}
          className={twMerge(
            'rounded-md bg-red-500 border-2 border-red-500 text-white text-md p-2',
            props.className,
          )}
        ></button>
      );
  }
};

import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'brutal-button-primary',
    secondary: 'brutal-button',
    outline: 'bg-transparent border-2 border-black dark:border-dark-border text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
    ghost: 'bg-transparent border-none text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white border-2 border-black dark:border-dark-border',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const baseClasses = `
    font-medium 
    transition-colors 
    duration-200 
    focus:outline-none 
    focus:ring-2 
    focus:ring-primary-500 
    focus:ring-offset-2 
    disabled:opacity-50 
    disabled:cursor-not-allowed
    inline-flex 
    items-center 
    justify-center
  `;

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="spinner mr-2" />
      )}
      {children}
    </button>
  );
};

export default Button;

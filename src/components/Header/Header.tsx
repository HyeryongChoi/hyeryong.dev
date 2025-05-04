'use client';

import ThemeSwitcher from '@/components/ThemeSwitcher/ThemeSwitcher';
import Link from 'next/link';

function Header() {
  return (
    <nav className='mb-12'>
      <div className='mx-auto flex'>
        <div className='flex flex-1 items-center justify-center sm:items-stretch sm:justify-start space-x-6 text-sm font-medium'>
          <Link href='/'>Home</Link>
          <Link href='/about'>About</Link>
        </div>
        <ThemeSwitcher />
      </div>
    </nav>
  );
}

export default Header;

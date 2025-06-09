import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function Gnb() {
  return (
    <nav className='flex justify-between items-center px-4 border-b h-[60px] bg-white dark:bg-gray-900 dark:border-gray-800'>
      <div className='left-menu flex gap-4 items-center'>
        <div className='logo flex items-center gap-2'>
          <Image className='dark:invert' src='/vercel.svg' alt='Vercel logomark' width={20} height={20} />
          <span className='text-[16px] font-bold'>Stock Manager</span>
        </div>
        <ul className='nav-menu flex gap-2 items-center'>
          <li>
            <Link href='/' className='text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'>
              Home
            </Link>
          </li>
        </ul>
      </div>
      <div className='sub-menu'>profile 준비 중</div>
    </nav>
  );
}

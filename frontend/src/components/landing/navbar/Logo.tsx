import React from 'react';

export const Logo: React.FC = () => (
  <div className="flex items-center space-x-2">
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" className="fill-black"/>
      <path
        d="M8 12h16v8H8v-8zm2 2v4h12v-4H10zm-2 10h16v2H8v-2z"
        className="fill-white"
      />
      <circle cx="11" cy="25" r="1.5" className="fill-white"/>
      <circle cx="21" cy="25" r="1.5" className="fill-white"/>
    </svg>
    <span className="text-xl font-bold">Mobilindo</span>
  </div>
);
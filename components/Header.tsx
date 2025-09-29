import React from 'react';
import { StaffMember } from '../types';

interface HeaderProps {
    currentUser: StaffMember;
    allStaff: StaffMember[];
    onUserChange: (staffId: string) => void;
    onToggleSidebar: () => void;
    onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, allStaff, onUserChange, onToggleSidebar, onSignOut }) => {
  const hasAvatar = !!(currentUser.avatarUrl && currentUser.avatarUrl.trim());
  const initials = (currentUser.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('') || 'A';
  return (
    <header className="flex items-center justify-between h-20 px-4 sm:px-8 border-b border-slate-800 bg-slate-950 flex-shrink-0">
      <div className="flex items-center">
        <button 
          onClick={onToggleSidebar} 
          className="lg:hidden mr-2 p-2 text-slate-400 hover:text-white"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <div className="relative hidden md:block">
            <svg className="absolute w-5 h-5 text-slate-500 left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Search..." className="w-full max-w-xs pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
    <div className="hidden sm:flex items-center space-x-2">
            <label htmlFor="user-switcher" className="text-sm text-slate-400 hidden lg:block">Switch User:</label>
      {allStaff.length > 0 && (
        <select 
          id="user-switcher"
          value={currentUser.id}
          onChange={(e) => onUserChange(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg py-1 px-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          {allStaff.map(staff => (
            <option key={staff.id} value={staff.id}>{staff.name} ({staff.role})</option>
          ))}
        </select>
      )}
        </div>
        <button className="relative text-slate-400 hover:text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-950"></span>
        </button>
        <button
          onClick={onSignOut}
          className="hidden sm:inline-flex items-center px-3 py-2 border border-slate-700 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
        >
          Keluar
        </button>
        <button
          onClick={onSignOut}
          className="sm:hidden p-2 text-slate-400 hover:text-white"
          aria-label="Keluar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-9V7m0 0a2 2 0 10-4 0v10a2 2 0 104 0" />
          </svg>
        </button>
        <div className="flex items-center">
            {hasAvatar ? (
              <img className="h-10 w-10 rounded-full object-cover" src={currentUser.avatarUrl} alt="User avatar" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-semibold">
                {initials}
              </div>
            )}
            <div className="ml-3 hidden sm:block">
                <p className="text-sm font-medium text-white truncate max-w-[100px]">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.role}</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

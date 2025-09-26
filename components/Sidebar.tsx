import React from 'react';
import { NAV_ITEMS } from '../constants';
import { StaffMember } from '../types';
import { hasPermission, PAGE_PERMISSIONS } from '../services/permissions';


interface SidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
    currentUser: StaffMember;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, currentUser, isOpen, setIsOpen }) => {

    const visibleNavItems = NAV_ITEMS.filter(item => {
        const requiredPermission = PAGE_PERMISSIONS[item.name];
        return requiredPermission ? hasPermission(currentUser.role, requiredPermission) : true;
    });
    
    const mainNavItems = visibleNavItems.filter(item => item.name !== 'Settings');
    const settingsItem = visibleNavItems.find(item => item.name === 'Settings');

    const handleLinkClick = (page: string) => {
        setActivePage(page);
        if (window.innerWidth < 1024) { // lg breakpoint
            setIsOpen(false);
        }
    };


    return (
        <>
            {/* Backdrop for mobile */}
            <div 
                className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            ></div>

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full bg-slate-950 flex flex-col border-r border-slate-800 z-40
                transition-transform duration-300 ease-in-out
                lg:static lg:translate-x-0 lg:w-64 flex-shrink-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64`}
            >
                <div className="flex items-center justify-between h-20 border-b border-slate-800 px-4">
                    <div className="flex items-center">
                        <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        <h1 className="text-2xl font-bold ml-2 text-slate-100">LensLedger</h1>
                    </div>
                     <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white" aria-label="Close sidebar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {mainNavItems.map((item) => (
                        <a
                            key={item.name}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleLinkClick(item.name);
                            }}
                            className={`flex items-center px-4 py-3 text-lg rounded-lg transition-colors duration-200 ${
                                activePage === item.name
                                    ? 'bg-cyan-500 text-white font-semibold shadow-lg'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                            }`}
                        >
                            {item.icon}
                            <span className="ml-4">{item.name}</span>
                        </a>
                    ))}
                </nav>
                <div className="px-4 py-6 border-t border-slate-800">
                     {settingsItem && (
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleLinkClick(settingsItem.name);
                            }}
                            className={`flex items-center px-4 py-3 text-lg rounded-lg transition-colors duration-200 ${
                                activePage === settingsItem.name
                                    ? 'bg-cyan-500 text-white font-semibold shadow-lg'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                            }`}
                        >
                            {settingsItem.icon}
                            <span className="ml-4">{settingsItem.name}</span>
                        </a>
                     )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;

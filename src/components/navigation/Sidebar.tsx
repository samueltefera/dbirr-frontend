// components/navigation/Sidebar.tsx
'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { dashboardNavItems } from '@/lib/constants/navigation'; // Import shared items
import { UserCircle, LogOut } from 'lucide-react'; // Keep specific icons needed here
import Link from 'next/link';
import { cn } from '@/lib/utils';


export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
  
    const handleLogout = () => {
      logout();
      router.push('/auth/login');
    };
  
    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || <UserCircle size={20}/> ;
    }
  
  
    return (
      // Add responsive classes: hidden on small screens, flex on medium+
      <aside className="hidden md:flex w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex-col">
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-neutral-800 shrink-0">
           <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-transparent bg-clip-text">
             dbirr
           </Link>
        </div>
  
        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
           {/* Use imported dashboardNavItems */}
          {dashboardNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 text-cyan-700 dark:text-cyan-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
  
        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-neutral-800 shrink-0">
           {/* ... (keep user info and logout button as before) ... */}
           {user && (
             <div className='mb-3 flex items-center space-x-3'>
                 <Avatar className="h-9 w-9">
                    <AvatarFallback className='text-xs bg-gradient-to-br from-cyan-200 to-blue-300 dark:from-cyan-800 dark:to-blue-800 text-gray-700 dark:text-white font-semibold'>
                        {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                 </Avatar>
                 <div className='overflow-hidden'>
                     <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                 </div>
             </div>
           )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    );
  }
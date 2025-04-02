// components/navigation/BottomNavBar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { dashboardNavItems } from '@/lib/constants/navigation'; // Import shared items
import { cn } from '@/lib/utils';

export default function BottomNavBar() {
  const pathname = usePathname();

  // Optional: Decide if you want to show Settings/other items in bottom nav
  // const mobileNavItems = dashboardNavItems.filter(item => item.label !== 'Settings');
  const mobileNavItems = dashboardNavItems; // Show all for now

  return (
    // Add responsive classes: flex on small screens, hidden on medium+
    // Position fixed at bottom, full width, background, border, high z-index
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-around z-50">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors group pt-1", // Added padding-top
              isActive
                ? "text-cyan-600 dark:text-cyan-400"
                : "text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400"
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <item.icon
                className={cn(
                    "h-6 w-6 mb-0.5 transition-transform", // Adjusted icon size and margin
                    // Optional: slightly scale active icon
                    // isActive ? "scale-110" : "group-hover:scale-105"
                )}
                strokeWidth={isActive ? 2.5 : 2} // Make active icon bolder
            />
            <span className="truncate text-[10px] leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
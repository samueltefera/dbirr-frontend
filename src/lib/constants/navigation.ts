// lib/constants/navigation.ts
import {
    LayoutDashboard,
    ArrowLeftRight,
    Link2,
    Settings,
    Wallet,
    LucideIcon // Import the type for the icon component
  } from 'lucide-react';
  
  // Define an interface for the navigation items
  export interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon; // Use the imported type
  }
  
  export const dashboardNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/assets', label: 'Assets', icon: Wallet }, // Keep commented if not used
    { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { href: '/dashboard/links', label: 'Payment Links', icon: Link2 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];
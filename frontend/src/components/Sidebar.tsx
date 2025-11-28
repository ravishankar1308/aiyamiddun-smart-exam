
// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BookOpen, Edit, BarChart2, Settings, LogOut, BrainCircuit, Database } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// navLinks are now structured hierarchically. 
// Each role gets the links of the roles below it.
const navLinks = {
    all: [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
    ],
    // Links only for owners
    owner: [
        // Future owner-specific links like 'System Health' or 'Billing' would go here.
    ],
    // Admin-specific links (they also get all teacher links)
    admin: [
        { name: 'Users', href: '/dashboard/users', icon: Users },
        { name: 'Metadata', href: '/dashboard/metadata', icon: Database },
    ],
    // Teacher-specific links
    teacher: [
        { name: 'Questions', href: '/dashboard/questions', icon: BookOpen },
        { name: 'Exams', href: '/dashboard/exams', icon: Edit },
        { name: 'Results', href: '/dashboard/results', icon: BarChart2 },
        { name: 'AI Generator', href: '/dashboard/generator', icon: BrainCircuit },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
    // Student-specific links
    student: [
        { name: 'Take Exam', href: '/dashboard/take-exam', icon: Edit },
        { name: 'My Results', href: '/dashboard/my-results', icon: BarChart2 },
    ],
};

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const getLinksForRole = (role) => {
        const links = [...navLinks.all];

        // Use a switch with fall-through to build permissions hierarchically
        // Owner gets all links, Admin gets theirs + teacher, etc.
        switch (role) {
            case 'owner':
                links.push(...navLinks.owner);
                // fall-through
            case 'admin':
                links.push(...navLinks.admin);
                // fall-through
            case 'teacher':
                links.push(...navLinks.teacher);
                break;
            case 'student':
                links.push(...navLinks.student);
                break;
        }

        // Remove duplicates and maintain insertion order.
        // This ensures roles with overlapping permissions don't get duplicate links.
        return [...new Map(links.map(item => [item.name, item])).values()];
    };

    const userLinks = user ? getLinksForRole(user.role) : [];

    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h1 className="text-xl font-bold">Aiyamiddun</h1>
                <p className="text-sm text-gray-400">Exam Portal</p>
            </div>
            <nav className="flex-grow">
                <ul>
                    {userLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.name}>
                                <Link href={link.href} legacyBehavior>
                                    <a className={`flex items-center p-4 text-sm hover:bg-gray-700 ${isActive ? 'bg-blue-600' : ''}`}>
                                        <link.icon className="w-5 h-5 mr-3" />
                                        {link.name}
                                    </a>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="p-4 border-t border-gray-700">
                <button onClick={logout} className="w-full flex items-center p-3 text-sm bg-red-600 hover:bg-red-700 rounded">
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
}


// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BookOpen, Edit, BarChart2, Settings, LogOut, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navLinks = {
    all: [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
    ],
    owner: [
        { name: 'Users', href: '/dashboard/users', icon: Users },
        { name: 'AI Generator', href: '/dashboard/generator', icon: BrainCircuit },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
    admin: [
        { name: 'Users', href: '/dashboard/users', icon: Users },
        { name: 'Questions', href: '/dashboard/questions', icon: BookOpen },
        { name: 'Exams', href: '/dashboard/exams', icon: Edit },
        { name: 'Results', href: '/dashboard/results', icon: BarChart2 },
        { name: 'AI Generator', href: '/dashboard/generator', icon: BrainCircuit },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
    teacher: [
        { name: 'Questions', href: '/dashboard/questions', icon: BookOpen },
        { name: 'Exams', href: '/dashboard/exams', icon: Edit },
        { name: 'Results', href: '/dashboard/results', icon: BarChart2 },
        { name: 'AI Generator', href: '/dashboard/generator', icon: BrainCircuit },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
    student: [
        { name: 'Take Exam', href: '/dashboard/take-exam', icon: Edit },
        { name: 'My Results', href: '/dashboard/my-results', icon: BarChart2 },
    ],
};

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const getLinksForRole = (role) => {
        let links = [...navLinks.all];
        if (role === 'owner') links.push(...navLinks.owner);
        if (role === 'admin') links.push(...navLinks.admin);
        if (role === 'teacher') links.push(...navLinks.teacher);
        if (role === 'student') links.push(...navLinks.student);
        // Remove duplicates for users with multiple roles (e.g., admin is also a teacher)
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

// components/Sidebar.tsx
'use client';
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var link_1 = __importDefault(require("next/link"));
var navigation_1 = require("next/navigation");
var lucide_react_1 = require("lucide-react");
var AuthContext_1 = require("@/context/AuthContext");
var navLinks = {
    all: [
        { name: 'Dashboard', href: '/dashboard', icon: lucide_react_1.Home },
    ],
    owner: [
        { name: 'Users', href: '/dashboard/users', icon: lucide_react_1.Users },
        { name: 'Settings', href: '/dashboard/settings', icon: lucide_react_1.Settings },
    ],
    admin: [
        { name: 'Users', href: '/dashboard/users', icon: lucide_react_1.Users },
        { name: 'Questions', href: '/dashboard/questions', icon: lucide_react_1.BookOpen },
        { name: 'Exams', href: '/dashboard/exams', icon: lucide_react_1.Edit },
        { name: 'Results', href: '/dashboard/results', icon: lucide_react_1.BarChart2 },
        { name: 'Settings', href: '/dashboard/settings', icon: lucide_react_1.Settings },
    ],
    teacher: [
        { name: 'Questions', href: '/dashboard/questions', icon: lucide_react_1.BookOpen },
        { name: 'Exams', href: '/dashboard/exams', icon: lucide_react_1.Edit },
        { name: 'Results', href: '/dashboard/results', icon: lucide_react_1.BarChart2 },
    ],
    student: [
        { name: 'Take Exam', href: '/dashboard/take-exam', icon: lucide_react_1.Edit },
        { name: 'My Results', href: '/dashboard/my-results', icon: lucide_react_1.BarChart2 },
    ],
};
function Sidebar() {
    var pathname = (0, navigation_1.usePathname)();
    var _a = (0, AuthContext_1.useAuth)(), user = _a.user, logout = _a.logout;
    var getLinksForRole = function (role) {
        var links = __spreadArray([], navLinks.all, true);
        if (role === 'owner')
            links.push.apply(links, navLinks.owner);
        if (role === 'admin')
            links.push.apply(links, navLinks.admin);
        if (role === 'teacher')
            links.push.apply(links, navLinks.teacher);
        if (role === 'student')
            links.push.apply(links, navLinks.student);
        // Remove duplicates for users with multiple roles (e.g., admin is also a teacher)
        return __spreadArray([], new Map(links.map(function (item) { return [item.name, item]; })).values(), true);
    };
    var userLinks = user ? getLinksForRole(user.role) : [];
    return (<div className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h1 className="text-xl font-bold">Aiyamiddun</h1>
                <p className="text-sm text-gray-400">Exam Portal</p>
            </div>
            <nav className="flex-grow">
                <ul>
                    {userLinks.map(function (link) {
            var isActive = pathname === link.href;
            return (<li key={link.name}>
                                <link_1.default href={link.href} legacyBehavior>
                                    <a className={"flex items-center p-4 text-sm hover:bg-gray-700 ".concat(isActive ? 'bg-blue-600' : '')}>
                                        <link.icon className="w-5 h-5 mr-3"/>
                                        {link.name}
                                    </a>
                                </link_1.default>
                            </li>);
        })}
                </ul>
            </nav>
            <div className="p-4 border-t border-gray-700">
                <button onClick={logout} className="w-full flex items-center p-3 text-sm bg-red-600 hover:bg-red-700 rounded">
                    <lucide_react_1.LogOut className="w-5 h-5 mr-3"/>
                    Logout
                </button>
            </div>
        </div>);
}
exports.default = Sidebar;
//# sourceMappingURL=Sidebar.js.map
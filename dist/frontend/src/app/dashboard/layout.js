// app/dashboard/layout.tsx
'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Sidebar_1 = __importDefault(require("@/components/Sidebar"));
var AuthContext_1 = require("@/context/AuthContext");
var navigation_1 = require("next/navigation");
var react_1 = require("react");
function DashboardLayout(_a) {
    var children = _a.children;
    var _b = (0, AuthContext_1.useAuth)(), user = _b.user, loading = _b.loading;
    var router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(function () {
        // If authentication is not loading and there's no user, redirect to the login page.
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);
    // While loading or if no user is authenticated yet, show a loader.
    // This prevents a flash of the dashboard content before the redirect happens.
    if (loading || !user) {
        return (<div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold">Loading session...</p>
      </div>);
    }
    // If the user is authenticated, render the full dashboard layout.
    return (<div className="flex min-h-screen bg-gray-50">
      <Sidebar_1.default />
      <main className="flex-grow p-8">
        {children}
      </main>
    </div>);
}
exports.default = DashboardLayout;
//# sourceMappingURL=layout.js.map
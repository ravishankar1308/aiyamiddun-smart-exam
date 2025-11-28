'use client';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var api_1 = require("@/lib/api");
var lucide_react_1 = require("lucide-react");
var AuthContext_1 = require("@/context/AuthContext");
var UserFormModal_1 = __importDefault(require("@/components/UserFormModal"));
function UsersPage() {
    var _this = this;
    var _a = (0, react_1.useState)([]), users = _a[0], setUsers = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(false), isModalOpen = _d[0], setIsModalOpen = _d[1];
    var _e = (0, react_1.useState)(null), selectedUser = _e[0], setSelectedUser = _e[1];
    var currentUser = (0, AuthContext_1.useAuth)().user;
    var fetchUsers = function () { return __awaiter(_this, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, (0, api_1.apiGetUsers)()];
                case 1:
                    data = _a.sent();
                    setUsers(data);
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    setError(err_1.message || 'Failed to fetch users');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        fetchUsers();
    }, []);
    var handleToggleDisable = function (userId, currentStatus) { return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("Are you sure you want to ".concat(currentStatus ? 'enable' : 'disable', " this user?")))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, api_1.apiToggleUserDisable)(userId)];
                case 2:
                    _a.sent();
                    fetchUsers(); // Re-fetch to update the UI
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    alert(err_2.message || "Failed to update user status.");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Are you sure you want to permanently delete this user?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, api_1.apiDeleteUser)(userId)];
                case 2:
                    _a.sent();
                    fetchUsers(); // Re-fetch to update the UI
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    alert(err_3.message || "Failed to delete user.");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var openModal = function (user) {
        if (user === void 0) { user = null; }
        setSelectedUser(user);
        setIsModalOpen(true);
    };
    var closeModal = function () {
        setIsModalOpen(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh data when modal closes
    };
    // Render loading and error states
    if (loading)
        return <p>Loading users...</p>;
    if (error)
        return <p className="text-red-500">Error: {error}</p>;
    return (<div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">User Management</h1>
                <button onClick={function () { return openModal(); }} className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-600">
                    <lucide_react_1.Plus size={20}/>
                    Add User
                </button>
            </div>

            {/* User table */}
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(function (user) { return (<tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={"px-2 inline-flex text-xs leading-5 font-semibold rounded-full ".concat(user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800')}>
                                        {user.disabled ? 'Disabled' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={function () { return handleToggleDisable(user.id, user.disabled); }} className="text-gray-400 hover:text-gray-600 mr-2" title={user.disabled ? 'Enable User' : 'Disable User'}>
                                        {user.disabled ? <lucide_react_1.ToggleLeft size={20}/> : <lucide_react_1.ToggleRight size={20}/>}
                                    </button>
                                    <button onClick={function () { return openModal(user); }} className="text-indigo-600 hover:text-indigo-900 mr-2" title="Edit User">
                                        <lucide_react_1.Edit size={20}/>
                                    </button>
                                    {(currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) !== user.id && (<button onClick={function () { return handleDelete(user.id); }} className="text-red-600 hover:text-red-900" title="Delete User">
                                        <lucide_react_1.Trash2 size={20}/>
                                    </button>)}
                                </td>
                            </tr>); })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (<UserFormModal_1.default user={selectedUser} onClose={closeModal}/>)} 
        </div>);
}
exports.default = UsersPage;
//# sourceMappingURL=page.js.map
// components/UserFormModal.tsx
'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var api_1 = require("@/lib/api");
var lucide_react_1 = require("lucide-react");
function UserFormModal(_a) {
    var _this = this;
    var user = _a.user, onClose = _a.onClose;
    var _b = (0, react_1.useState)({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'student',
    }), formData = _b[0], setFormData = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var isEditMode = !!user;
    (0, react_1.useEffect)(function () {
        if (isEditMode) {
            setFormData({
                name: user.name,
                username: user.username,
                password: '', // Password is not sent for editing unless it's being changed
                confirmPassword: '',
                role: user.role,
            });
        }
    }, [user, isEditMode]);
    var handleChange = function (e) {
        var _a;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[e.target.name] = e.target.value, _a)));
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var confirmPassword, userData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError(null);
                    if (formData.password !== formData.confirmPassword) {
                        setError('Passwords do not match');
                        return [2 /*return*/];
                    }
                    if (!isEditMode && formData.password.length < 6) {
                        setError("Password must be at least 6 characters long.");
                        return [2 /*return*/];
                    }
                    if (isEditMode && formData.password && formData.password.length < 6) {
                        setError("New password must be at least 6 characters long.");
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    confirmPassword = formData.confirmPassword, userData = __rest(formData, ["confirmPassword"]);
                    // Only include the password if it's being set
                    if (!userData.password) {
                        delete userData.password;
                    }
                    if (!isEditMode) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, api_1.apiUpdateUser)(user.id, userData)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, api_1.apiCreateUser)(userData)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    onClose(); // Close the modal on success
                    return [3 /*break*/, 8];
                case 6:
                    err_1 = _a.sent();
                    setError(err_1.message || 'An unexpected error occurred.');
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{isEditMode ? 'Edit User' : 'Add New User'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <lucide_react_1.X size={24}/>
            </button>
        </div>
        
        <form onSubmit={handleSubmit}>
            {/* Form fields... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg"/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg"/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        {isEditMode ? 'New Password (optional)' : 'Password'}
                    </label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required={!isEditMode} className="w-full px-3 py-2 border rounded-lg"/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required={!!formData.password} className="w-full px-3 py-2 border rounded-lg"/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">Role</label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                    </select>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm italic my-4">{error}</p>}

            <div className="flex justify-end mt-6">
                <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2">
                    Cancel
                </button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" disabled={loading}>
                    {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update User' : 'Create User')}
                </button>
            </div>
        </form>
      </div>
    </div>);
}
exports.default = UserFormModal;
//# sourceMappingURL=UserFormModal.js.map
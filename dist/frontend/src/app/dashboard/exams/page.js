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
var link_1 = __importDefault(require("next/link"));
var api_1 = require("@/lib/api");
var lucide_react_1 = require("lucide-react");
function ExamsPage() {
    var _this = this;
    var _a = (0, react_1.useState)([]), exams = _a[0], setExams = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var fetchExams = function () { return __awaiter(_this, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, (0, api_1.apiGetExams)()];
                case 1:
                    data = _a.sent();
                    setExams(data);
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    setError(err_1.message || 'Failed to fetch exams');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        fetchExams();
    }, []);
    var handleDelete = function (examId) { return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Are you sure you want to permanently delete this exam?'))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, api_1.apiDeleteExam)(examId)];
                case 2:
                    _a.sent();
                    fetchExams(); // Re-fetch to update the UI
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    alert(err_2.message || "Failed to delete exam.");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (loading)
        return <p>Loading exams...</p>;
    if (error)
        return <p className="text-red-500">Error: {error}</p>;
    return (<div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Exam Management</h1>
                <link_1.default href="/dashboard/exams/new" legacyBehavior>
                    <a className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-600">
                        <lucide_react_1.Plus size={20}/>
                        Create New Exam
                    </a>
                </link_1.default>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (Mins)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {exams.map(function (exam) {
            var _a;
            return (<tr key={exam.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{((_a = exam.subject) === null || _a === void 0 ? void 0 : _a.name) || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.duration_minutes}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={"px-2 inline-flex text-xs leading-5 font-semibold rounded-full ".concat(exam.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}>
                                        {exam.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button title="Publish/Unpublish" className="text-gray-400 hover:text-gray-600 mr-2">
                                        <lucide_react_1.Eye size={20}/>
                                    </button>
                                    <link_1.default href={"/dashboard/exams/edit/".concat(exam.id)} legacyBehavior>
                                        <a title="Edit" className="text-indigo-600 hover:text-indigo-900 mr-2">
                                            <lucide_react_1.Edit size={20}/>
                                        </a>
                                    </link_1.default>
                                    <button onClick={function () { return handleDelete(exam.id); }} className="text-red-600 hover:text-red-900" title="Delete">
                                        <lucide_react_1.Trash2 size={20}/>
                                    </button>
                                </td>
                            </tr>);
        })}
                    </tbody>
                </table>
            </div>
        </div>);
}
exports.default = ExamsPage;
//# sourceMappingURL=page.js.map
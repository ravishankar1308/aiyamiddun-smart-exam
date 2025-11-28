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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var api_1 = require("@/lib/api");
var lucide_react_1 = require("lucide-react");
function EditExamPage(_a) {
    var _this = this;
    var params = _a.params;
    var _b = (0, react_1.useState)(1), step = _b[0], setStep = _b[1];
    var _c = (0, react_1.useState)({
        title: '',
        description: '',
        subject_id: '',
        duration_minutes: 60,
    }), examDetails = _c[0], setExamDetails = _c[1];
    var _d = (0, react_1.useState)([]), availableQuestions = _d[0], setAvailableQuestions = _d[1];
    var _e = (0, react_1.useState)([]), selectedQuestions = _e[0], setSelectedQuestions = _e[1];
    var _f = (0, react_1.useState)({ subjects: [] }), metadata = _f[0], setMetadata = _f[1];
    var _g = (0, react_1.useState)(true), loading = _g[0], setLoading = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    var router = (0, navigation_1.useRouter)();
    var examId = params.id;
    (0, react_1.useEffect)(function () {
        var fetchExamData = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, examData, meta, questions, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, 3, 4]);
                        setLoading(true);
                        return [4 /*yield*/, Promise.all([
                                (0, api_1.apiGetExam)(examId),
                                (0, api_1.apiGetMetadata)(),
                                (0, api_1.apiGetQuestions)()
                            ])];
                    case 1:
                        _a = _b.sent(), examData = _a[0], meta = _a[1], questions = _a[2];
                        setExamDetails({
                            title: examData.title,
                            description: examData.description,
                            subject_id: examData.subject_id,
                            duration_minutes: examData.duration_minutes,
                        });
                        setSelectedQuestions(examData.questions.map(function (q) { return q.id; }));
                        setMetadata(meta);
                        setAvailableQuestions(questions);
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _b.sent();
                        setError(err_1.message || 'Failed to load exam data.');
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        if (examId) {
            fetchExamData();
        }
    }, [examId]);
    var handleDetailChange = function (e) {
        var _a;
        setExamDetails(__assign(__assign({}, examDetails), (_a = {}, _a[e.target.name] = e.target.value, _a)));
    };
    var handleQuestionToggle = function (questionId) {
        setSelectedQuestions(function (prev) {
            return prev.includes(questionId) ? prev.filter(function (id) { return id !== questionId; }) : __spreadArray(__spreadArray([], prev, true), [questionId], false);
        });
    };
    var goToNextStep = function () {
        if (step === 1) {
            if (!examDetails.title || !examDetails.subject_id) {
                setError('Title and Subject are required.');
                return;
            }
            setError(null);
            setStep(2);
        }
    };
    var goToPrevStep = function () { return setStep(step - 1); };
    var handleUpdateExam = function () { return __awaiter(_this, void 0, void 0, function () {
        var examData, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (selectedQuestions.length === 0) {
                        setError('You must select at least one question.');
                        return [2 /*return*/];
                    }
                    setError(null);
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    examData = __assign(__assign({}, examDetails), { question_ids: selectedQuestions });
                    return [4 /*yield*/, (0, api_1.apiUpdateExam)(examId, examData)];
                case 2:
                    _a.sent();
                    router.push('/dashboard/exams'); // Redirect after successful update
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    setError(err_2.message || 'Failed to update exam.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (loading)
        return <p>Loading exam editor...</p>;
    if (error)
        return <p className="text-red-500">Error: {error}</p>;
    return (<div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <button onClick={function () { return router.back(); }} className="text-gray-500 hover:text-gray-700 mr-4">
                    <lucide_react_1.ArrowLeft size={24}/>
                </button>
                <h1 className="text-3xl font-bold">Edit Exam</h1>
            </div>

            {/* Step Indicator */}
            <div className="mb-8 flex justify-center">
                <div className="flex items-center">
                    <div className={"w-10 h-10 rounded-full flex items-center justify-center ".concat(step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200')}>1</div>
                    <p className={"ml-2 ".concat(step >= 1 ? 'font-semibold' : '')}>Exam Details</p>
                    <div className={"w-24 h-1 mx-4 ".concat(step > 1 ? 'bg-blue-500' : 'bg-gray-200')}></div>
                    <div className={"w-10 h-10 rounded-full flex items-center justify-center ".concat(step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200')}>2</div>
                    <p className={"ml-2 ".concat(step >= 2 ? 'font-semibold' : '')}>Manage Questions</p>
                </div>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6">{error}</div>}

            {/* Step 1: Exam Details */}
            {step === 1 && (<div className="space-y-6">
                    <div>
                        <label className="block font-bold mb-2">Exam Title</label>
                        <input type="text" name="title" value={examDetails.title} onChange={handleDetailChange} className="w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block font-bold mb-2">Description</label>
                        <textarea name="description" value={examDetails.description} onChange={handleDetailChange} className="w-full p-2 border rounded-md h-24"/>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="block font-bold mb-2">Subject</label>
                            <select name="subject_id" value={examDetails.subject_id} onChange={handleDetailChange} className="w-full p-2 border rounded-md">
                                <option value="">Select a Subject</option>
                                {metadata.subjects.map(function (s) { return <option key={s.id} value={s.id}>{s.name}</option>; })}
                            </select>
                        </div>
                         <div>
                            <label className="block font-bold mb-2">Duration (in minutes)</label>
                            <input type="number" name="duration_minutes" value={examDetails.duration_minutes} onChange={handleDetailChange} className="w-full p-2 border rounded-md"/>
                        </div>
                    </div>
                    <div className="flex justify-end mt-8">
                        <button onClick={goToNextStep} className="bg-blue-500 text-white py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-blue-600">
                            Next <lucide_react_1.ArrowRight size={20}/>
                        </button>
                    </div>
                </div>)}

            {/* Step 2: Add Questions */}
            {step === 2 && (<div>
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold">Select Questions ({selectedQuestions.length} selected)</h2>
                        {/* Add filter controls here */}
                    </div>
                    <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-3">
                        {availableQuestions.map(function (q) { return (<div key={q.id} className="flex items-center bg-gray-50 p-3 rounded-md">
                                <input type="checkbox" checked={selectedQuestions.includes(q.id)} onChange={function () { return handleQuestionToggle(q.id); }} className="h-5 w-5 mr-4"/>
                                <div>
                                    <p className="font-semibold">{q.question_text}</p>
                                    <p className="text-sm text-gray-500">{q.subject} - {q.topic} - {q.difficulty}</p>
                                </div>
                            </div>); })}
                    </div>
                     <div className="flex justify-between items-center mt-8">
                        <button onClick={goToPrevStep} className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-gray-400">
                           <lucide_react_1.ArrowLeft size={20}/> Back
                        </button>
                        <button onClick={handleUpdateExam} disabled={loading} className="bg-green-500 text-white py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-green-600 disabled:bg-gray-400">
                           {loading ? 'Saving...' : 'Update Exam'} <lucide_react_1.Save size={20}/>
                        </button>
                    </div>
                </div>)}
        </div>);
}
exports.default = EditExamPage;
//# sourceMappingURL=page.js.map
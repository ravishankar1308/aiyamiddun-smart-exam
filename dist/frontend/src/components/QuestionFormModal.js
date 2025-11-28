// components/QuestionFormModal.tsx
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
var api_1 = require("@/lib/api");
var lucide_react_1 = require("lucide-react");
function QuestionFormModal(_a) {
    var _this = this;
    var question = _a.question, metadata = _a.metadata, onClose = _a.onClose;
    var isEditMode = !!question;
    var initialFormState = {
        question_text: '',
        subject_id: '',
        topic_id: '',
        subtopic_id: '',
        difficulty: 'medium',
        question_type: 'multiple-choice',
        options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }],
        explanation: '',
    };
    var _b = (0, react_1.useState)(initialFormState), formData = _b[0], setFormData = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    (0, react_1.useEffect)(function () {
        if (isEditMode && question) {
            setFormData({
                question_text: question.question_text || '',
                subject_id: question.subject_id || '',
                topic_id: question.topic_id || '',
                subtopic_id: question.subtopic_id || '',
                difficulty: question.difficulty || 'medium',
                question_type: question.question_type || 'multiple-choice',
                options: question.options && question.options.length > 0 ? question.options : initialFormState.options,
                explanation: question.explanation || '',
            });
        }
        else {
            setFormData(initialFormState);
        }
    }, [question, isEditMode]);
    var handleChange = function (e) {
        var _a;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[e.target.name] = e.target.value, _a)));
    };
    var handleOptionChange = function (index, field, value) {
        var newOptions = __spreadArray([], formData.options, true);
        newOptions[index][field] = value;
        setFormData(__assign(__assign({}, formData), { options: newOptions }));
    };
    var handleCorrectOptionChange = function (index) {
        var newOptions = formData.options.map(function (opt, i) { return (__assign(__assign({}, opt), { is_correct: i === index })); });
        setFormData(__assign(__assign({}, formData), { options: newOptions }));
    };
    var addOption = function () {
        setFormData(__assign(__assign({}, formData), { options: __spreadArray(__spreadArray([], formData.options, true), [{ option_text: '', is_correct: false }], false) }));
    };
    var removeOption = function (index) {
        if (formData.options.length <= 2)
            return; // Must have at least two options
        var newOptions = formData.options.filter(function (_, i) { return i !== index; });
        setFormData(__assign(__assign({}, formData), { options: newOptions }));
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError(null);
                    setLoading(true);
                    // Basic validation
                    if (formData.options.filter(function (opt) { return opt.is_correct; }).length !== 1) {
                        setError('You must select exactly one correct answer.');
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    if (!isEditMode) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, api_1.apiUpdateQuestion)(question.id, formData)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, api_1.apiCreateQuestion)(formData)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    onClose();
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
    return (<div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 overflow-y-auto p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl my-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Question' : 'Add New Question'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <lucide_react_1.X size={24}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Question Text</label>
                        <textarea name="question_text" value={formData.question_text} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg h-24"/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Subject</label>
                            <select name="subject_id" value={formData.subject_id} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
                                <option value="">Select Subject</option>
                                {metadata.subjects.map(function (s) { return <option key={s.id} value={s.id}>{s.name}</option>; })}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-bold mb-2">Topic</label>
                            <select name="topic_id" value={formData.topic_id} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
                                <option value="">Select Topic</option>
                                {metadata.topics.map(function (t) { return <option key={t.id} value={t.id}>{t.name}</option>; })}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-bold mb-2">Difficulty</label>
                            <select name="difficulty" value={formData.difficulty} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
                                {metadata.difficulties.map(function (d) { return <option key={d} value={d}>{d}</option>; })}
                            </select>
                        </div>
                    </div>
                    
                    <div className="pt-4">
                        <h3 className="text-lg font-semibold mb-2">Options</h3>
                        <div className="space-y-3">
                        {formData.options.map(function (option, index) { return (<div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                                <input type="radio" name="correct_answer" checked={option.is_correct} onChange={function () { return handleCorrectOptionChange(index); }} className="form-radio h-5 w-5 text-blue-600"/>
                                <input type="text" placeholder={"Option ".concat(index + 1)} value={option.option_text} onChange={function (e) { return handleOptionChange(index, 'option_text', e.target.value); }} required className="w-full px-3 py-2 border rounded-lg"/>
                                <button type="button" onClick={function () { return removeOption(index); }} disabled={formData.options.length <= 2} className="text-red-500 disabled:text-gray-300 p-1">
                                    <lucide_react_1.Trash2 size={18}/>
                                </button>
                            </div>); })}
                        </div>
                        <button type-="button" onClick={addOption} className="mt-3 text-sm text-blue-600 flex items-center gap-1"><lucide_react_1.Plus size={16}/> Add Option</button>
                    </div>

                     <div>
                        <label className="block text-sm font-bold mb-2">Explanation (Optional)</label>
                        <textarea name="explanation" value={formData.explanation} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg h-20"/>
                    </div>

                    {error && <p className="text-red-500 text-sm italic">{error}</p>}

                    <div className="flex justify-end mt-8">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700" disabled={loading}>
                            {loading ? 'Saving...' : isEditMode ? 'Update Question' : 'Create Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>);
}
exports.default = QuestionFormModal;
//# sourceMappingURL=QuestionFormModal.js.map
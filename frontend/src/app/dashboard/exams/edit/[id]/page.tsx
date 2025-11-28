'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGetExam, apiUpdateExam, apiCreateExam, apiGetMetadata, apiGenerateExamDraft, apiSwapQuestion } from '@/lib/api';
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, RefreshCw, Save, Loader2 } from 'lucide-react';

// Define the structure for a question requirement
interface QuestionRequirement {
    id: number;
    topic: string;
    question_type: 'mcq' | 'essay' | 'multiple_answer';
    count: number;
}

export default function ExamBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const isNew = params.id === 'new';
    const examId = isNew ? null : params.id as string;

    // Step 1: Configuration, Step 2: Curation
    const [step, setStep] = useState(1);

    // Main exam details
    const [examDetails, setExamDetails] = useState({
        title: '',
        description: '',
        grade_id: '',
        subject_id: '',
        duration_minutes: 60,
        start_time: '',
        end_time: '',
    });

    // Rules for generating the exam draft
    const [questionRequirements, setQuestionRequirements] = useState<QuestionRequirement[]>([]);
    
    // The list of questions in the draft preview
    const [draftQuestions, setDraftQuestions] = useState<any[]>([]);

    // Metadata for dropdowns
    const [metadata, setMetadata] = useState({ grades: [], subjects: [], topics: [], question_types: ['mcq', 'essay', 'multiple_answer'] });

    const [loading, setLoading] = useState(!isNew);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial data for editing or metadata for creating
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [grades, subjects] = await Promise.all([apiGetMetadata('grades'), apiGetMetadata('subjects')]);
                setMetadata(prev => ({ ...prev, grades, subjects }));

                if (!isNew && examId) {
                    const exam = await apiGetExam(examId);
                    setExamDetails({
                        title: exam.title,
                        description: exam.description,
                        grade_id: exam.grade_id,
                        subject_id: exam.subject_id,
                        duration_minutes: exam.duration_minutes,
                        start_time: exam.start_time ? new Date(exam.start_time).toISOString().slice(0, 16) : '',
                        end_time: exam.end_time ? new Date(exam.end_time).toISOString().slice(0, 16) : '',
                    });
                    // If editing, the draft is the exam's current questions
                    setDraftQuestions(exam.questions || []);
                    setStep(2); // Start at the curation step if exam already has questions
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [examId, isNew]);

    // --- Handler Functions ---

    const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setExamDetails({ ...examDetails, [e.target.name]: e.target.value });
    };

    const handleRequirementChange = (index: number, field: keyof QuestionRequirement, value: any) => {
        const newReqs = [...questionRequirements];
        newReqs[index] = { ...newReqs[index], [field]: value };
        setQuestionRequirements(newReqs);
    };

    const addRequirement = () => {
        setQuestionRequirements([...questionRequirements, { id: Date.now(), topic: '', question_type: 'mcq', count: 1 }]);
    };

    const removeRequirement = (id: number) => {
        setQuestionRequirements(questionRequirements.filter(req => req.id !== id));
    };

    const handleGenerateDraft = async () => {
        setError(null);
        setIsGenerating(true);
        try {
            const draft = await apiGenerateExamDraft({
                grade_id: examDetails.grade_id,
                subject_id: examDetails.subject_id,
                requirements: questionRequirements,
            });
            setDraftQuestions(draft.questions);
            setStep(2);
        } catch (err: any) {
            setError(err.message || 'Failed to generate draft.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReorder = (index: number, direction: 'up' | 'down') => {
        const newQuestions = [...draftQuestions];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newQuestions.length) return;
        [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]]; // Swap
        setDraftQuestions(newQuestions);
    };

    const handleRemoveQuestion = (questionId: number) => {
        setDraftQuestions(draftQuestions.filter(q => q.id !== questionId));
    };

    const handleSwapQuestion = async (questionToSwap: any, index: number) => {
        try {
            const currentQuestionIds = draftQuestions.map(q => q.id);
            const newQuestion = await apiSwapQuestion({
                grade_id: examDetails.grade_id,
                subject_id: examDetails.subject_id,
                topic: questionToSwap.topic,
                question_type: questionToSwap.question_type,
                exclude_ids: currentQuestionIds
            });
            const newDraft = [...draftQuestions];
            newDraft[index] = newQuestion;
            setDraftQuestions(newDraft);
        } catch (err: any) {
            setError(err.message || 'Could not swap question.');
        }
    };

    const handleSaveExam = async () => {
        setLoading(true);
        setError(null);
        try {
            const finalPayload = {
                ...examDetails,
                question_ids: draftQuestions.map(q => q.id), // The backend will use these to create the snapshot
            };

            if (isNew) {
                await apiCreateExam(finalPayload);
            } else if (examId) {
                await apiUpdateExam(examId, finalPayload);
            }
            router.push('/dashboard/exams');
        } catch (err: any) {
            setError(err.message || 'Failed to save exam.');
        } finally {
            setLoading(false);
        }
    };

    // --- Render Logic ---

    if (loading && !isGenerating) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin"/> <p className='ml-2'>Loading Exam Builder...</p></div>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 mr-4"><ArrowLeft size={24} /></button>
                <h1 className="text-3xl font-bold">{isNew ? 'Create New Exam' : 'Edit Exam'}</h1>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6">{error}</div>}
            
            {/* --- STEP 1: CONFIGURATION --- */}
            {step === 1 && (
                <div className="space-y-8">
                    {/* Basic Details */}
                    <div className="p-6 border rounded-lg">
                        <h2 class="text-xl font-semibold mb-4">1. Exam Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input name="title" placeholder="Exam Title" value={examDetails.title} onChange={handleDetailChange} className="p-2 border rounded" />
                            <textarea name="description" placeholder="Description" value={examDetails.description} onChange={handleDetailChange} className="p-2 border rounded md:col-span-2" />
                            <select name="grade_id" value={examDetails.grade_id} onChange={handleDetailChange} className="p-2 border rounded">
                                <option value="">Select Grade</option>
                                {metadata.grades.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                             <select name="subject_id" value={examDetails.subject_id} onChange={handleDetailChange} className="p-2 border rounded">
                                <option value="">Select Subject</option>
                                {metadata.subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <input type="number" name="duration_minutes" placeholder="Duration (minutes)" value={examDetails.duration_minutes} onChange={handleDetailChange} className="p-2 border rounded" />
                            <input type="datetime-local" name="start_time" value={examDetails.start_time} onChange={handleDetailChange} className="p-2 border rounded" />
                            <input type="datetime-local" name="end_time" value={examDetails.end_time} onChange={handleDetailChange} className="p-2 border rounded" />
                        </div>
                    </div>

                    {/* Question Requirements */}
                    <div className="p-6 border rounded-lg">
                         <h2 class="text-xl font-semibold mb-4">2. Question Requirements</h2>
                        {questionRequirements.map((req, index) => (
                            <div key={req.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-4">
                                <input type="text" placeholder="Topic" value={req.topic} onChange={e => handleRequirementChange(index, 'topic', e.target.value)} className="p-2 border rounded" />
                                <select value={req.question_type} onChange={e => handleRequirementChange(index, 'question_type', e.target.value)} className="p-2 border rounded">
                                    {metadata.question_types.map(qt => <option key={qt} value={qt}>{qt.toUpperCase()}</option>)}
                                </select>
                                <input type="number" placeholder="Count" value={req.count} onChange={e => handleRequirementChange(index, 'count', parseInt(e.target.value))} className="p-2 border rounded" />
                                <button onClick={() => removeRequirement(req.id)} className="text-red-500 hover:text-red-700"><Trash2 size={20} /></button>
                            </div>
                        ))}
                        <button onClick={addRequirement} className="bg-blue-100 text-blue-700 py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-200">
                            <Plus size={20} /> Add Requirement
                        </button>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleGenerateDraft} disabled={isGenerating} className="bg-blue-500 text-white py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:bg-blue-300">
                            {isGenerating ? <><Loader2 className="animate-spin"/> Generating...</> : 'Generate Draft'}
                        </button>
                    </div>
                </div>
            )}

            {/* --- STEP 2: CURATION --- */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h2 class="text-xl font-semibold mb-4">Draft Preview</h2>
                        <p>Total Questions: {draftQuestions.length}</p>
                    </div>
                    
                    <div className="space-y-4">
                        {draftQuestions.map((q, index) => (
                             <div key={q.id} className="flex items-center bg-white p-4 border rounded-lg shadow-sm">
                                <div className="flex flex-col gap-2 mr-4">
                                    <button onClick={() => handleReorder(index, 'up')} disabled={index === 0} className="p-1 disabled:opacity-30"><ArrowUp size={20}/></button>
                                    <button onClick={() => handleReorder(index, 'down')} disabled={index === draftQuestions.length - 1} className="p-1 disabled:opacity-30"><ArrowDown size={20}/></button>
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold">{q.question_text}</p>
                                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                        <span>Topic: {q.topic}</span>
                                        <span>Type: {q.question_type}</span>
                                        <span>Marks: {q.marks}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button onClick={() => handleSwapQuestion(q, index)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><RefreshCw size={20}/></button>
                                    <button onClick={() => handleRemoveQuestion(q.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={20}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-8">
                        <button onClick={() => setStep(1)} className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-400">Back to Config</button>
                        <button onClick={handleSaveExam} disabled={loading} className="bg-green-500 text-white py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-green-600 disabled:bg-gray-400">
                           {loading ? <><Loader2 className="animate-spin"/> Saving...</> : <><Save size={20}/> Save Exam</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

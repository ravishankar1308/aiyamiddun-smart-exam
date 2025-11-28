
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGetMetadata, apiGetQuestions, apiCreateExam } from '@/lib/api';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

export default function NewExamPage() {
    const [step, setStep] = useState(1);
    const [examDetails, setExamDetails] = useState({
        title: '',
        description: '',
        subject_id: '',
        duration_minutes: 60,
    });
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
    const [metadata, setMetadata] = useState({ subjects: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [meta, questions] = await Promise.all([apiGetMetadata(), apiGetQuestions()]);
                setMetadata(meta);
                setAvailableQuestions(questions);
            } catch (err: any) {
                setError(err.message || 'Failed to load initial data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setExamDetails({ ...examDetails, [e.target.name]: e.target.value });
    };

    const handleQuestionToggle = (questionId: number) => {
        setSelectedQuestions(prev => 
            prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
        );
    };

    const goToNextStep = () => {
        if (step === 1) {
            if (!examDetails.title || !examDetails.subject_id) {
                setError('Title and Subject are required.');
                return;
            }
            setError(null);
            setStep(2);
        }
    };
    
    const goToPrevStep = () => setStep(step - 1);

    const handleCreateExam = async () => {
        if (selectedQuestions.length === 0) {
            setError('You must select at least one question.');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const examData = { ...examDetails, question_ids: selectedQuestions };
            await apiCreateExam(examData);
            router.push('/dashboard/exams'); // Redirect after successful creation
        } catch (err: any) {
            setError(err.message || 'Failed to create exam.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && step === 1) return <p>Loading exam editor...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 mr-4">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold">Create New Exam</h1>
            </div>

            {/* Step Indicator */}
            <div className="mb-8 flex justify-center">
                <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>1</div>
                    <p className={`ml-2 ${step >= 1 ? 'font-semibold' : ''}`}>Exam Details</p>
                    <div className={`w-24 h-1 mx-4 ${step > 1 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>2</div>
                    <p className={`ml-2 ${step >= 2 ? 'font-semibold' : ''}`}>Add Questions</p>
                </div>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6">{error}</div>}

            {/* Step 1: Exam Details */}
            {step === 1 && (
                <div className="space-y-6">
                    <div>
                        <label className="block font-bold mb-2">Exam Title</label>
                        <input type="text" name="title" value={examDetails.title} onChange={handleDetailChange} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">Description</label>
                        <textarea name="description" value={examDetails.description} onChange={handleDetailChange} className="w-full p-2 border rounded-md h-24" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="block font-bold mb-2">Subject</label>
                            <select name="subject_id" value={examDetails.subject_id} onChange={handleDetailChange} className="w-full p-2 border rounded-md">
                                <option value="">Select a Subject</option>
                                {metadata.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block font-bold mb-2">Duration (in minutes)</label>
                            <input type="number" name="duration_minutes" value={examDetails.duration_minutes} onChange={handleDetailChange} className="w-full p-2 border rounded-md" />
                        </div>
                    </div>
                    <div className="flex justify-end mt-8">
                        <button onClick={goToNextStep} className="bg-blue-500 text-white py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-blue-600">
                            Next <ArrowRight size={20}/>
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Add Questions */}
            {step === 2 && (
                <div>
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold">Select Questions ({selectedQuestions.length} selected)</h2>
                        {/* Add filter controls here */}
                    </div>
                    <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-3">
                        {availableQuestions.map(q => (
                            <div key={q.id} className="flex items-center bg-gray-50 p-3 rounded-md">
                                <input type="checkbox" checked={selectedQuestions.includes(q.id)} onChange={() => handleQuestionToggle(q.id)} className="h-5 w-5 mr-4"/>
                                <div>
                                    <p className="font-semibold">{q.question_text}</p>
                                    <p className="text-sm text-gray-500">{q.subject} - {q.topic} - {q.difficulty}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="flex justify-between items-center mt-8">
                        <button onClick={goToPrevStep} className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-gray-400">
                           <ArrowLeft size={20}/> Back
                        </button>
                        <button onClick={handleCreateExam} disabled={loading} className="bg-green-500 text-white py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-green-600 disabled:bg-gray-400">
                           {loading ? 'Saving...' : 'Create Exam'} <Save size={20}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

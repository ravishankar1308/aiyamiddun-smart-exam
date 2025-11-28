
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGetQuestions, apiToggleQuestionDisable, apiDeleteQuestion } from '@/lib/api';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, Filter } from 'lucide-react';

export default function QuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchData = async () => {
        try {
            setLoading(true);
            const questionsData = await apiGetQuestions();
            setQuestions(questionsData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleDisable = async (questionId: number, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'enable' : 'disable'} this question?`)) return;
        try {
            await apiToggleQuestionDisable(questionId);
            fetchData();
        } catch (err: any) {
            alert(err.message || "Failed to update question status.");
        }
    };

    const handleDelete = async (questionId: number) => {
        if (!confirm('Are you sure you want to permanently delete this question?')) return;
        try {
            await apiDeleteQuestion(questionId);
            fetchData();
        } catch (err: any) {
            alert(err.message || "Failed to delete question.");
        }
    };

    if (loading) return <div className="p-8">Loading questions...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Question Bank</h1>
                <button 
                    onClick={() => router.push('/dashboard/questions/new')} 
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm"
                >
                    <Plus size={20} />
                    Add New Question
                </button>
            </header>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex justify-between">
                <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 w-full max-w-md">
                    <Search size={18} className="text-slate-400"/>
                    <input type="text" placeholder="Search questions..." className="flex-1 p-2 outline-none text-sm"/>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 border rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 text-sm flex items-center gap-1">
                       <Filter size={16}/> Filter
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-x-auto border border-slate-200">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Question Text</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Difficulty</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {questions.map((q: any) => (
                            <tr key={q.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-medium text-slate-800 max-w-sm truncate">{q.text}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{q.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{q.classLevel}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{q.difficulty}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${q.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {q.disabled ? 'Disabled' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                   <button onClick={() => handleToggleDisable(q.id, q.disabled)} className="p-2 text-slate-400 hover:text-slate-600" title={q.disabled ? 'Enable' : 'Disable'}>
                                        {q.disabled ? <ToggleLeft size={18}/> : <ToggleRight size={18}/>}
                                    </button>
                                    <button onClick={() => router.push(`/dashboard/questions/edit/${q.id}`)} className="p-2 text-slate-400 hover:text-blue-600" title="Edit">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-red-600" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

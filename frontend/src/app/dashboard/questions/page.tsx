'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiGetQuestions, apiDeleteQuestion, apiGetMetadata, apiUpdateQuestionStatus } from '@/lib/api';
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce'; // A custom hook for debouncing input

interface Question {
  id: number;
  question_text: string;
  grade_name: string;
  subject_name: string;
  topic: string;
  approval_status: 'approved' | 'rejected' | 'pending';
}

interface Grade {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // State for filters and search
    const [filters, setFilters] = useState({ grade_id: '', subject_id: '', approval_status: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // State for metadata to populate dropdowns
    const [metadata, setMetadata] = useState<{ grades: Grade[], subjects: Subject[] }>({ grades: [], subjects: [] });

    // Fetch metadata for filters on component mount
    useEffect(() => {
        Promise.all([apiGetMetadata('grades'), apiGetMetadata('subjects')])
            .then(([grades, subjects]) => {
                setMetadata({ grades, subjects });
            })
            .catch(() => setError('Failed to load filter metadata.'));
    }, []);

    // Fetch questions whenever filters or search term change
    const fetchData = useCallback(() => {
        setLoading(true);
        apiGetQuestions(filters)
            .then(data => {
                setQuestions(data);
            })
            .catch(err => {
                setError(err.message || 'Failed to fetch questions');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to set this question to ${status}?`)) return;
        try {
            await apiUpdateQuestionStatus(id, status);
            fetchData(); // Refresh data to show the change
        } catch (err: any) {
            alert(`Failed to update status: ${err.message}`);
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
    
    const filteredQuestions = useMemo(() => {
        return questions.filter(q => q.question_text.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    }, [questions, debouncedSearchTerm]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Question Bank</h1>
                <button onClick={() => router.push('/dashboard/questions/edit/new')} className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm">
                    <Plus size={20} /> Add New Question
                </button>
            </header>

            {/* Smart Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                    <select name="grade_id" value={filters.grade_id} onChange={handleFilterChange} className="w-full p-2 border rounded-md text-sm">
                        <option value="">All Grades</option>
                        {metadata.grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
                <div className="md:col-span-1">
                     <select name="subject_id" value={filters.subject_id} onChange={handleFilterChange} className="w-full p-2 border rounded-md text-sm">
                        <option value="">All Subjects</option>
                        {metadata.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="md:col-span-1">
                     <select name="approval_status" value={filters.approval_status} onChange={handleFilterChange} className="w-full p-2 border rounded-md text-sm">
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                 <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 w-full md:col-span-1">
                    <Search size={18} className="text-slate-400"/>
                    <input type="text" placeholder="Search questions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 p-2 outline-none text-sm"/>
                </div>
            </div>

            {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
                <div className="bg-white shadow-sm rounded-lg overflow-x-auto border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-100">
                         <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Question</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Context</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredQuestions.map((q: Question) => (
                                <tr key={q.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800 max-w-md truncate">{q.question_text}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <div>{q.grade_name} - {q.subject_name}</div>
                                        <div className="text-xs text-slate-400">Topic: {q.topic}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ q.approval_status === 'approved' ? 'bg-green-100 text-green-800' : q.approval_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800' }`}>
                                            {q.approval_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {q.approval_status === 'pending' && (
                                            <>
                                                <button onClick={() => handleStatusUpdate(q.id, 'approved')} className="p-2 text-green-500 hover:text-green-700" title="Approve"><CheckCircle size={18}/></button>
                                                <button onClick={() => handleStatusUpdate(q.id, 'rejected')} className="p-2 text-red-500 hover:text-red-700" title="Reject"><XCircle size={18}/></button>
                                            </>
                                        )}
                                        <button onClick={() => router.push(`/dashboard/questions/edit/${q.id}`)} className="p-2 text-slate-400 hover:text-blue-600" title="Edit"><Edit size={18}/></button>
                                        <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-red-600" title="Delete"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

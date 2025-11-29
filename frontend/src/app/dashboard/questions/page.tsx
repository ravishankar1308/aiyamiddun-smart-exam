'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiGetAllQuestions, apiDeleteQuestion, apiGetAllMetadata, apiUpdateQuestionStatus } from '@/lib/api';
import { Eye, Pen, Trash2, CheckCircle, XCircle, ChevronDown, ChevronRight, Search, Filter, PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const QuestionsPage = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ subject: '', grade: '', section: '', difficulty: '' });
    const [metadata, setMetadata] = useState({ grades: [], subjects: [], sections: [], difficulties: [] });
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [questionsData, allMetadata] = await Promise.all([
                    apiGetAllQuestions(),
                    apiGetAllMetadata()
                ]);
                setQuestions(questionsData);
                setMetadata(allMetadata);
            } catch (err) {
                setError('Failed to load data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                await apiDeleteQuestion(id);
                setQuestions(questions.filter(q => q.id !== id));
            } catch (err) {
                setError('Failed to delete question.');
                console.error(err);
            }
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await apiUpdateQuestionStatus(id, status);
            setQuestions(questions.map(q => q.id === id ? { ...q, status } : q));
        } catch (err) {
            setError(`Failed to update status to ${status}.`);
            console.error(err);
        }
    };

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            return (
                (filters.grade === '' || q.grade_id === parseInt(filters.grade)) &&
                (filters.subject === '' || q.subject_id === parseInt(filters.subject)) &&
                (filters.difficulty === '' || q.difficulty_id === parseInt(filters.difficulty)) &&
                (searchTerm === '' || q.text.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        });
    }, [questions, filters, searchTerm]);

    const toggleRowExpansion = (id) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedRows(newSet);
    };
    
    const availableSubjects = useMemo(() => filters.grade ? metadata.subjects.filter(s => s.grade_id === parseInt(filters.grade)) : metadata.subjects, [filters.grade, metadata.subjects]);

    const getStatusChip = (status) => {
        switch (status) {
            case 'approved': return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Approved</span>;
            case 'pending': return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Pending</span>;
            case 'rejected': return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Rejected</span>;
            default: return <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">{status}</span>;
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Question Bank</h1>
                <p className="text-gray-500">Browse, manage, and organize all questions.</p>
            </header>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search questions by text..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <select name="grade" value={filters.grade} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg bg-white">
                        <option value="">All Grades</option>
                        {metadata.grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <select name="subject" value={filters.subject} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg bg-white" disabled={!filters.grade}>
                        <option value="">All Subjects</option>
                        {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg bg-white">
                        <option value="">All Difficulties</option>
                        {metadata.difficulties.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <button onClick={() => router.push('/dashboard/questions/edit/new')} className="md:col-start-5 md:w-auto w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                        <PlusCircle size={18} />
                        New Question
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading questions...</div>
            ) : error ? (
                <div className="text-center py-10 text-red-500">{error}</div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="p-4"></th>
                                <th scope="col" className="p-4">Question Text</th>
                                <th scope="col" className="p-4">Grade</th>
                                <th scope="col" className="p-4">Subject</th>
                                <th scope="col" className="p-4">Difficulty</th>
                                <th scope="col" className="p-4">Status</th>
                                {user?.role !== 'teacher' && <th scope="col" className="p-4">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.map(q => (
                                <React.Fragment key={q.id}>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <button onClick={() => toggleRowExpansion(q.id)}>
                                                {expandedRows.has(q.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </button>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900 truncate" style={{ maxWidth: '300px' }}>{q.text}</td>
                                        <td className="p-4">{q.grade_name}</td>
                                        <td className="p-4">{q.subject_name}</td>
                                        <td className="p-4">{q.difficulty_name}</td>
                                        <td className="p-4">{getStatusChip(q.status)}</td>
                                        {user?.role !== 'teacher' && (
                                            <td className="p-4 flex items-center gap-2">
                                                <button onClick={() => router.push(`/dashboard/questions/edit/${q.id}`)} className="text-blue-600 hover:text-blue-800 p-1"><Pen size={16}/></button>
                                                <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={16}/></button>
                                                {q.status !== 'approved' && <button onClick={() => handleStatusChange(q.id, 'approved')} className="text-green-600 hover:text-green-800 p-1"><CheckCircle size={16}/></button>}
                                                {q.status !== 'rejected' && <button onClick={() => handleStatusChange(q.id, 'rejected')} className="text-orange-600 hover:text-orange-800 p-1"><XCircle size={16}/></button>}
                                            </td>
                                        )}
                                    </tr>
                                    {expandedRows.has(q.id) && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={user?.role !== 'teacher' ? 7 : 6} className="p-4">
                                                <div className="p-4 bg-white rounded-md border">
                                                    <h4 className="font-bold mb-2">Details:</h4>
                                                    <p className="mb-2"><strong className="font-semibold">Full Text:</strong> {q.text}</p>
                                                    {q.options && <div className="mb-2"><strong className="font-semibold">Options:</strong> <pre>{JSON.stringify(q.options, null, 2)}</pre></div>}
                                                    <p><strong className="font-semibold">Answer:</strong> {q.answer}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default QuestionsPage;

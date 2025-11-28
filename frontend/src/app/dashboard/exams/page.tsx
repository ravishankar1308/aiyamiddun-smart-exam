
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGetExams, apiDeleteExam } from '@/lib/api';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export default function ExamsPage() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const data = await apiGetExams();
            setExams(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch exams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleDelete = async (examId: number) => {
        if (!confirm('Are you sure you want to permanently delete this exam?')) return;
        try {
            await apiDeleteExam(examId);
            fetchExams(); // Re-fetch to update the UI
        } catch (err: any) {
            alert(err.message || "Failed to delete exam.");
        }
    };

    if (loading) return <p>Loading exams...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Exam Management</h1>
                <Link href="/dashboard/exams/new" legacyBehavior>
                    <a className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-600">
                        <Plus size={20} />
                        Create New Exam
                    </a>
                </Link>
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
                        {exams.map((exam: any) => (
                            <tr key={exam.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.subject?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.duration_minutes}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${exam.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {exam.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button title="Publish/Unpublish" className="text-gray-400 hover:text-gray-600 mr-2">
                                        <Eye size={20} />
                                    </button>
                                    <Link href={`/dashboard/exams/edit/${exam.id}`} legacyBehavior>
                                        <a title="Edit" className="text-indigo-600 hover:text-indigo-900 mr-2">
                                            <Edit size={20} />
                                        </a>
                                    </Link>
                                    <button onClick={() => handleDelete(exam.id)} className="text-red-600 hover:text-red-900" title="Delete">
                                        <Trash2 size={20} />
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

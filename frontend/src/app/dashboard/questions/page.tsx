
'use client';

import { useEffect, useState } from 'react';
import { apiGetQuestions, apiGetMetadata, apiToggleQuestionDisable, apiDeleteQuestion } from '@/lib/api';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import QuestionFormModal from '@/components/QuestionFormModal';

export default function QuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [metadata, setMetadata] = useState({ subjects: [], topics: [], subtopics: [], difficulties: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [questionsData, metadataData] = await Promise.all([
                apiGetQuestions(),
                apiGetMetadata()
            ]);
            setQuestions(questionsData);
            setMetadata(metadataData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
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

    const openModal = (question = null) => {
        setSelectedQuestion(question);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedQuestion(null);
        fetchData(); // Refresh data
    };

    if (loading) return <p>Loading questions...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Question Bank</h1>
                <button 
                    onClick={() => openModal()} 
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-600"
                >
                    <Plus size={20} />
                    Add Question
                </button>
            </div>

            {/* Add filters here later */}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {questions.map((q: any) => (
                            <tr key={q.id}>
                                <td className="px-6 py-4 whitespace-pre-wrap text-sm font-medium text-gray-900">{q.question_text}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.topic}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.difficulty}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${q.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {q.disabled ? 'Disabled' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                   <button onClick={() => handleToggleDisable(q.id, q.disabled)} className="text-gray-400 hover:text-gray-600 mr-2" title={q.disabled ? 'Enable' : 'Disable'}>
                                        {q.disabled ? <ToggleLeft size={20}/> : <ToggleRight size={20}/>}
                                    </button>
                                    <button onClick={() => openModal(q)} className="text-indigo-600 hover:text-indigo-900 mr-2" title="Edit">
                                        <Edit size={20} />
                                    </button>
                                    <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-900" title="Delete">
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <QuestionFormModal 
                    question={selectedQuestion} 
                    metadata={metadata}
                    onClose={closeModal} 
                />
            )}
        </div>
    );
}

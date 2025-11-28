
// components/QuestionFormModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiCreateQuestion, apiUpdateQuestion } from '@/lib/api';
import { X, Plus, Trash2 } from 'lucide-react';

export default function QuestionFormModal({ question, metadata, onClose }) {
    const isEditMode = !!question;
    
    const initialFormState = {
        question_text: '',
        subject_id: '',
        topic_id: '',
        subtopic_id: '',
        difficulty: 'medium',
        question_type: 'multiple-choice',
        options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }],
        explanation: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
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
        } else {
            setFormData(initialFormState);
        }
    }, [question, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...formData.options];
        newOptions[index][field] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const handleCorrectOptionChange = (index) => {
        const newOptions = formData.options.map((opt, i) => ({ ...opt, is_correct: i === index }));
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        setFormData({ ...formData, options: [...formData.options, { option_text: '', is_correct: false }] });
    };

    const removeOption = (index) => {
        if (formData.options.length <= 2) return; // Must have at least two options
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: newOptions });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Basic validation
        if (formData.options.filter(opt => opt.is_correct).length !== 1) {
            setError('You must select exactly one correct answer.');
            setLoading(false);
            return;
        }

        try {
            if (isEditMode) {
                await apiUpdateQuestion(question.id, formData);
            } else {
                await apiCreateQuestion(formData);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 overflow-y-auto p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl my-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Question' : 'Add New Question'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Question Text</label>
                        <textarea name="question_text" value={formData.question_text} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg h-24" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Subject</label>
                            <select name="subject_id" value={formData.subject_id} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
                                <option value="">Select Subject</option>
                                {metadata.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-bold mb-2">Topic</label>
                            <select name="topic_id" value={formData.topic_id} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
                                <option value="">Select Topic</option>
                                {metadata.topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-bold mb-2">Difficulty</label>
                            <select name="difficulty" value={formData.difficulty} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
                                {metadata.difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="pt-4">
                        <h3 className="text-lg font-semibold mb-2">Options</h3>
                        <div className="space-y-3">
                        {formData.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                                <input type="radio" name="correct_answer" checked={option.is_correct} onChange={() => handleCorrectOptionChange(index)} className="form-radio h-5 w-5 text-blue-600"/>
                                <input type="text" placeholder={`Option ${index + 1}`} value={option.option_text} onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)} required className="w-full px-3 py-2 border rounded-lg"/>
                                <button type="button" onClick={() => removeOption(index)} disabled={formData.options.length <= 2} className="text-red-500 disabled:text-gray-300 p-1">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        </div>
                        <button type-="button" onClick={addOption} className="mt-3 text-sm text-blue-600 flex items-center gap-1"><Plus size={16}/> Add Option</button>
                    </div>

                     <div>
                        <label className="block text-sm font-bold mb-2">Explanation (Optional)</label>
                        <textarea name="explanation" value={formData.explanation} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg h-20" />
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
        </div>
    );
}

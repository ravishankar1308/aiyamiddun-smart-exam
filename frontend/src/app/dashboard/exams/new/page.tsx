'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiCreateExam, apiGetAllMetadata } from '@/lib/api';

const NewExamPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [gradeId, setGradeId] = useState('');
    const [duration, setDuration] = useState(60);
    const [metadata, setMetadata] = useState({ grades: [], subjects: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        apiGetAllMetadata()
            .then(data => {
                setMetadata(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load necessary data.');
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!gradeId || !subjectId) {
            setError('Please select both a grade and a subject.');
            return;
        }

        try {
            await apiCreateExam({ 
                title, 
                description, 
                subject_id: parseInt(subjectId), 
                grade_id: parseInt(gradeId),
                duration_minutes: duration 
            });
            router.push('/dashboard/exams');
        } catch (err) {
            console.error(err);
            setError('Failed to create exam. Please try again.');
        }
    };

    const availableSubjects = gradeId ? metadata.subjects.filter(s => s.grade_id === parseInt(gradeId)) : [];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Create New Exam</h1>
                <p className="text-gray-500">Fill out the details below to set up a new exam.</p>
            </header>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Exam Title</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
                        <select
                            id="grade"
                            value={gradeId}
                            onChange={e => { setGradeId(e.target.value); setSubjectId(''); }}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a Grade</option>
                            {metadata.grades.map(grade => (
                                <option key={grade.id} value={grade.id}>{grade.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <select
                            id="subject"
                            value={subjectId}
                            onChange={e => setSubjectId(e.target.value)}
                            required
                            disabled={!gradeId}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">Select a Subject</option>
                            {availableSubjects.map(subject => (
                                <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (in minutes)</label>
                        <input
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Create Exam
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewExamPage;

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiGetStudentResults } from '@/lib/api';
import { BarChart2 } from 'lucide-react';

export default function MyResultsPage() {
    const { user } = useAuth();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        apiGetStudentResults(user.id)
            .then(data => {
                setResults(data);
            })
            .catch(err => {
                setError(err.message || 'Failed to fetch results.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user]);

    if (loading) return <p>Loading your results...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <BarChart2 className="h-8 w-8 mr-3 text-blue-600" />
                <h1 className="text-3xl font-bold">My Exam Results</h1>
            </div>

            {results.length === 0 ? (
                <p className="text-center text-gray-500">You have not completed any exams yet.</p>
            ) : (
                <div className="space-y-4">
                    {results.map(result => (
                        <div key={result.id} className="border p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-xl">{result.exam_title}</h2>
                                <p className="text-sm text-gray-500">Submitted on: {new Date(result.submittedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">{result.score} / {result.total_marks}</p>
                                <p className="text-sm">Score</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

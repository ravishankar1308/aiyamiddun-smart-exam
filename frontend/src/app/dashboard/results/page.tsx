'use client';

import { useEffect, useState, useMemo } from 'react';
import { apiGetExams, apiGetExamResults } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, ClipboardCheck, Star } from 'lucide-react';

interface Exam {
    id: string;
    title: string;
}

interface Result {
    student_name: string;
    score: number;
    total_marks: number;
}

// Main component for displaying exam analytics
export default function ResultsDashboardPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all available exams for the dropdown
    useEffect(() => {
        apiGetExams()
            .then(data => {
                setExams(data);
                if (data.length > 0) {
                    setSelectedExamId(data[0].id);
                }
            })
            .catch(err => setError(err.message || 'Failed to fetch exams.'))
            .finally(() => setLoading(false));
    }, []);

    // Fetch results whenever a new exam is selected
    useEffect(() => {
        if (!selectedExamId) return;
        setLoading(true);
        apiGetExamResults(selectedExamId)
            .then(data => setResults(data))
            .catch(err => setError(err.message || 'Failed to fetch results.'))
            .finally(() => setLoading(false));
    }, [selectedExamId]);

    // Memoized calculations for analytics to prevent re-computing on every render
    const analytics = useMemo(() => {
        if (results.length === 0) {
            return { total: 0, average: 0, highest: 0, distribution: [] };
        }

        const total = results.length;
        const totalScore = results.reduce((sum, r) => sum + r.score, 0);
        const average = total > 0 ? (totalScore / total).toFixed(2) : 0;
        const highest = Math.max(...results.map(r => r.score));

        // Create score distribution buckets (e.g., 0-20%, 21-40%, etc.)
        const distribution = Array(5).fill(0).map((_, i) => {
            const min = i * 20;
            const max = (i + 1) * 20;
            const count = results.filter(r => {
                const percentage = (r.score / r.total_marks) * 100;
                return percentage > min && percentage <= max;
            }).length;
            return { name: `${min+1}-${max}%`, count };
        });

        return { total, average, highest, distribution };
    }, [results]);

    if (loading && !results.length) return <p>Loading dashboard...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="bg-gray-50 p-8 rounded-lg shadow-inner">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Results Dashboard</h1>
                <select 
                    value={selectedExamId}
                    onChange={e => setSelectedExamId(e.target.value)}
                    className="p-2 border rounded-lg shadow-sm"
                >
                    {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
                </select>
            </div>

            {results.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No results found for the selected exam.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KpiCard icon={Users} title="Total Participants" value={analytics.total} />
                        <KpiCard icon={ClipboardCheck} title="Average Score" value={analytics.average} />
                        <KpiCard icon={Star} title="Highest Score" value={analytics.highest} />
                    </div>

                    {/* Charts and Leaderboard */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                            <h3 className="font-semibold mb-4">Score Distribution</h3>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analytics.distribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#3b82f6" name="Number of Students" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-semibold mb-4">Leaderboard</h3>
                            <div className="space-y-4 overflow-y-auto h-80">
                                {results.map((r, index) => (
                                    <div key={index} className="flex justify-between items-center border-b pb-2">
                                        <p>{index + 1}. {r.student_name}</p>
                                        <p className="font-bold">{r.score} / {r.total_marks}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper component for KPI cards
function KpiCard({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: string | number }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
                <Icon className="h-6 w-6 text-blue-600" />
            </div>
        </div>
    );
}

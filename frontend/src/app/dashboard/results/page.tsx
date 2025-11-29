'use client';

import { useEffect, useState, useMemo } from 'react';
import { apiGetExams, apiGetResults } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, ClipboardCheck, Star } from 'lucide-react';

export default function ResultsDashboard() {
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [resultsData, examsData] = await Promise.all([
                    apiGetResults(),
                    apiGetExams()
                ]);
                setResults(resultsData);
                setExams(examsData);
            } catch (err) {
                setError('Failed to load dashboard data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const analytics = useMemo(() => {
        if (!results.length) return {
            totalSubmissions: 0,
            averageScore: 0,
            passRate: 0,
            topExams: [],
            recentResults: []
        };

        const totalSubmissions = results.length;
        const totalScore = results.reduce((acc, r) => acc + (r.score / r.total_marks) * 100, 0);
        const averageScore = totalScore / totalSubmissions;
        const passRate = (results.filter(r => (r.score / r.total_marks) * 100 >= 50).length / totalSubmissions) * 100;
        
        const examPerformance = exams.map(exam => {
            const examResults = results.filter(r => r.exam_title === exam.title);
            if(!examResults.length) return null;
            const avg = examResults.reduce((acc, r) => acc + (r.score / r.total_marks) * 100, 0) / examResults.length;
            return { name: exam.title, averageScore: parseFloat(avg.toFixed(2)) };
        }).filter(Boolean);

        return {
            totalSubmissions,
            averageScore: parseFloat(averageScore.toFixed(2)),
            passRate: parseFloat(passRate.toFixed(2)),
            topExams: examPerformance.sort((a,b) => b.averageScore - a.averageScore).slice(0, 5),
            recentResults: results.slice(0, 5)
        }
    }, [results, exams]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Results Dashboard</h1>
                <p className="text-slate-500 mt-1">Analytics and performance overview of all exams.</p>
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <MetricCard icon={ClipboardCheck} title="Total Submissions" value={analytics.totalSubmissions} />
                <MetricCard icon={Star} title="Average Score" value={`${analytics.averageScore}%`} />
                <MetricCard icon={Users} title="Pass Rate" value={`${analytics.passRate}%`} />
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-semibold text-lg text-slate-700 mb-4">Top 5 Exams by Average Score</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.topExams} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%" />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Bar dataKey="averageScore" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-semibold text-lg text-slate-700 mb-4">Recent Submissions</h3>
                    <div className="space-y-4">
                        {analytics.recentResults.map(result => (
                            <div key={result.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold text-sm text-slate-800">{result.student_name}</p>
                                    <p className="text-xs text-slate-500">{result.exam_title}</p>
                                </div>
                                <div className={`text-sm font-bold ${result.score/result.total_marks >= 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.score} / {result.total_marks}
                                </div>
                            </div>
                        ))}
                         {analytics.recentResults.length === 0 && <p className='text-sm text-slate-500 text-center py-4'>No recent submissions found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

const MetricCard = ({ icon: Icon, title, value }) => (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-5">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);
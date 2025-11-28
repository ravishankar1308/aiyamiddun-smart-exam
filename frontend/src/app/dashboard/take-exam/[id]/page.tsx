'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGetExam, apiSubmitExam } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Clock, Send } from 'lucide-react';

export default function TakeExamPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const examId = params.id as string;

    const [exam, setExam] = useState<any>(null);
    const [answers, setAnswers] = useState<{ [key: number]: any }>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch the exam data once
    useEffect(() => {
        if (!examId) return;
        apiGetExam(examId)
            .then(data => {
                const now = new Date().getTime();
                const startTime = new Date(data.start_time).getTime();
                const endTime = new Date(data.end_time).getTime();

                if (now < startTime) {
                    setError('This exam has not started yet.');
                } else if (now > endTime) {
                    setError('This exam has expired.');
                } else {
                    setExam(data);
                    const durationInSeconds = (data.duration_minutes || 0) * 60;
                    setTimeLeft(durationInSeconds);
                }
            })
            .catch(err => setError(err.message || 'Failed to load exam.'))
            .finally(() => setLoading(false));
    }, [examId]);

    // Countdown timer logic
    useEffect(() => {
        if (timeLeft <= 0 || !exam) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        if (timeLeft === 1) { // Auto-submit when timer hits zero
            handleSubmit();
        }

        return () => clearInterval(timer);
    }, [timeLeft, exam]);

    const handleAnswerChange = (questionId: number, answer: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = useCallback(async () => {
        if (!user || !examId) return;
        setLoading(true);
        setError(null);
        try {
            await apiSubmitExam(examId, user.id, answers);
            router.push(`/dashboard/my-results`); // Redirect to results page after submission
        } catch (err: any) {
            setError(err.message || 'Failed to submit answers.');
        } finally {
            setLoading(false);
        }
    }, [user, examId, answers, router]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    if (loading) return <p>Loading Exam...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!exam) return <p>No exam found.</p>;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white p-4 mb-8 border-b z-10">
                <h1 className="text-3xl font-bold">{exam.title}</h1>
                <p className="text-gray-600">{exam.description}</p>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-red-500 font-bold text-lg">
                        <Clock className="mr-2" />
                        <span>Time Left: {formatTime(timeLeft)}</span>
                    </div>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        <Send size={18} />
                        Submit Exam
                    </button>
                </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-8 px-4">
                {exam.questions.map((q: any, index: number) => (
                    <div key={q.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Question {index + 1}</h3>
                        <p className="text-gray-800 mb-4 whitespace-pre-wrap">{q.question_text}</p>
                        
                        {/* MCQ Options */}
                        {q.question_type === 'mcq' && (
                            <div className="space-y-2">
                                {q.options.map((opt: any, optIndex: number) => (
                                    <label key={optIndex} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name={`question-${q.id}`} 
                                            value={opt.option_text}
                                            checked={answers[q.id] === opt.option_text}
                                            onChange={() => handleAnswerChange(q.id, opt.option_text)}
                                            className="h-5 w-5 mr-3"
                                        />
                                        <span>{opt.option_text}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Essay Input */}
                        {q.question_type === 'essay' && (
                            <textarea 
                                value={answers[q.id] || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                className="w-full p-2 border rounded-md h-32"
                                placeholder="Type your answer here..."
                            />
                        )}
                         {/* Add other question types like multiple_answer here */}
                    </div>
                ))}
            </div>
             <div className="flex justify-end mt-8 px-4">
                 <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="bg-green-600 text-white py-3 px-8 rounded-lg flex items-center gap-2 text-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                    <Send size={20} />
                    Final Submit
                </button>
            </div>
        </div>
    );
}

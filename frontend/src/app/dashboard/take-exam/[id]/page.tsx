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
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!examId) return;
        apiGetExam(examId)
            .then(data => {
                const now = new Date().getTime();
                const startTime = data.scheduledStart ? new Date(data.scheduledStart).getTime() : 0;
                const endTime = data.scheduledEnd ? new Date(data.scheduledEnd).getTime() : Infinity;

                if (startTime && now < startTime) {
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

    useEffect(() => {
        if (timeLeft <= 0 || !exam) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        if (timeLeft === 1) {
            handleSubmit();
        }

        return () => clearInterval(timer);
    }, [timeLeft, exam]);

    const handleAnswerChange = (questionId: number, answer: any, questionType: string) => {
        setAnswers(prev => {
            const newAnswers = { ...prev };
            if (questionType === 'multiple_answer') {
                const existing = prev[questionId] || [];
                if (existing.includes(answer)) {
                    newAnswers[questionId] = existing.filter((a: any) => a !== answer);
                } else {
                    newAnswers[questionId] = [...existing, answer];
                }
            } else {
                newAnswers[questionId] = answer;
            }
            return newAnswers;
        });
    };

    const handleSubmit = useCallback(async () => {
        if (!user || !examId) return;
        setLoading(true);
        setError(null);
        try {
            // The user ID should be a number, ensure it is before sending
            const studentId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
            if (isNaN(studentId)) {
                throw new Error("Invalid user ID.");
            }
            await apiSubmitExam(examId, studentId, answers);
            router.push(`/dashboard/my-results`); 
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

    if (loading) return <div className="p-8 text-center">Loading Exam...</div>;
    if (error) return <p className="text-red-500 p-8 text-center">Error: {error}</p>;
    if (!exam) return <p className="p-8 text-center">No exam found.</p>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="sticky top-0 bg-white p-4 mb-8 border-b z-10">
                <h1 className="text-3xl font-bold">{exam.title}</h1>
                <p className="text-gray-600">{exam.description}</p>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-red-500 font-bold text-lg">
                        <Clock className="mr-2" />
                        <span>Time Left: {formatTime(timeLeft)}</span>
                    </div>
                    <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white py-2 px-6 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:bg-gray-400">
                        <Send size={18} />
                        Submit Exam
                    </button>
                </div>
            </div>

            <div className="space-y-8 px-4">
                {exam.questions.map((q: any, index: number) => (
                    <div key={q.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-lg font-semibold mb-2">Question {index + 1}</h3>
                        <p className="text-gray-800 mb-4 whitespace-pre-wrap">{q.text || q.question_text}</p>
                        
                        {q.question_type === 'mcq' && (
                            <div className="space-y-2">
                                {q.options.map((opt: any, optIndex: number) => (
                                    <label key={optIndex} className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${answers[q.id] === opt.option_text ? 'bg-blue-50 border-blue-300' : ''}`}>
                                        <input type="radio" name={`question-${q.id}`} value={opt.option_text} checked={answers[q.id] === opt.option_text} onChange={() => handleAnswerChange(q.id, opt.option_text, 'mcq')} className="h-5 w-5 mr-3"/>
                                        <span>{opt.option_text}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.question_type === 'multiple_answer' && (
                            <div className="space-y-2">
                                {q.options.map((opt: any, optIndex: number) => (
                                    <label key={optIndex} className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${(answers[q.id] || []).includes(opt.option_text) ? 'bg-green-50 border-green-300' : ''}`}>
                                        <input type="checkbox" name={`question-${q.id}`} value={opt.option_text} checked={(answers[q.id] || []).includes(opt.option_text)} onChange={() => handleAnswerChange(q.id, opt.option_text, 'multiple_answer')} className="h-5 w-5 mr-3 rounded"/>
                                        <span>{opt.option_text}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.question_type === 'essay' && (
                            <textarea value={answers[q.id] || ''} onChange={(e) => handleAnswerChange(q.id, e.target.value, 'essay')} className="w-full p-2 border rounded-md h-32" placeholder="Type your answer here..."/>
                        )}
                    </div>
                ))}
            </div>

             <div className="flex justify-end mt-8 px-4">
                 <button onClick={handleSubmit} disabled={loading} className="bg-green-600 text-white py-3 px-8 rounded-lg flex items-center gap-2 text-lg hover:bg-green-700 disabled:bg-gray-400">
                    <Send size={20} />
                    Final Submit
                </button>
            </div>
        </div>
    );
}

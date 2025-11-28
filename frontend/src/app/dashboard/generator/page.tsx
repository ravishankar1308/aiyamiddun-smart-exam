// frontend/src/app/dashboard/generator/page.tsx

'use client';

import React, { useState } from 'react';
import { BrainCircuit, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { apiGenerateQuestions } from '@/lib/api';

export default function AiGeneratorPage() {
    const [topic, setTopic] = useState('arithmetic');
    const [difficulty, setDifficulty] = useState('simple');
    const [count, setCount] = useState(10);
    const [generatedBatch, setGeneratedBatch] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setGeneratedBatch([]);
        try {
            const questions = await apiGenerateQuestions(topic, difficulty, count);
            setGeneratedBatch(questions);
        } catch (err: any) { 
            setError(err.message || 'Failed to generate questions.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBatch = async () => {
        // This part needs to be connected to your question saving logic
        // For now, it will just log the questions to the console
        console.log("Saving batch:", generatedBatch);
        alert("Batch saved to console!");
        setGeneratedBatch([]);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                    <BrainCircuit className="text-purple-600" /> AI Question Generator
                </h2>
                <p className="text-slate-500">Generate questions using generative AI.</p>
            </header>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <select value={topic} onChange={e => setTopic(e.target.value)} className="p-2 border rounded">
                        <option value="arithmetic">Arithmetic</option>
                        <option value="algebra">Algebra</option>
                        <option value="calculus">Calculus</option>
                        <option value="geometry">Geometry</option>
                    </select>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="p-2 border rounded">
                        <option value="simple">Simple</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    <input 
                        type="number" 
                        value={count} 
                        onChange={e => setCount(Number(e.target.value))} 
                        className="p-2 border rounded" 
                        min="1" 
                        max="20"
                    />
                </div>
                <button 
                    onClick={handleGenerate} 
                    disabled={loading} 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : 'Generate Questions'}
                </button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

            {generatedBatch.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700">Generated Questions ({generatedBatch.length})</h3>
                        <div>
                            <button onClick={handleSaveBatch} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mr-2">
                                <Plus size={16}/> Save to Bank
                            </button>
                            <button onClick={() => setGeneratedBatch([])} className="text-red-500 hover:text-red-700 text-sm font-medium">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                        {generatedBatch.map((q, i) => (
                            <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="font-semibold text-slate-800 mb-2">{i + 1}. {q.text}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {q.options.map((opt, idx) => (
                                        <div key={idx} className={`p-2 rounded ${q.answer === opt ? 'bg-green-100 text-green-800 border-green-200' : 'bg-slate-100'}`}>
                                            <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGetMetadata, apiGetQuestions, apiGetExam, apiUpdateExam, Question, Subject, FullExam } from '@/lib/api';
import { Save, Printer, BrainCircuit, RefreshCw, ArrowUp, ArrowDown, X, FileText, Calendar } from 'lucide-react';

interface MetadataItem {
    id: string;
    name: string;
}

interface Section extends MetadataItem {
    subject: string;
}

export default function EditExamPage() {
    const [examConfig, setExamConfig] = useState({
        title: '',
        duration: 60,
        classLevel: '',
        subject: '',
        sections: [] as string[],
        sectionScopes: {} as Record<string, number>,
        types: [] as string[],
        typeCounts: {} as Record<string, number>,
        difficulty: '',
        scheduledStart: '',
        scheduledEnd: '',
    });
    const [examDraft, setExamDraft] = useState<Question[]>([]);
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
    const [activeGrades, setActiveGrades] = useState<MetadataItem[]>([]);
    const [activeQTypes, setActiveQTypes] = useState<MetadataItem[]>([]);
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const [allSections, setAllSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const role = 'admin';

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [grades, subjects, sections, qTypes, questions, examData] = await Promise.all([
                    apiGetMetadata<MetadataItem>('grades'),
                    apiGetMetadata<Subject>('subjects'),
                    apiGetMetadata<Section>('sections'),
                    apiGetMetadata<MetadataItem>('questionTypes'),
                    apiGetQuestions(),
                    apiGetExam(id)
                ]);

                setActiveGrades(grades);
                setAllSubjects(subjects);
                setAllSections(sections);
                setActiveQTypes(qTypes);

                const parsedQuestions = questions.map(q => 
                    q.options && typeof q.options === 'string' ? { ...q, options: JSON.parse(q.options) } : { ...q, options: q.options || [] }
                );
                setAvailableQuestions(parsedQuestions);

                if (examData) {
                    const subjectName = subjects.find(s => s.id === String(examData.subject_id))?.name || '';
                    const questionTypesInExam = [...new Set(examData.questions.map(q => q.category))];
                    const typeCounts = examData.questions.reduce((acc, q) => {
                        acc[q.category] = (acc[q.category] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>);

                    setExamConfig({
                        title: examData.title,
                        duration: examData.duration_minutes,
                        classLevel: examData.classLevel || '',
                        subject: subjectName,
                        sections: [...new Set(examData.questions.map(q => q.section).filter(Boolean))] as string[],
                        sectionScopes: {}, // Note: This would be complex to reconstruct
                        types: questionTypesInExam,
                        typeCounts: typeCounts,
                        difficulty: examData.difficulty || '',
                        scheduledStart: examData.scheduledStart ? new Date(examData.scheduledStart).toISOString().slice(0, 16) : '',
                        scheduledEnd: examData.scheduledEnd ? new Date(examData.scheduledEnd).toISOString().slice(0, 16) : '',
                    });

                    const examQuestions = examData.questions.map(q => 
                        q.options && typeof q.options === 'string' ? { ...q, options: JSON.parse(q.options) } : { ...q, options: q.options || [] }
                    );
                    setExamDraft(examQuestions);
                }

            } catch (err: any) {
                setError(err.message || 'Failed to load exam data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    const builderAvailableSubjects = allSubjects.filter(s => s.grade === examConfig.classLevel);
    const builderAvailableSections = allSections.filter(s => s.subject === examConfig.subject);

    const calculateSectionTotal = () => {
        return Object.values(examConfig.sectionScopes).reduce((sum, val) => sum + val, 0);
    };

    const handleGenerateDraft = () => {
        const totalQuestionsNeeded = Object.values(examConfig.typeCounts).reduce((sum, val) => sum + val, 0);
        if (totalQuestionsNeeded === 0) {
            alert("Please select question types and specify quantities.");
            return;
        }
        let mutablePool = availableQuestions.filter(q => {
            const subjectMatch = !examConfig.subject || q.subject === examConfig.subject;
            const difficultyMatch = !examConfig.difficulty || q.difficulty === examConfig.difficulty;
            const sectionMatch = examConfig.sections.length === 0 || examConfig.sections.includes(q.section || '');
            return subjectMatch && difficultyMatch && sectionMatch;
        });
        mutablePool.sort(() => 0.5 - Math.random());
        const draft: Question[] = [];
        const typesToPick = [...examConfig.types];
        typesToPick.forEach(type => {
            const countNeeded = examConfig.typeCounts[type] || 0;
            let foundCount = 0;
            const nextPool: Question[] = [];
            for (const question of mutablePool) {
                if (question.category === type && foundCount < countNeeded) {
                    draft.push(question);
                    foundCount++;
                } else {
                    nextPool.push(question);
                }
            }
            if (foundCount < countNeeded) {
                alert(`Warning: Only found ${foundCount} of ${countNeeded} desired '${type}' questions matching criteria.`);
            }
            mutablePool = nextPool;
        });
        setExamDraft(draft.sort(() => 0.5 - Math.random()));
    };

    const handleUpdateExam = async () => {
        if (examDraft.length === 0) {
            alert("Cannot save an empty exam.");
            return;
        }
        setLoading(true);
        try {
            const examData = {
                title: examConfig.title,
                description: `An exam for ${examConfig.classLevel} in ${examConfig.subject}.`,
                subject_id: allSubjects.find(s => s.name === examConfig.subject)?.id || '',
                duration_minutes: examConfig.duration,
                question_ids: examDraft.map(q => q.id),
                classLevel: examConfig.classLevel,
                difficulty: examConfig.difficulty,
                scheduledStart: examConfig.scheduledStart ? new Date(examConfig.scheduledStart).toISOString() : undefined,
                scheduledEnd: examConfig.scheduledEnd ? new Date(examConfig.scheduledEnd).toISOString() : undefined,
                isQuiz: !!examConfig.scheduledStart,
            };
            await apiUpdateExam(id, examData);
            alert("Exam updated successfully!");
            router.push('/dashboard/exams');
        } catch (err: any) {
            setError(err.message || 'Failed to update exam.');
            alert(`Error: ${err.message || 'Failed to update exam.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReplaceQuestion = (questionId: number) => {
        const questionToReplace = examDraft.find(q => q.id === questionId);
        if (!questionToReplace) return;

        const pool = availableQuestions.filter(q => 
            q.id !== questionId &&
            !examDraft.some(d => d.id === q.id) &&
            q.section === questionToReplace.section
        );

        if (pool.length > 0) {
            const newQuestion = pool[Math.floor(Math.random() * pool.length)];
            setExamDraft(examDraft.map(q => q.id === questionId ? newQuestion : q));
        } else {
            alert(`No more replacement questions available for section: ${questionToReplace.section}`);
        }
    };

    const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const newDraft = [...examDraft];
            [newDraft[index - 1], newDraft[index]] = [newDraft[index], newDraft[index - 1]];
            setExamDraft(newDraft);
        }
        if (direction === 'down' && index < examDraft.length - 1) {
            const newDraft = [...examDraft];
            [newDraft[index + 1], newDraft[index]] = [newDraft[index], newDraft[index + 1]];
            setExamDraft(newDraft);
        }
    };

    const handleRemoveQuestionFromDraft = (questionId: number) => {
        setExamDraft(examDraft.filter(q => q.id !== questionId));
    };

    if (loading) return <p>Loading exam editor...</p>;
    if (error) return <p className="text-red-500 p-8">Error: {error}</p>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Exam</h2>
             <div className="grid lg:grid-cols-3 gap-8 print:block">
                <div className="lg:col-span-1 space-y-6 print:hidden">
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-bold text-slate-700 border-b pb-2">1. Configuration</h3>
                      <div><label htmlFor="examTitle" className="text-xs font-bold text-slate-500 uppercase block mb-1">Exam Title</label><input id="examTitle" type="text" value={examConfig.title} onChange={e => setExamConfig({...examConfig, title: e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="e.g. Mid-Term 2024"/></div>
                      <div className="bg-blue-50 p-3 rounded border border-blue-100"><p className="text-xs font-bold text-blue-700 uppercase mb-2 flex items-center gap-1"><Calendar size={12}/> Quiz Schedule (Optional)</p><div className="grid grid-cols-1 gap-2 mb-2"><div><label htmlFor="scheduledStart" className="text-[10px] font-bold text-slate-500 uppercase">Start Time</label><input id="scheduledStart" type="datetime-local" value={examConfig.scheduledStart} onChange={e => setExamConfig({...examConfig, scheduledStart: e.target.value})} className="w-full p-1.5 border rounded text-xs"/></div><div><label htmlFor="scheduledEnd" className="text-[10px] font-bold text-slate-500 uppercase">End Time</label><input id="scheduledEnd" type="datetime-local" value={examConfig.scheduledEnd} onChange={e => setExamConfig({...examConfig, scheduledEnd: e.target.value})} className="w-full p-1.5 border rounded text-xs"/></div></div><p className="text-[10px] text-slate-400 italic">Set dates to enable Quiz Mode for students.</p></div>
                      <div><label htmlFor="duration" className="text-xs font-bold text-slate-500 uppercase block mb-1">Duration (Mins)</label><input id="duration" type="number" value={examConfig.duration} onChange={e => setExamConfig({...examConfig, duration: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded text-sm" placeholder="60"/></div>
                      <div className="grid grid-cols-2 gap-3">
                         <div><label htmlFor="classLevel" className="text-xs font-bold text-slate-500 uppercase block mb-1">Class</label><select id="classLevel" value={examConfig.classLevel} onChange={e => setExamConfig({...examConfig, classLevel: e.target.value, subject: '', sections: [], sectionScopes: {}})} className="w-full p-2 border rounded text-sm"><option value="">Select</option>{activeGrades.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}</select></div>
                         <div><label htmlFor="subject" className="text-xs font-bold text-slate-500 uppercase block mb-1">Subject</label><select id="subject" value={examConfig.subject} onChange={e => setExamConfig({...examConfig, subject: e.target.value, sections: [], sectionScopes: {}})} className="w-full p-2 border rounded text-sm" disabled={!examConfig.classLevel}><option value="">Select</option>{builderAvailableSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}</select></div>
                      </div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Sections</label><div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">{builderAvailableSections.map(sec => { const isChecked = examConfig.sections.includes(sec.name); return (<div key={sec.id} className={`flex items-center justify-between p-2 rounded ${isChecked ? 'bg-blue-50' : ''}`}><label className="flex items-center gap-2 text-sm cursor-pointer flex-1"><input type="checkbox" checked={isChecked} onChange={e => { let newSecs = e.target.checked ? [...examConfig.sections, sec.name] : examConfig.sections.filter(s => s !== sec.name); const newScopes = {}; const split = newSecs.length > 0 ? Math.floor(100 / newSecs.length) : 0; newSecs.forEach((s, i) => { newScopes[s] = split + (i === 0 ? (100 % newSecs.length) : 0); }); setExamConfig({...examConfig, sections: newSecs, sectionScopes: newScopes}); }} />{sec.name}</label>{isChecked && (<div className="flex items-center gap-1 w-16"><input type="number" min="0" max="100" value={examConfig.sectionScopes[sec.name]} onChange={e => { const val = parseInt(e.target.value) || 0; setExamConfig({ ...examConfig, sectionScopes: { ...examConfig.sectionScopes, [sec.name]: val } }); }} className="w-full p-1 text-xs border rounded text-center outline-none" /><span className="text-xs text-slate-400">%</span></div>)}</div>); })}</div><div className="flex justify-end mt-1"><span className={`text-xs font-bold ${calculateSectionTotal() !== 100 ? 'text-red-500' : 'text-green-600'}`}>Total Scope: {calculateSectionTotal()}%</span></div></div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase block mb-2">Distribution</label><div className="space-y-2 border rounded p-2 max-h-48 overflow-y-auto">{activeQTypes.map(qt => { const isSelected = examConfig.types.includes(qt.name); return (<div key={qt.id} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100"><label className="flex items-center gap-2 text-sm cursor-pointer flex-1"><input type="checkbox" checked={isSelected} onChange={e => { const newTypes = e.target.checked ? [...examConfig.types, qt.name] : examConfig.types.filter(t => t !== qt.name); const newCounts = { ...examConfig.typeCounts }; if (e.target.checked && !newCounts[qt.name]) newCounts[qt.name] = 5; setExamConfig({...examConfig, types: newTypes, typeCounts: newCounts}); }} />{qt.name}</label>{isSelected && (<div className="flex items-center gap-1"><span className="text-xs text-slate-400">Qty:</span><input type="number" min="1" max="100" value={examConfig.typeCounts[qt.name] || ''} onChange={e => { const val = parseInt(e.target.value) || 0; setExamConfig({...examConfig, typeCounts: { ...examConfig.typeCounts, [qt.name]: val }}); }} className="w-16 p-1 text-sm border rounded outline-none text-center" /></div>)}</div>); })}</div></div>
                      <div><label htmlFor="difficulty" className="text-xs font-bold text-slate-500 uppercase block mb-1">Difficulty</label><select id="difficulty" value={examConfig.difficulty} onChange={e => setExamConfig({...examConfig, difficulty: e.target.value})} className="w-full p-2 border rounded text-sm"><option value="">Any</option><option value="simple">Simple</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
                      <button onClick={handleGenerateDraft} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md"><BrainCircuit size={18}/> Regenerate Draft</button>
                   </div>
                </div>
                <div className="lg:col-span-2 relative">
                   {examDraft.length > 0 && (<div className="mb-4 flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm print:hidden sticky top-0 z-10"><div className="flex gap-2 items-center"><span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{examDraft.length} Questions</span></div><div className="flex gap-2">{(role === 'admin' || role === 'owner') && (<button onClick={handleUpdateExam} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"><Save size={16}/> Update Exam</button>)}<button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"><Printer size={16}/> Print</button></div></div>)}
                   <div className="bg-white shadow-2xl mx-auto p-12 min-h-[1123px] w-full max-w-[794px] print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0 print:absolute print:top-0 print:left-0">
                      {examDraft.length === 0 ? (<div className="h-96 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-xl"><FileText size={48} className="mb-4"/><p>No questions in the draft. Adjust criteria and generate a new draft.</p></div>) : (<><div className="border-b-2 border-black pb-6 mb-8"><h1 className="text-4xl font-serif font-bold tracking-tight text-center mb-4">{examConfig.title || "Examination"}</h1><div className="flex justify-between gap-8 font-serif text-sm"><div><span className="font-bold">Subject:</span> {examConfig.subject}</div><div><span className="font-bold">Class:</span> {examConfig.classLevel}</div><div><span className="font-bold">Time:</span> {examConfig.duration ? `${examConfig.duration} mins` : '_______'}</div></div><div className="mt-4 flex justify-between gap-8 font-serif border-t pt-4"><div className="flex-1 border-b border-black border-dashed pb-1"><span className="font-bold mr-2">Name:</span></div><div className="w-32 border-b border-black border-dashed pb-1"><span className="font-bold mr-2">Score:</span></div></div></div><div className="space-y-8 font-serif">{examDraft.map((q, idx) => (<div key={q.id} className="break-inside-avoid relative group"><div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 print:hidden"><button onClick={() => handleReplaceQuestion(q.id)} className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 shadow-sm" title={`Replace (Same Section: ${q.section})`}><RefreshCw size={14}/></button><button onClick={() => handleMoveQuestion(idx, 'up')} className="p-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 shadow-sm" title="Move Up"><ArrowUp size={14}/></button><button onClick={() => handleMoveQuestion(idx, 'down')} className="p-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 shadow-sm" title="Move Down"><ArrowDown size={14}/></button><button onClick={() => handleRemoveQuestionFromDraft(q.id)} className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow-sm" title="Remove Question"><X size={14}/></button></div><div className="flex gap-3"><span className="font-bold text-lg">{idx + 1}.</span><div className="flex-1"><p className="text-lg mb-3 leading-snug whitespace-pre-wrap">{q.text}</p>{q.imageUrl && <img src={q.imageUrl} alt="Diagram" className="max-h-40 max-w-full border border-slate-300 mb-4" />}{q.options && q.options.length > 0 ? (<div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-2">{q.options.map((opt, i) => (<div key={i} className="flex gap-2"><span className="font-bold">{String.fromCharCode(65 + i)}.</span><span>{opt}</span></div>))}</div>) : (<div className="h-12 border-b border-slate-200 mb-2"></div>)}<div className="text-xs text-slate-400 text-right print:hidden">[{q.marks} Marks] [{q.section}]</div></div></div></div>))}</div></>)}
                   </div>
                </div>
             </div>
        </div>
    );
}

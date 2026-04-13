'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Trash2, Database, ListPlus, Wand2, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { setQuestions, setGeneration, deleteQuestion } from '@/src/store/slice/dataSlice';
import { generateRandomStats } from '@/src/helpers/generator';

const Input = ({ label, name, control, placeholder, type = "text" }) => (
  <div className="space-y-1.5">
    {label && <label className="section-label block">{label}</label>}
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <input 
          {...field}
          type={type}
          placeholder={placeholder}
          className="premium-input w-full"
        />
      )}
    />
  </div>
);

const TextArea = ({ label, name, control, placeholder }) => (
  <div className="space-y-1.5">
    {label && <label className="section-label block">{label}</label>}
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <textarea 
          {...field}
          placeholder={placeholder}
          rows={3}
          className="premium-input w-full resize-none"
        />
      )}
    />
  </div>
);

export default function Home() {
  const dispatch = useDispatch();
  const questions = useSelector((state) => state.data.questions);
  const generation = useSelector((state) => state.data.generation);
  const prefix = [{ title: "Full Name" }, { title: "Email" }, { title: "Please specify your gender" }];

  const { control: qControl, handleSubmit: handleQSubmit, reset: resetQ } = useForm({
    defaultValues: { title: '', choices: '' }
  });

  const { control: gControl, handleSubmit: handleGSubmit } = useForm({
    defaultValues: { count: 20 }
  });

  const onAddQuestion = (data) => {
    if (!data.title || !data.choices) return;
    const formattedData = {
      title: data.title,
      choices: data.choices.split('\n').map(c => c.trim()).filter(Boolean)
    };
    dispatch(setQuestions(formattedData));
    resetQ();
  };

  const onGenerate = (data) => {
    dispatch(setGeneration(generateRandomStats(questions, Number(data.count))));
  };

  const handleDownload = () => {
    const csvRows = [];
    csvRows.push([...prefix, ...questions].map(q => q.title).join(','));
    generation.forEach(row => csvRows.push(row.join(',')));
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#050505]">
      {/* Left Sidebar: Configuration */}
      <aside className="w-80 border-r border-white/5 flex flex-col shrink-0 bg-black/40 backdrop-blur-xl">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-serif italic text-white/80">Design Schema</h2>
          <p className="text-[11px] text-white/30 uppercase tracking-tighter mt-1 font-sans">Define your survey structure</p>
        </div>
        
        <div className="flex-grow overflow-y-auto p-5 space-y-8">
          {/* New Question Form */}
          <div className="space-y-4">
            <h3 className="section-label">Add Field</h3>
            <form onSubmit={handleQSubmit(onAddQuestion)} className="space-y-4">
              <Input label="Title" name="title" control={qControl} placeholder="Enter question..." />
              <TextArea label="Choices" name="choices" control={qControl} placeholder="Option 1&#10;Option 2" />
              <button type="submit" className="premium-button w-full flex items-center justify-center gap-2">
                <Plus size={14} />
                <span>Add Question</span>
              </button>
            </form>
          </div>

          {/* Configuration List */}
          <div className="space-y-4">
            <h3 className="section-label">Schema Preview</h3>
            <div className="space-y-2">
              {[...prefix, ...questions].map((q, idx) => (
                <motion.div 
                  layout
                  key={idx}
                  className="group flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 transition-colors hover:border-white/10"
                >
                  <span className="text-xs truncate max-w-[180px] text-white/70">{q.title}</span>
                  {idx >= prefix.length ? (
                    <button 
                      onClick={() => dispatch(deleteQuestion(idx - prefix.length))}
                      className="text-white/20 hover:text-white transition-colors"
                    >
                      <X size={12} />
                    </button>
                  ) : (
                    <span className="text-[9px] text-white/10 font-mono uppercase">Fixed</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="p-5 border-t border-white/5 bg-black/60">
          <form onSubmit={handleGSubmit(onGenerate)} className="flex gap-2">
            <div className="flex-grow">
              <Input name="count" control={gControl} type="number" placeholder="Count" />
            </div>
            <button type="submit" className="premium-button px-3">
              <Wand2 size={16} />
            </button>
          </form>
        </div>
      </aside>

      {/* Right Side: Results */}
      <main className="flex-grow flex flex-col min-w-0 bg-black">
        <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Database className="text-white/40" size={16} />
            <span className="text-sm font-medium text-white/70">Generated Results</span>
            {generation.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/40 uppercase font-mono">
                {generation.length} Rows
              </span>
            )}
          </div>
          {generation.length > 0 && (
            <button 
              onClick={handleDownload}
              className="secondary-button !py-1.5 !px-3 flex items-center gap-2"
            >
              <Download size={14} />
              <span className="text-xs">Export CSV</span>
            </button>
          )}
        </div>

        <div className="flex-grow overflow-auto p-6">
          {generation.length > 0 ? (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] leading-tight">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr>
                      {[...prefix, ...questions].map((q, i) => (
                        <th key={i} className="px-4 py-3 font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">
                          {q.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {generation.map((row, i) => (
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        key={i} 
                        className="hover:bg-white/[0.01] transition-colors"
                      >
                        {row.map((val, j) => (
                          <td key={j} className="px-4 py-3 text-white/60 whitespace-nowrap">
                            {val}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-4 grayscale opacity-40">
              <Database size={48} strokeWidth={1} />
              <div className="text-center">
                <h3 className="font-serif italic text-lg text-white/80">No data generated yet</h3>
                <p className="text-xs text-white/40 mt-1">Configure your schema on the left to begin.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

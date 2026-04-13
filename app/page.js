'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Trash2, Database, ListPlus, Wand2, X, FileSpreadsheet, Layers, GripVertical, Copy, Check, RotateCcw, Share2, Link as LinkIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { setQuestions, updateQuestion, deleteQuestion, setGeneration, reorderQuestions, setCount, setBulkSchema } from '@/src/store/slice/dataSlice';
import { generateRandomStats } from '@/src/helpers/generator';
import * as XLSX from 'xlsx';

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper Components
const Input = ({ label, name, control, placeholder, type = "text", onChange: customOnChange }) => (
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
          onChange={(e) => {
            field.onChange(e);
            if (customOnChange) customOnChange(e.target.value);
          }}
        />
      )}
    />
  </div>
);

const Select = ({ label, name, control, options }) => (
  <div className="space-y-1.5">
    {label && <label className="section-label block">{label}</label>}
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <select 
          {...field}
          className="premium-input w-full appearance-none bg-white/[0.02] cursor-pointer"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#111]">{opt.label}</option>
          ))}
        </select>
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

const SortableHeader = ({ q }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.5 : 1 };
  return (
    <th ref={setNodeRef} style={style} className="px-4 py-3 font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap relative group">
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-white/10 group-hover:text-white/30 transition-colors"><GripVertical size={12} /></div>
        {q.title}
      </div>
    </th>
  );
};

const SortableSchemaItem = ({ q, index, onDelete, onEdit, isEditing }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.5 : 1 };
  return (
    <motion.div ref={setNodeRef} style={style} layout className={`group flex items-center justify-between p-2 rounded-lg transition-all border ${isEditing ? 'bg-white/10 border-white/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
      <div className="flex items-center gap-2 min-w-0 flex-grow cursor-pointer" onClick={() => onEdit(index)}>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-white/10 group-hover:text-white/30 transition-colors"><GripVertical size={12} /></div>
        <span className="text-[10px] text-white/20 font-mono flex-shrink-0 uppercase">{q.type === 'number' ? '#' : q.type === 'auto_number' ? 'SN' : q.type === 'name' ? 'NM' : q.type === 'email' ? '@' : 'ABC'}</span>
        <span className="text-xs truncate text-white/70">{q.title}</span>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(index); }} className="text-white/20 hover:text-white transition-colors ml-2"><X size={12} /></button>
    </motion.div>
  );
};

function HomeContent() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const questions = useSelector((state) => state.data.questions);
  const generation = useSelector((state) => state.data.generation);
  const rowCount = useSelector((state) => state.data.count);
  
  const [editingIndex, setEditingIndex] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { control: qControl, handleSubmit: handleQSubmit, reset: resetQ, watch: watchQ } = useForm({
    defaultValues: { type: 'choices', title: '', choices: '', min: 0, max: 100, multiplier: 1, prefix: '' }
  });

  const selectedType = watchQ('type');

  const { control: gControl, setValue: setGValue } = useForm({
    defaultValues: { count: rowCount }
  });

  // Handle URL Parameters on Mount
  useEffect(() => {
    const s = searchParams.get('s');
    const c = searchParams.get('c');
    
    if (s || c) {
      try {
        let decodedQuestions = null;
        if (s) {
          const jsonStr = atob(decodeURIComponent(s));
          decodedQuestions = JSON.parse(jsonStr);
        }
        
        dispatch(setBulkSchema({
          questions: decodedQuestions,
          count: c ? Number(c) : rowCount
        }));
        
        if (c) setGValue('count', Number(c));
      } catch (e) {
        console.error("Failed to parse shared configuration", e);
      }
    }
  }, []);

  // Reactive Generation Lifecycle
  useEffect(() => {
    if (questions.length > 0) {
      const gData = generateRandomStats(questions, rowCount);
      dispatch(setGeneration(gData));
    }
  }, [questions, rowCount, dispatch]);

  const onAddOrUpdateField = (data) => {
    if (!data.title) return;
    
    let field = { title: data.title, type: data.type };
    if (data.type === 'choices') field.choices = data.choices.split('\n').map(c => c.trim()).filter(Boolean);
    else if (data.type === 'number') { field.min = data.min; field.max = data.max; field.multiplier = data.multiplier; }
    else if (data.type === 'auto_number') field.prefix = data.prefix;

    if (editingIndex !== null) {
      dispatch(updateQuestion({ index: editingIndex, data: field }));
      setEditingIndex(null);
    } else {
      dispatch(setQuestions(field));
    }
    resetQ({ type: 'choices', title: '', choices: '', min: 0, max: 100, multiplier: 1, prefix: '' });
  };

  const startEditing = (index) => {
    const field = questions[index];
    setEditingIndex(index);
    resetQ({
      type: field.type,
      title: field.title,
      choices: field.choices ? field.choices.join('\n') : '',
      min: field.min || 0,
      max: field.max || 100,
      multiplier: field.multiplier || 1,
      prefix: field.prefix || ''
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      dispatch(reorderQuestions({ oldIndex, newIndex }));
      if (editingIndex === oldIndex) setEditingIndex(newIndex);
      else if (editingIndex === newIndex) setEditingIndex(oldIndex);
    }
  };

  const handleCopyTable = () => {
    const headers = questions.map(q => q.title).join('\t');
    const body = generation.map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(`${headers}\n${body}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    try {
      const questionsStr = encodeURIComponent(btoa(JSON.stringify(questions)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?s=${questionsStr}&c=${rowCount}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      });
    } catch (e) {
      console.error("Failed to generate share link", e);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 flex flex-col shrink-0 bg-black/40 backdrop-blur-xl">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-serif italic text-white/80">{editingIndex !== null ? 'Modify Field' : 'Design Schema'}</h2>
          <p className="text-[11px] text-white/30 uppercase tracking-tighter mt-1 font-sans">{editingIndex !== null ? 'Adjust configuration then save' : 'Build your data structure'}</p>
        </div>
        
        <div className="flex-grow overflow-y-auto p-5 space-y-8">
          <div className="space-y-4">
            <h3 className="section-label">Field Details</h3>
            <form onSubmit={handleQSubmit(onAddOrUpdateField)} className="space-y-4">
              <Select label="Field Type" name="type" control={qControl} options={[
                { value: 'choices', label: 'Multiple Choice' },
                { value: 'number', label: 'Logic Number' },
                { value: 'auto_number', label: 'Auto-Serial' },
                { value: 'name', label: 'Full Name (Person)' },
                { value: 'email', label: 'Email (Person)' }
              ]} />
              <Input label="Field Name" name="title" control={qControl} placeholder="e.g. Employee ID" />
              <AnimatePresence mode="wait">
                {selectedType === 'choices' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} key="choices">
                    <TextArea label="Options" name="choices" control={qControl} placeholder="Active&#10;Inactive" />
                  </motion.div>
                )}
                {selectedType === 'number' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} key="number" className="grid grid-cols-2 gap-3">
                    <div className="col-span-1"><Input label="Min" name="min" control={qControl} type="number" /></div>
                    <div className="col-span-1"><Input label="Max" name="max" control={qControl} type="number" /></div>
                    <div className="col-span-2"><Input label="Multiplier" name="multiplier" control={qControl} type="number" /></div>
                  </motion.div>
                )}
                {selectedType === 'auto_number' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} key="auto">
                    <Input label="Prefix Text" name="prefix" control={qControl} placeholder="e.g. EMP " />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex gap-2 mt-2">
                <button type="submit" className="premium-button flex-grow flex items-center justify-center gap-2">
                  {editingIndex !== null ? <RotateCcw size={14} /> : <Plus size={14} />}
                  <span>{editingIndex !== null ? 'Update Field' : 'Append Field'}</span>
                </button>
                {editingIndex !== null && <button type="button" onClick={() => {setEditingIndex(null); resetQ({ type: 'choices', title: '', choices: '', min: 0, max: 100, multiplier: 1, prefix: '' });}} className="secondary-button px-3"><X size={14} /></button>}
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="section-label">Schema Components (Click to Edit)</h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {questions.map((q, idx) => (<SortableSchemaItem key={q.id} q={q} index={idx} onDelete={(i) => { if (editingIndex === i) setEditingIndex(null); dispatch(deleteQuestion(i)); }} onEdit={startEditing} isEditing={editingIndex === idx} />))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <div className="p-5 border-t border-white/5 bg-black/60">
          <Input label="Row Count" name="count" control={gControl} type="number" placeholder="Count" onChange={(val) => dispatch(setCount(Number(val)))} />
          <p className="text-[10px] text-white/20 mt-3 flex items-center gap-1"><Database size={10} /> Live sync enabled</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 bg-black">
        <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-white/70">Engine Online</span>
            <button 
              onClick={handleShare}
              className={`ml-2 px-3 py-1 rounded-full border border-white/5 text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-white/5 transition-all ${shared ? 'border-green-500/50 text-green-400' : 'text-white/40'}`}
            >
              {shared ? <Check size={10} /> : <LinkIcon size={10} />}
              {shared ? 'Link Copied' : 'Share Schema'}
            </button>
          </div>
          
          <div className="flex gap-2">
            <button onClick={handleCopyTable} className={`secondary-button !py-1.5 !px-3 flex items-center gap-2 transition-all ${copied ? 'border-green-500/50 text-green-400' : ''}`}>
              {copied ? <Check size={14} /> : <Copy size={14} />} <span className="text-xs">{copied ? 'Copied' : 'Copy for Sheets'}</span>
            </button>
            <button onClick={() => {
              const csvRows = [questions.map(q => q.title).join(',')];
              generation.forEach(row => csvRows.push(row.join(',')));
              const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `data-${Date.now()}.csv`; a.click();
            }} className="secondary-button !py-1.5 !px-3 flex items-center gap-2"><Download size={14} /> <span className="text-xs">CSV</span></button>
            <button onClick={() => {
              const ws = XLSX.utils.aoa_to_sheet([questions.map(q => q.title), ...generation]);
              const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Data"); XLSX.writeFile(wb, `data-${Date.now()}.xlsx`);
            }} className="secondary-button !py-1.5 !px-3 flex items-center gap-2"><FileSpreadsheet size={14} /> <span className="text-xs">XLSX</span></button>
          </div>
        </div>

        <div className="flex-grow overflow-auto p-6">
          <AnimatePresence mode="wait">
            {generation.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <table className="w-full text-left text-[11px] leading-tight">
                      <thead className="bg-white/[0.02] border-b border-white/5">
                        <SortableContext items={questions.map(q => q.id)} strategy={horizontalListSortingStrategy}>
                          <tr>{questions.map((q) => (<SortableHeader key={q.id} q={q} />))}</tr>
                        </SortableContext>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {generation.map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                            {row.map((val, j) => (<td key={j} className="px-4 py-3 text-white/60 whitespace-nowrap">{val}</td>))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </DndContext>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-4 grayscale opacity-40">
                <Layers size={48} strokeWidth={1} />
                <div className="text-center">
                  <h3 className="font-serif italic text-lg text-white/80">Vector Field Empty</h3>
                  <p className="text-xs text-white/40 mt-1">Schema required for sequence initialization.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center font-serif italic text-white/40">Loading Engine...</div>}>
      <HomeContent />
    </Suspense>
  )
}

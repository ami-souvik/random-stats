'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Trash2, Database, ListPlus, Wand2, X, FileSpreadsheet, Layers, GripVertical } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { setQuestions, setGeneration, deleteQuestion, reorderQuestions } from '@/src/store/slice/dataSlice';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper Components
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

// Sortable Table Header Component
const SortableHeader = ({ q, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: q.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <th 
      ref={setNodeRef} 
      style={style}
      className="px-4 py-3 font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap relative group"
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-white/10 group-hover:text-white/30 transition-colors">
          <GripVertical size={12} />
        </div>
        {q.title}
      </div>
    </th>
  );
};

// Sortable Schema Item Component
const SortableSchemaItem = ({ q, index, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: q.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div 
      ref={setNodeRef}
      style={style}
      layout
      className="group flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 transition-colors hover:border-white/10"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-white/10 group-hover:text-white/30 transition-colors">
          <GripVertical size={12} />
        </div>
        <span className="text-[10px] text-white/20 font-mono flex-shrink-0 uppercase">
          {q.type === 'number' ? '#' : q.type === 'auto_number' ? 'SN' : q.type === 'name' ? 'NM' : q.type === 'email' ? '@' : 'ABC'}
        </span>
        <span className="text-xs truncate text-white/70">{q.title}</span>
      </div>
      <button 
        onClick={() => onDelete(index)}
        className="text-white/20 hover:text-white transition-colors"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
};

export default function Home() {
  const dispatch = useDispatch();
  const questions = useSelector((state) => state.data.questions);
  const generation = useSelector((state) => state.data.generation);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { control: qControl, handleSubmit: handleQSubmit, reset: resetQ, watch: watchQ } = useForm({
    defaultValues: { type: 'choices', title: '', choices: '', min: 0, max: 100, multiplier: 1, prefix: '' }
  });

  const selectedType = watchQ('type');

  const { control: gControl, handleSubmit: handleGSubmit } = useForm({
    defaultValues: { count: 20 }
  });

  const onAddQuestion = (data) => {
    if (!data.title) return;
    
    let field = {
      title: data.title,
      type: data.type
    };

    if (data.type === 'choices') {
      field.choices = data.choices.split('\n').map(c => c.trim()).filter(Boolean);
    } else if (data.type === 'number') {
      field.min = data.min;
      field.max = data.max;
      field.multiplier = data.multiplier;
    } else if (data.type === 'auto_number') {
      field.prefix = data.prefix;
    }

    dispatch(setQuestions(field));
    resetQ({ type: 'choices', title: '', choices: '', min: 0, max: 100, multiplier: 1, prefix: '' });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      dispatch(reorderQuestions({ oldIndex, newIndex }));
    }
  };

  const onGenerate = (data) => {
    dispatch(setGeneration(generateRandomStats(questions, Number(data.count))));
  };

  const handleExportCSV = () => {
    const csvRows = [];
    csvRows.push(questions.map(q => q.title).join(','));
    generation.forEach(row => csvRows.push(row.join(',')));
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-${Date.now()}.csv`;
    a.click();
  };

  const handleExportXLSX = () => {
    const headers = questions.map(q => q.title);
    const data = [headers, ...generation];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `data-${Date.now()}.xlsx`);
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#050505]">
      {/* Left Sidebar: Configuration */}
      <aside className="w-80 border-r border-white/5 flex flex-col shrink-0 bg-black/40 backdrop-blur-xl">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-serif italic text-white/80">Design Schema</h2>
          <p className="text-[11px] text-white/30 uppercase tracking-tighter mt-1 font-sans">Build your data structure</p>
        </div>
        
        <div className="flex-grow overflow-y-auto p-5 space-y-8">
          <div className="space-y-4">
            <h3 className="section-label">Field Details</h3>
            <form onSubmit={handleQSubmit(onAddQuestion)} className="space-y-4">
              <Select 
                label="Field Type" 
                name="type" 
                control={qControl} 
                options={[
                  { value: 'choices', label: 'Multiple Choice' },
                  { value: 'number', label: 'Logic Number' },
                  { value: 'auto_number', label: 'Auto-Serial' },
                  { value: 'name', label: 'Full Name (Person)' },
                  { value: 'email', label: 'Email (Person)' }
                ]}
              />
              <Input label="Field Name" name="title" control={qControl} placeholder="e.g. Employee ID" />
              
              <AnimatePresence mode="wait">
                {selectedType === 'choices' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    key="choices"
                  >
                    <TextArea label="Options" name="choices" control={qControl} placeholder="Active&#10;Inactive" />
                  </motion.div>
                )}
                
                {selectedType === 'number' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    key="number"
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="col-span-1">
                      <Input label="Min" name="min" control={qControl} type="number" />
                    </div>
                    <div className="col-span-1">
                      <Input label="Max" name="max" control={qControl} type="number" />
                    </div>
                    <div className="col-span-2">
                      <Input label="Multiplier" name="multiplier" control={qControl} type="number" />
                    </div>
                  </motion.div>
                )}

                {selectedType === 'auto_number' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    key="auto"
                  >
                    <Input label="Prefix Text" name="prefix" control={qControl} placeholder="e.g. EMP " />
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" className="premium-button w-full flex items-center justify-center gap-2 mt-2">
                <Plus size={14} />
                <span>Append Field</span>
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="section-label">Schema Components (Drag to Reorder)</h3>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={questions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <SortableSchemaItem 
                      key={q.id} 
                      q={q} 
                      index={idx} 
                      onDelete={(i) => dispatch(deleteQuestion(i))} 
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

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
            <span className="text-sm font-medium text-white/70">Dataset Engine</span>
            {generation.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/40 uppercase font-mono">
                {generation.length} Vectors
              </span>
            )}
          </div>
          {generation.length > 0 && (
            <div className="flex gap-2">
              <button onClick={handleExportCSV} className="secondary-button !py-1.5 !px-3 flex items-center gap-2">
                <Download size={14} /> <span className="text-xs">CSV</span>
              </button>
              <button onClick={handleExportXLSX} className="secondary-button !py-1.5 !px-3 flex items-center gap-2">
                <FileSpreadsheet size={14} /> <span className="text-xs">XLSX</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex-grow overflow-auto p-6">
          {generation.length > 0 ? (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <table className="w-full text-left text-[11px] leading-tight">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                      <SortableContext 
                        items={questions.map(q => q.id)}
                        strategy={horizontalListSortingStrategy}
                      >
                        <tr>
                          {questions.map((q, i) => (
                            <SortableHeader key={q.id} q={q} index={i} />
                          ))}
                        </tr>
                      </SortableContext>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {generation.map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                          {row.map((val, j) => (
                            <td key={j} className="px-4 py-3 text-white/60 whitespace-nowrap">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DndContext>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-4 grayscale opacity-40">
              <Layers size={48} strokeWidth={1} />
              <div className="text-center">
                <h3 className="font-serif italic text-lg text-white/80">Awaiting Sequence Generation</h3>
                <p className="text-xs text-white/40 mt-1">Rearrange columns or add fields to begin.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

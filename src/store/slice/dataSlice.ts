import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  id: string;
  title: string;
  type: string;
  choices?: string[];
  min?: number;
  max?: number;
  multiplier?: number;
  prefix?: string;
}

interface DataState {
  questions: Question[];
  generation: any[][];
  count: number;
}

export const initialState: DataState = {
  questions: [
    { id: '1', title: 'Employee ID', type: 'auto_number', prefix: 'EMP-' },
    { id: '2', title: 'Full Name', type: 'name' },
    { id: '3', title: 'Email', type: 'email' },
    {
      id: '4',
      title: 'Department',
      type: 'choices',
      choices: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'],
    },
    {
      id: '5',
      title: 'Designation',
      type: 'choices',
      choices: ['Manager', 'Senior Engineer', 'Junior Engineer', 'Team Lead', 'Director', 'Analyst'],
    },
    { id: '6', title: 'Basic Salary', type: 'number', min: 40, max: 120, multiplier: 1000 },
    { id: '7', title: 'HRA', type: 'number', min: 10, max: 40, multiplier: 1000 },
    { id: '8', title: 'PF Deduction', type: 'number', min: 5, max: 15, multiplier: 1000 },
    { id: '9', title: 'PTAX', type: 'choices', choices: ['200', '300', '400', '500'] },
  ],
  generation: [],
  count: 20,
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const configSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setQuestions: (state, action: PayloadAction<Omit<Question, 'id'>>) => {
      state.questions = [...state.questions, { ...action.payload, id: generateId() }];
    },
    updateQuestion: (
      state,
      action: PayloadAction<{ index: number; data: Omit<Question, 'id'> }>
    ) => {
      const { index, data } = action.payload;
      const existingId = state.questions[index].id;
      state.questions[index] = { ...data, id: existingId };
    },
    cloneQuestion: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      const questionToClone = state.questions[index];
      const clonedQuestion = {
        ...questionToClone,
        id: generateId(),
        title: `${questionToClone.title} (Copy)`,
      };
      state.questions.splice(index + 1, 0, clonedQuestion);
    },
    deleteQuestion: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.questions.splice(index, 1);
    },
    setGeneration: (state, action: PayloadAction<any[][]>) => {
      state.generation = action.payload;
    },
    setCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    setBulkSchema: (
      state,
      action: PayloadAction<{ questions: Question[] | null; count: number }>
    ) => {
      const { questions, count } = action.payload;
      if (questions) state.questions = questions;
      if (count) state.count = count;
    },
    reorderQuestions: (state, action: PayloadAction<{ oldIndex: number; newIndex: number }>) => {
      const { oldIndex, newIndex } = action.payload;
      const questions = [...state.questions];
      const [removed] = questions.splice(oldIndex, 1);
      questions.splice(newIndex, 0, removed);
      state.questions = questions;
    },
  },
});

export const {
  setQuestions,
  updateQuestion,
  cloneQuestion,
  deleteQuestion,
  setGeneration,
  reorderQuestions,
  setCount,
  setBulkSchema,
} = configSlice.actions;

export const dataReducer = configSlice.reducer;

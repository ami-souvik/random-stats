import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  questions: [
    { id: '1', title: "Full Name", type: 'name' },
    { id: '2', title: "Email", type: 'email' },
    { id: '3', title: "Gender", type: 'choices', choices: ['Male', 'Female'] }
  ],
  generation: [],
  count: 20
};

// Helper for generating unique IDs for fields
const generateId = () => Math.random().toString(36).substr(2, 9);

export const configSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.questions = [...state.questions, { ...action.payload, id: generateId() }]
    },
    updateQuestion: (state, action) => {
      const { index, data } = action.payload;
      const existingId = state.questions[index].id;
      state.questions[index] = { ...data, id: existingId };
    },
    deleteQuestion: (state, action) => {
      const index = action.payload;
      state.questions.splice(index, 1);
    },
    setGeneration: (state, action) => {
      state.generation = action.payload
    },
    setCount: (state, action) => {
      state.count = action.payload;
    },
    setBulkSchema: (state, action) => {
      const { questions, count } = action.payload;
      if (questions) state.questions = questions;
      if (count) state.count = count;
    },
    reorderQuestions: (state, action) => {
      const { oldIndex, newIndex } = action.payload;
      const questions = [...state.questions];
      const [removed] = questions.splice(oldIndex, 1);
      questions.splice(newIndex, 0, removed);
      state.questions = questions;
    }
  }
});

export const { 
  setQuestions, 
  updateQuestion, 
  deleteQuestion, 
  setGeneration, 
  reorderQuestions,
  setCount,
  setBulkSchema
} = configSlice.actions;

export const dataReducer = configSlice.reducer;

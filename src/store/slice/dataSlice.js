import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  questions: [
    { id: '1', title: "Full Name", type: 'name' },
    { id: '2', title: "Email", type: 'email' },
    { id: '3', title: "Gender", type: 'choices', choices: ['Male', 'Female'] }
  ],
  generation: []
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
    deleteQuestion: (state, action) => {
      const index = action.payload;
      state.questions.splice(index, 1);
      // Also update generation if it exists to remove the corresponding column
      if (state.generation.length > 0) {
        state.generation = state.generation.map(row => {
          const newRow = [...row];
          newRow.splice(index, 1);
          return newRow;
        });
      }
    },
    setGeneration: (state, action) => {
      state.generation = action.payload
    },
    reorderQuestions: (state, action) => {
      const { oldIndex, newIndex } = action.payload;
      const questions = [...state.questions];
      const [removed] = questions.splice(oldIndex, 1);
      questions.splice(newIndex, 0, removed);
      state.questions = questions;

      // Reorder the generation data columns as well
      if (state.generation.length > 0) {
        state.generation = state.generation.map(row => {
          const newRow = [...row];
          const [removedVal] = newRow.splice(oldIndex, 1);
          newRow.splice(newIndex, 0, removedVal);
          return newRow;
        });
      }
    }
  }
});

export const { setQuestions, deleteQuestion, setGeneration, reorderQuestions } = configSlice.actions;

export const dataReducer = configSlice.reducer;

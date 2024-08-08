import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  questions: [],
  generation: []
};

export const configSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.questions = [...state.questions, action.payload]
    },
    deleteQuestion: (state, action) => {
      state.questions.splice(action.payload, 1)
      if(action.payload < state.generation.length)
      state.generation = state.generation.map(row => {
        row.splice(action.payload, 1)
        return row
      })
    },
    setGeneration: (state, action) => {
      state.generation = action.payload
    }
  }
});

export const { setQuestions, deleteQuestion, setGeneration } = configSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.folio.value)`
export const selectconfig = (state) => state.config;

export const dataReducer = configSlice.reducer;

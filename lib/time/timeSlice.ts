import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import moment from 'moment';

const initialState = {
  currentTime: new Date().valueOf(),
  paused: false,
  timeScale: 1,
  minTimeScale: 0.1,
  maxTimeScale: 100,
};

export const timeSlice = createSlice({
  name: 'time',
  initialState,
  reducers: {
    advanceTime: (state, action: PayloadAction<{ ms: number }>) => {
      state.currentTime = moment(state.currentTime)
        .add(action.payload.ms * state.timeScale, 'millisecond')
        .valueOf();
    },
    setTime: (state, action: PayloadAction<{ time: number }>) => {
      state.currentTime = action.payload.time;
    },
    setPaused: (state, action: PayloadAction<{ paused: boolean }>) => {
      state.paused = action.payload.paused;
    },
    setTimeScale: (state, action: PayloadAction<{ timeScale: number }>) => {
      if (action.payload.timeScale < state.minTimeScale) {
        state.timeScale = state.minTimeScale;
      } else if (action.payload.timeScale > state.maxTimeScale) {
        state.timeScale = state.maxTimeScale;
      } else {
        state.timeScale = action.payload.timeScale;
      }
    },
  },
});

export const { advanceTime, setTime, setPaused, setTimeScale } =
  timeSlice.actions;

export default timeSlice.reducer;

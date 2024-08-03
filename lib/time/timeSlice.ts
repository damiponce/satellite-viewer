import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import moment from 'moment';

const initialState = {
  currentTime: new Date().valueOf(),
  paused: false,
  timeScale: 1,
  sliderTimeScale: 1,
  minTimeScale: -604800,
  maxTimeScale: 604800,
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
    setTimeScale: (
      state,
      action: PayloadAction<{ timeScale: number; isFromSlider?: boolean }>,
    ) => {
      let scale = 1;
      if (action.payload.isFromSlider || true) {
        state.sliderTimeScale = action.payload.timeScale;
        if (action.payload.timeScale > 1)
          // scale = Math.log(action.payload.timeScale - 1) / Math.log(1.143931)
          scale = Math.pow(1.143931, action.payload.timeScale - 1);
        else if (action.payload.timeScale < 1)
          scale = Math.pow(action.payload.timeScale, 0.134);

        if (scale >= 15) scale = Math.round(scale);
      } else {
        scale = action.payload.timeScale;
      }
      if (scale < state.minTimeScale) {
        state.timeScale = state.minTimeScale;
      } else if (scale > state.maxTimeScale) {
        state.timeScale = state.maxTimeScale;
      } else {
        state.timeScale = scale;
      }
      if (state.timeScale === 0) {
        state.paused = true;
      } else if (state.paused) {
        state.paused = false;
      }
    },
  },
});

export const { advanceTime, setTime, setPaused, setTimeScale } =
  timeSlice.actions;

export default timeSlice.reducer;

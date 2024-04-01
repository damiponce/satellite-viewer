import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { SelectionsType } from './selections';
import { set } from 'lodash';

const initialState: SelectionsType = {
  focused: {
    id: null,
    posEc: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  info: {
    id: null,
    speed: 0,
    posGeo: {
      lat: 0,
      lon: 0,
      height: 0,
    },
    posEc: {
      x: 0,
      y: 0,
      z: 0,
    },
    tle: {
      ndot: 0,
      nddot: 0,
      bstar: 0,
      inclo: 0,
      nodeo: 0,
      ecco: 0,
      argpo: 0,
      mo: 0,
      no: 0,
    },
  },
};

export const selectionsSlice = createSlice({
  name: 'selections',
  initialState,
  reducers: {
    setFocused: (state, action: PayloadAction<{ id: number }>) => {
      state.focused.id = action.payload.id;
    },
    setFocusedData: (
      state,
      action: PayloadAction<{ path: string; value: number | string }>,
    ) => {
      // let value: number = Math.round(action.payload.value * 1e5) / 1e5;
      return set(state, `focused.${action.payload.path}`, action.payload.value);
    },
    toggleFocused: (state, action: PayloadAction<{ id: number }>) => {
      state.focused.id =
        state.focused.id === action.payload.id ? null : action.payload.id;
    },
    removeFocused: (state) => {
      state.focused.id = null;
    },
    setInfo: (state, action: PayloadAction<{ id: number }>) => {
      state.info.id = action.payload.id;
    },
    setInfoData: (
      state,
      action: PayloadAction<{ path: string; value: number | string }>,
    ) => {
      // let value: number = Math.round(action.payload.value * 1e2) / 1e2;
      return set(state, `info.${action.payload.path}`, action.payload.value);
    },
    toggleInfo: (state, action: PayloadAction<{ id: number }>) => {
      state.info.id =
        state.info.id === action.payload.id ? null : action.payload.id;
    },
    removeInfo: (state) => {
      state.info.id = null;
    },
  },
});

export const {
  setFocused,
  setFocusedData,
  toggleFocused,
  removeFocused,
  setInfo,
  setInfoData,
  toggleInfo,
  removeInfo,
} = selectionsSlice.actions;

export default selectionsSlice.reducer;

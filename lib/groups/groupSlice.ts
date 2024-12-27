import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { set, clone, cloneDeep, add, remove } from 'lodash';
import { GroupType, GroupsType } from './group';
import moment from 'moment';

const initialState: GroupsType = [
  {
    enabled: true,
    deleteable: false,
    name: 'Starlink',
    name_filter: 'STARLINK',
  },
  { enabled: true, deleteable: false, name: 'GOES', name_filter: 'GOES' },
  { enabled: true, deleteable: false, name: 'Other', name_filter: '' },
];
export const groupsSlice = createSlice({
  name: 'satellites',
  initialState,
  reducers: {
    addGroup: (
      state,
      action: PayloadAction<{
        name: string;
        name_filter: string;
        index?: number;
      }>,
    ) => {
      if (state.find((g) => g.name_filter === action.payload.name_filter)) {
        return state;
      }
      if (action.payload.index) {
        state.splice(action.payload.index, 0, {
          enabled: true,
          deleteable: true,
          name: action.payload.name,
          name_filter: action.payload.name_filter.toUpperCase(),
        });
        return state;
      }
      state.push({
        enabled: true,
        deleteable: true,
        name: action.payload.name,
        name_filter: action.payload.name_filter.toUpperCase(),
      });
    },
    setGroup: (
      state,
      action: PayloadAction<{ name: string; enabled: boolean }>,
    ) => {
      const newState = cloneDeep(state);
      const group = newState.find((g) => g.name === action.payload.name);
      if (group) {
        group.enabled = action.payload.enabled;
      }
      return newState;
    },
    removeGroup: (state, action: PayloadAction<{ name_filter: string }>) => {
      const newState = cloneDeep(state);
      remove(
        newState,
        (g) => g.name_filter === action.payload.name_filter.toUpperCase(),
      );
      return newState;
    },
  },
});

export const { addGroup, setGroup, removeGroup } = groupsSlice.actions;

export default groupsSlice.reducer;

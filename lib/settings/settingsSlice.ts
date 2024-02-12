import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import settings, {
  FlatSettings,
  Settings,
  Setting,
  SettingsGroup,
} from './settings';
import { set } from 'lodash';

// Convert the settings object into a value only object
let settingsCopy: FlatSettings = {};

function isSettingsGroup(obj: Setting | SettingsGroup): obj is SettingsGroup {
  return (<SettingsGroup>obj).value === undefined;
}

Object.entries(settings).forEach(([key, value]) => {
  if (isSettingsGroup(value)) {
    Object.entries(value).forEach(([subKey, subValue]) => {
      // if subValue.type === "radio", replace value with all sibling subKeys
      if (subValue.type === 'radio') {
        const siblingKeys = Object.keys(value);
        set(
          settingsCopy,
          `${key}`,
          siblingKeys.find((k) => value[k].value === true) ?? siblingKeys[0],
        );
      } else {
        set(settingsCopy, `${key}.${subKey}`, subValue.value);
      }
    });
  } else {
    settingsCopy[key] = value.value;
  }
});
const initialState: FlatSettings = settingsCopy;

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    update: (state, action: PayloadAction<{ path: string; value: any }>) => {
      return set(state, action.payload.path, action.payload.value);
    },
  },
});

export const { update } = settingsSlice.actions;

export default settingsSlice.reducer;

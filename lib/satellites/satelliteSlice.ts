import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { set, clone, cloneDeep } from 'lodash';
import { SatelliteType, SatellitesType } from './satellite';
import moment from 'moment';
import { tempSats as initialState } from './temp';

const emptySatellite: SatelliteType = {
  noradId: 0,
  name: '',
  tle1: '',
  tle2: '',
  fetchedAt: moment().valueOf(),
  color: 0xffffff,
  selected: false,
  visible: true,
  elements: {
    point: true,
    label: true,
    orbitEci: false,
    orbitEcef: false,
    groundTrack: false,
  },
};

// const initialState: SatellitesType = [
//   {
//     noradId: 25544,
//     name: 'ISS (ZARYA)',
//     tle1: `1 25544U 98067A   24038.73993252  .00016441  00000+0  29951-3 0  9991`,
//     tle2: `2 25544  51.6399 241.7928 0002409 210.2639 231.9566 15.49610019438324`,
//     fetchedAt: moment().valueOf(),
//     color: 0xffffff,
//     selected: false,
//     visible: true,
//     elements: {
//       point: true,
//       label: true,
//       orbitEci: false,
//       orbitEcef: false,
//       groundTrack: false,
//     },
//   },
//   {
//     noradId: 33591,
//     name: 'NOAA 19',
//     tle1: `1 33591U 09005A   24038.58205664  .00000322  00000+0  19736-3 0  9993`,
//     tle2: `2 33591  99.0676  92.8975 0012979 302.2586  57.7327 14.12921832772925`,
//     fetchedAt: moment().valueOf(),
//     color: 0xffffff,
//     selected: false,
//     visible: true,
//     elements: {
//       point: true,
//       label: true,
//       orbitEci: false,
//       orbitEcef: false,
//       groundTrack: false,
//     },
//   },
//   {
//     noradId: 41866,
//     name: 'GOES 16',
//     tle1: `1 41866U 16071A   24076.51490392 -.00000260  00000+0  00000+0 0  9999`,
//     tle2: `2 41866   0.0638 278.8245 0000825  89.0321 276.8622  1.00270838 26851`,
//     fetchedAt: moment().valueOf(),
//     color: 0xccccff,
//     selected: false,
//     visible: true,
//     elements: {
//       point: true,
//       label: true,
//       orbitEci: false,
//       orbitEcef: false,
//       groundTrack: false,
//     },
//   },
// ];

export const satellitesSlice = createSlice({
  name: 'satellites',
  initialState,
  reducers: {
    addRawSatellite: (
      state,
      action: PayloadAction<{ satellite: SatelliteType; index: number }>,
    ) => {
      state.splice(action.payload.index, 0, action.payload.satellite);
    },
    addSatellite: (
      state,
      action: PayloadAction<{
        noradId: number;
        name: string;
        tle1: string;
        tle2: string;
        fetchedAt: number;
      }>,
    ) => {
      let satellite = cloneDeep(emptySatellite);
      satellite.noradId = action.payload.noradId;
      satellite.name = action.payload.name;
      satellite.tle1 = action.payload.tle1;
      satellite.tle2 = action.payload.tle2;
      satellite.fetchedAt = action.payload.fetchedAt;
      state.push(satellite);
    },
    addSatelliteFromDB: (
      state,
      action: PayloadAction<
        {
          gp_id: string;
          creation_date: Date;
          object_name: string;
          object_id: string;
          epoch: Date;
          classification_type: string;
          object_type: string;
          rcs_size: string;
          tle_line0: string;
          tle_line1: string;
          tle_line2: string;
        }[]
      >,
    ) => {
      // empty the state
      state.splice(0, state.length);
      action.payload.forEach((gp) => {
        let satellite = cloneDeep(emptySatellite);
        satellite.noradId = parseInt(gp.gp_id);
        satellite.name = gp.object_name;
        satellite.tle1 = gp.tle_line1;
        satellite.tle2 = gp.tle_line2;
        satellite.fetchedAt = gp.epoch.getTime();
        state.push(satellite);
      });
    },
    removeSatellite: (state, action: PayloadAction<{ noradId: number }>) => {
      const index = state.findIndex(
        (satellite) => satellite.noradId === action.payload.noradId,
      );
      if (index !== -1) {
        state.splice(index, 1);
      }
    },
    updateElement: (
      state,
      action: PayloadAction<{
        noradId: number;
        element: keyof SatelliteType['elements'];
        value: any;
      }>,
    ) => {
      const satellite = state.find(
        (satellite) => satellite.noradId === action.payload.noradId,
      );
      if (satellite) {
        satellite.elements[action.payload.element] = action.payload.value;
      }
    },
    setVisible: (
      state,
      action: PayloadAction<{ noradId: number; visible: boolean }>,
    ) => {
      const satellite = state.find(
        (satellite) => satellite.noradId === action.payload.noradId,
      );
      if (satellite) {
        satellite.visible = action.payload.visible;
      }
    },
  },
});

export const {
  addRawSatellite,
  addSatellite,
  addSatelliteFromDB,
  removeSatellite,
  updateElement,
  setVisible,
} = satellitesSlice.actions;

export default satellitesSlice.reducer;

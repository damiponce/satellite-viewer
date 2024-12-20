'use client';
import { getDB } from '@/lib/actions/gp';
import { Dispatch } from '@reduxjs/toolkit';
import { addSatellitesFromDB } from '@/lib/satellites/satelliteSlice';
import { loadJsonData, saveJsonData } from '@/lib/idb/storage';

export async function saveGPtoIDB() {
  return await getDB()
    .then((gp) => {
      gp.forEach((sat) => {
        sat.creation_date = new Date(sat.creation_date).getTime();
        sat.epoch = new Date(sat.epoch).getTime();
      });
      return gp;
    })
    .then(async (gp) => {
      if (true) console.debug('SAVING GP TO IndexedDB');
      await saveJsonData('gp', gp);
      if (true) console.debug('SAVED GP TO IndexedDB');
      if (true) console.debug(gp);
      return gp;
    });
}

export async function loadData(dispatch: Dispatch<any>) {
  loadJsonData('gp').then(async (data) => {
    if (!data) {
      if (true) console.debug('NO SATELLITES IN IndexedDB');
      dispatch(addSatellitesFromDB(await saveGPtoIDB()));
    } else {
      if (false) console.debug('SATELLITES IN IndexedDB');
      dispatch(addSatellitesFromDB(data));
    }
  });
}

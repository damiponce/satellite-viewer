import { Dispatch } from '@reduxjs/toolkit';
import { satelliteCalc } from './SatelliteDots';

import { SatRec } from 'satellite.js';

self.onmessage = function (e) {
  const {
    timeNow,
    dataChunk,
  }: {
    timeNow: Date;
    data: SatRec[];
    dataChunk: any[];
  } = e.data;

  const satDatas = dataChunk.map((sat, i) => {
    return satelliteCalc(
      timeNow,
      dataChunk[i],
      0,
      {
        focused: false,
        info: false,
      },
      undefined,
    );
  });

  self.postMessage(satDatas);
};

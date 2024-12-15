import { satelliteCalc } from '@/lib/utils';
import { Dispatch } from '@reduxjs/toolkit';

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

  const satDatas = dataChunk.map((sat) => {
    return satelliteCalc(
      timeNow,
      sat,
      0,
      {
        focused: false,
        info: false,
      },
      undefined,
    );
  });

  setTimeout(() => {
    self.postMessage(satDatas);
  }, 0.1 * 1000);
};

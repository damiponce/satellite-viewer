import initWasm, { Satellites } from '@/lib/pkg/satellite_viewer_wasm';

let satellites: Satellites | null = null;

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === 'init' && payload.tles && !satellites) {
    await initWasm();

    console.info('Initializing worker with TLEs:', payload.tles.length);
    satellites = new Satellites(payload.tles);
    self.postMessage({ type: 'ready' });
  }

  if (type === 'propagate') {
    const time = payload.time;
    if (satellites) {
      try {
        const results = satellites.propagate(BigInt(Math.round(time)));
        // setTimeout(() => {
        self.postMessage({ type: 'propagateResult', results });
        // }, 1000 / 60);
      } catch (err: any) {
        self.postMessage({ type: 'error', error: err.message });
      }
    }
  }
};

/*
self.onmessage = function (e) {
  const {
    timeNow,
    satClass,
  }: {
    timeNow: number;
    satClass: React.MutableRefObject<Satellites>;
  } = e.data;

  console.log(satClass);
  const satDatas = satClass.current.propagate(BigInt(timeNow));

  setTimeout(() => {
    self.postMessage(satDatas);
  }, 0.1 * 1000);
};
*/

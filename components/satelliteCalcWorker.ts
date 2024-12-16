import initWasm, { Satellites } from '@/lib/pkg/satellite_viewer_wasm';

let satellites: Satellites | null = null;

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === 'init' && payload.tles && !satellites) {
    await initWasm();
    //increase wasm memory
    // const memory = new WebAssembly.Memory({ initial: 2048 });
    satellites = new Satellites(payload.tles);
    self.postMessage({ type: 'ready' });
  }

  if (type === 'propagate') {
    const time = payload.time;
    if (satellites) {
      try {
        const results = satellites.propagate(BigInt(Math.round(time)));
        self.postMessage({ type: 'propagateResult', results });
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

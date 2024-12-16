import init, { Satellites } from './pkg/satellite_viewer_wasm';

export async function loadWasm() {
  await init();
  const satellites = new Satellites(1);
  console.log(satellites.get_count());
  for (let i = 0; i < 10; i++) {
    satellites.iter_count();
    console.log(satellites.get_count());
  }
}

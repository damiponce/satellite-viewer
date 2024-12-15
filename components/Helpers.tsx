import { RootState } from '@/lib/redux/store';
import {
  GizmoHelper,
  GizmoViewport,
  Grid,
  PerformanceMonitor,
  Stats,
} from '@react-three/drei';
import { Perf } from 'r3f-perf';
import React from 'react';
import { useSelector } from 'react-redux';

export default function Helpers() {
  const settings = useSelector((state: RootState) => state.settings);

  return (
    <>
      {/* @ts-ignore */}
      {settings.view.gizmo && (
        <GizmoHelper
          alignment='bottom-right' // widget alignment within scene
          margin={[60, 92]} // widget margins (X, Y)
        >
          <GizmoViewport
            axisColors={['red', 'green', 'blue']}
            labelColor='black'
          />
        </GizmoHelper>
      )}
      {/* @ts-ignore */}
      {settings.view.grid && (
        <Grid
          args={[100, 100]}
          sectionColor={0x777777}
          cellThickness={0}
          position={[0, 0, 0]}
          infiniteGrid
          fadeDistance={200}
        />
      )}
      {false ? (
        <Stats className='!left-[calc(50%_-_40px)] origin-top scale-110' />
      ) : (
        <Perf overClock={false} deepAnalyze matrixUpdate colorBlind />
      )}
    </>
  );
}

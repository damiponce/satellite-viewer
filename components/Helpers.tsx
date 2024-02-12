import { RootState } from '@/lib/redux/store';
import { GizmoHelper, GizmoViewport, Grid, Stats } from '@react-three/drei';
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
          margin={[80, 80]} // widget margins (X, Y)
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
          rotation={[Math.PI / 2, 0, 0]}
          args={[100, 100]}
          sectionColor={0x777777}
          cellThickness={0}
          position={[0, 0, 0]}
          infiniteGrid
          fadeDistance={200}
        />
      )}
      {/* <Stats /> */}
    </>
  );
}

import _extends from "@babel/runtime/helpers/esm/extends";
import { ReactThreeFiber, useThree, useFrame } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import { forwardRef, useMemo, useEffect, useLayoutEffect } from "react";
import { ArcballControls as ArcballControls$1 } from "@/three/controls/ArcballControls";
import type { Event, OrthographicCamera, PerspectiveCamera } from "three";
import { ForwardRefComponent } from "@react-three/drei/helpers/ts-utils";
export type ArcballControlsProps = Omit<
  ReactThreeFiber.Overwrite<
    ReactThreeFiber.Object3DNode<ArcballControls$1, typeof ArcballControls$1>,
    {
      target?: ReactThreeFiber.Vector3;
      camera?: OrthographicCamera | PerspectiveCamera;
      domElement?: HTMLElement;
      regress?: boolean;
      makeDefault?: boolean;
      onChange?: (e?: Event) => void;
      onStart?: (e?: Event) => void;
      onEnd?: (e?: Event) => void;
    }
  >,
  "ref"
>;

const ArcballOrbitControls: ForwardRefComponent<
  ArcballControlsProps,
  ArcballControls$1
> = /* @__PURE__ */ forwardRef(
  (
    {
      camera,
      makeDefault,
      regress,
      domElement,
      onChange,
      onStart,
      onEnd,
      ...restProps
    },
    ref,
  ) => {
    const invalidate = useThree((state) => state.invalidate);
    const defaultCamera = useThree((state) => state.camera);
    const gl = useThree((state) => state.gl);
    const events = useThree((state) => state.events);
    const set = useThree((state) => state.set);
    const get = useThree((state) => state.get);
    const performance = useThree((state) => state.performance);
    const explCamera = camera || defaultCamera;
    const explDomElement = domElement || events.connected || gl.domElement;
    const controls = useMemo(
      () => new ArcballControls$1(explCamera),
      [explCamera],
    );
    // useEffect(() => {
    //   if (camera) {
    //     controls.camera.up.set(0, 0, 1);

    //     // Get the current quaternion
    //     const quaternion = camera?.quaternion.clone();

    //     // Decompose the quaternion to get the rotation angles
    //     const euler = new THREE.Euler().setFromQuaternion(quaternion);

    //     // Restrict the z-axis rotation
    //     euler.z = 0;

    //     // Recompose the quaternion
    //     camera?.quaternion.setFromEuler(euler);

    //     // Update the camera's matrix and the controls
    //     camera?.updateMatrixWorld();
    //   }
    // }, [camera]);
    const PI = Math.PI;
    useFrame(({ camera }) => {
      if (controls.enabled) {
        // console.log(controls);
        if (false) {
          // Set the camera's up vector to prevent z-axis rotation
          camera.up.set(0, 1, 0);

          // Get the current quaternion
          const quaternion = camera.quaternion.clone();

          // Decompose the quaternion to get the rotation angles
          const euler = new THREE.Euler().setFromQuaternion(quaternion);

          // Restrict the z-axis rotation
          euler.y = 0;

          // Recompose the quaternion
          camera.quaternion.setFromEuler(euler);

          // Update the camera's matrix and the controls
          camera.updateMatrixWorld();
        }

        controls.update();
      }
    }); //, -1);
    useEffect(() => {
      controls.connect(explDomElement);
      return () => void controls.dispose();
    }, [explDomElement, regress, controls, invalidate]);
    useEffect(() => {
      const callback = (e) => {
        invalidate();
        if (regress) performance.regress();
        if (onChange) onChange(e);
      };
      controls.addEventListener("change", callback);
      if (onStart) controls.addEventListener("start", onStart);
      if (onEnd) controls.addEventListener("end", onEnd);
      return () => {
        controls.removeEventListener("change", callback);
        if (onStart) controls.removeEventListener("start", onStart);
        if (onEnd) controls.removeEventListener("end", onEnd);
      };
    }, [onChange, onStart, onEnd]);
    useEffect(() => {
      if (makeDefault) {
        const old = get().controls;
        set({
          controls,
        });
        return () =>
          set({
            controls: old,
          });
      }
    }, [makeDefault, controls]);
    return /*#__PURE__*/ React.createElement(
      "primitive",
      _extends(
        {
          ref: ref,
          object: controls,
        },
        restProps,
      ),
    );
  },
);

export default ArcballOrbitControls;

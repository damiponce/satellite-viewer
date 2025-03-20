'use client';
import React, { forwardRef, StrictMode } from 'react';
import * as THREE from 'three';

import { store } from '@/lib/redux/store';
import { Provider, useDispatch } from 'react-redux';

import Overlay from '@/components/overlay/Overlay';
import SatelliteScene from '@/components/SatelliteScene';

import hypertimer from 'hypertimer';
import Timekeeper from '@/lib/Timekeeper';
import WelcomeDialog from '@/components/AlertDIalog';
import { LoadingProvider } from '@/components/LoadingScreen';

import { Canvas } from '@react-three/fiber';
import { loadData } from '@/lib/loadData';
import TimeHandlerThree from '@/components/overlay/TimeHandlerThree';
import TimelineThree from '@/components/overlay/TimelineThree';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

import dynamic from 'next/dynamic';
import { BeaconRenderProps, TooltipRenderProps } from 'react-joyride';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
const JoyrideNoSSR = dynamic(() => import('react-joyride'), { ssr: false });

const steps = [
  {
    target: '#app-container',
    title: 'Welcome to SatView 👋',
    content: `
    Here you will be able to explore real-time simulations for Earth-orbiting satellites.

    The main components are:
      - The *main view*, where satellites orbit around Earth.
      - A *satellite groups panel*, to filter which sats you see.
      - A *time control panel* to speed up or pause time.
      - An *information panel*, with details about sats and more.
      `,

    placement: 'center',
  },
  {
    target: '#canvas-container',
    title: 'Globe view 🌏',
    content: `This is our beautiful Earth. Yes, it is a globe.
    Those white dots floating around are the *satellites*.
    Click and drag to *rotate* around the Earth.
    Scroll the mouse wheel or pinch the screen to *zoom in and out*.`,
    placement: 'bottom',
    disableBeacon: true,
    disableOverlayClose: true,
    width: 450,
  },
  {
    target: '#onboarding-satellite-groups',
    title: 'Satellite groups 📡',
    content: `Here you can see all the *satellite groups* that are currently in the simulation.
    Click on a group to *toggle* it.
    You can also *add group filters* with the search box.`,
    placement: 'bottom',
    width: 450,
  },
  {
    target: '#onboarding-time-handler',
    title: 'Time control ⏱️',
    content: `Here you can control the *speed* of the simulation and *pause/resume* it. 
      You can also go back to the *current time* by clicking the "Now" button.`,
    placement: 'top',
  },
  {
    target: '#onboarding-info-panel',
    title: 'Information panel 📊',
    content: `Here you have access to a breadth of *information about the simulation and the satellites*.`,
    placement: 'bottom',
  },
  {
    target: '#onboarding-hide',
    title: 'Hiding the overlay ✨',
    content:
      'If you want a cleaner look, you can click this button to toggle the overlay.',
    placement: 'bottom',
  },
];

function WrappedApp() {
  // const [, forceUpdate] = React.useReducer((x) => -x, 0);

  const dispatch = useDispatch();

  const timer = React.useRef(
    hypertimer({
      rate: 1,
      time: Date.now(),
      paced: true,
    }),
  );

  React.useLayoutEffect(() => {
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);
    if (typeof window !== 'undefined') {
      loadData(dispatch);
    }
  });

  return (
    // <Suspense fallback={<Loading />}>
    <>
      {process.env.NODE_ENV !== 'development' && (
        <JoyrideNoSSR
          // @ts-ignore
          steps={steps}
          continuous={true}
          styles={{
            options: {
              // arrowColor: '#000000',
              zIndex: 100000,
              primaryColor: '#1d4ed8',
            },
          }}
          tooltipComponent={CustomTooltip}
          // beaconComponent={CustomBeacon}
        />
      )}
      <Canvas
        id='canvas-container'
        dpr={[1, 3]}
        gl={{}}
        frameloop='demand'
        performance={{
          min: 0.5,
          max: 1,
          debounce: 200,
        }}
      >
        <SatelliteScene timer={timer} />
        <TimeHandlerThree timer={timer} />
        {/* <TimelineThree timer={timer} /> */}
      </Canvas>
      <Overlay timer={timer} />
      <Timekeeper
        deltaMs={10}
        set={(t) => {
          timer.current = t;
          // forceUpdate();
        }}
      />
    </>
    // </Suspense>
  );
}

const CustomBeacon = forwardRef<HTMLButtonElement, BeaconRenderProps>(
  (props, ref) => {
    return (
      <span
        ref={ref}
        className='bg-red-500 rounded-full h-3 w-3  inline-block -translate-x-1/2-translate-y-1/2'
        {...props}
      />
    );
  },
);

function CustomTooltip(props: TooltipRenderProps) {
  const {
    backProps,
    closeProps,
    continuous,
    index,
    primaryProps,
    skipProps,
    step,
    tooltipProps,
  } = props;

  return (
    <div
      className={cn(
        'bg-background /50 backdrop-blur-lg_ border-2 border-solid border-border py-4 px-6 rounded-lg relative flex flex-col min-w-[300px]',
        index === 0 ? ' w-[95vw] sm:w-[500px]  ' : ' max-w-[350px]',
        // 'max-sm:scale-90',
        // @ts-ignore
        step.width! ? `max-w-[${step.width!}px]` : '',
      )}
      {...tooltipProps}
    >
      <button className='absolute top-3 right-3' {...closeProps}>
        <X className='h-5 w-5' strokeWidth={1.5} />
      </button>
      {step.title && (
        <h4 className='uppercase text-[1.3rem] font-[650] tracking-normal_ mb-2 pr-4'>
          {step.title}
        </h4>
      )}
      <p
        className='mb-5 par_height text-muted-foreground text-balance'
        dangerouslySetInnerHTML={{
          __html: (step.content as string)
            .replace(/ \*/g, ' <b>')
            .replace(/\* /g, '</b> ')
            .replace(/\*\./g, '</b>.')
            .replace(/\*,/g, '</b>,')
            .replace(/\n/g, '<br />'),
        }}
      />
      {index === 0 && (
        <div className='bg-slate-700/10 rounded-lg border-l-2 border-slate-500  px-4 py-3 mb-4 overflow-hidden'>
          <div className='-mx-4 -mt-3 px-4 py-1 h-10 bg-slate-600/25 flex justify-start items-center'>
            <p className='font-bold text-slate-500 uppercase'>Disclaimer</p>{' '}
          </div>
          <p className='text-slate-300/75 text-sm mt-3 br-h font-light [&>b]:font-semibold [&>b]:text-slate-300'>
            This is a hobby project. <b>Expect bugs and missing features.</b>
            <br />
            The TLE data is fetched at least every 24 hours.
            <br />
            This is <b>NOT</b> a scientific tool.
          </p>
        </div>
      )}
      {index === 0 && <p className='text-lg'>Let&apos;s take a quick tour!</p>}
      <div className='flex flex-row gap-2 justify-end -mr-2'>
        <button
          className='bg-muted py-1 px-3 rounded-sm flex justify-center items-center'
          {...skipProps}
        >
          <span className='pt-[1px]'>{skipProps.title}</span>
        </button>
        <div className='flex flex-row gap-2'>
          {index > 0 && (
            <button
              className='bg-blue-900/50 py-1 px-3 rounded-sm flex justify-center items-center'
              {...backProps}
            >
              <span className='pt-[1px]'>{backProps.title}</span>
            </button>
          )}
          {continuous && (
            <button
              className='bg-blue-900 py-1 px-3 rounded-sm flex justify-center items-center'
              {...primaryProps}
            >
              <span className='pt-[1px]'>
                {primaryProps.title === 'Last' ? 'Finish' : primaryProps.title}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StrictMode>
      <Provider store={store}>
        <div id='canvas-container' className='overflow-hidden'>
          <LoadingProvider>
            <WrappedApp />
          </LoadingProvider>
        </div>
      </Provider>
    </StrictMode>
  );
}

'use client';
import { cn } from '@/lib/utils';
import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { setPaused, setTime, setTimeScale } from '@/lib/time/timeSlice';
import { Slider } from '../ui/slider';
import moment from 'moment';
import { Button } from '../ui/button';
import { FastForward, Pause, Play, TimerReset } from 'lucide-react';
import { useFrame } from '@react-three/fiber';
import { useAnimationFrame } from './TimelineFunctions';
import { Html } from '@react-three/drei';

export default function TimeHandler({
  className,
  timer,
}: {
  className?: string;
  timer: any;
}) {
  const timeParams = useSelector((state: RootState) => state.time);
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const timeScaleTextRef = React.useRef<HTMLHeadingElement>(null);
  const dateTextRef = React.useRef<HTMLHeadingElement>(null);
  const timeTextRef = React.useRef<HTMLHeadingElement>(null);

  useFrame(() => {
    if (timeScaleTextRef.current)
      timeScaleTextRef.current.textContent = `x${timeParams.timeScale.toFixed(0)}`;
    if (dateTextRef.current)
      dateTextRef.current.textContent = moment(timer.current.now())
        .utc()
        .format('ll');
    if (timeTextRef.current)
      timeTextRef.current.textContent = moment(timer.current.now())
        .utc()
        .format('HH:mm:ss');
  });

  return (
    <Html
      fullscreen
      zIndexRange={[1000, 1001]}
      className='relative w-full flex flex-row pointer-events-none *:pointer-events-auto'
    >
      {!settings.overlay['hidden'] && (
        <div
          id='onboarding-time-handler'
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          onWheel={(e) => {
            e.stopPropagation();
          }}
          className={cn(
            className,
            'absolute bottom-0 left-0 pointer-evens-auto aspect-square w-[150px] _bg-red-500/50 flex flex-col shrink-0 p-3 border-t-2 border-r-2 rounded-tr-lg [&>*]:my-1 bg-background/50 backdrop-blur-lg',
            // '[&>*]:border-red-500 [&>*]:border-[1px] [&>*]:border-dashed',
          )}
        >
          <div className='w-full _flex-1 _bg-blue-500/50 flex justify-center relative'>
            <CustomSlider
              defaultValue={[1]}
              min={1}
              max={100}
              value={[timeParams.sliderTimeScale]}
              onValueChange={(value) => {
                dispatch(
                  setTimeScale({ timeScale: value[0], isFromSlider: true }),
                );
              }}
            />
          </div>
          {/* <TextInfo timeScale={timeParams.timeScale.toFixed(0)} timer={timer} /> */}
          {/* <TextInfoTwo
        timeScale={timeParams.timeScale.toFixed(0)}
        date={moment(timer.current.now()).utc().format('ll')}
        time={moment(timer.current.now()).utc().format('HH:mm:ss')}
      /> */}
          <div className='_flex-[2_2_0%] flex flex-col items-center justify-center text-xs font-medium select-none'>
            <h2 ref={timeScaleTextRef} />
            <h2 ref={dateTextRef} />
            <h2 className='tabular-nums' ref={timeTextRef} />
          </div>
          <div className='_flex-1 flex flex-row gap-1.5 [&>*]:h-8 justify-between'>
            <Button
              variant='outline'
              className='p-0 pl-[6px] pr-2 flex flex-row justify-center items-center gap-[5px]'
              onClick={() => {
                timer.current.config({ time: Date.now() });
                dispatch(setTimeScale({ timeScale: 1, isFromSlider: true }));
              }}
            >
              {/* <TimerReset className='h-5 w-5' strokeWidth={1.5} /> */}
              <TimerReset className='h-[18px] w-[18px]' strokeWidth={1.25} />
              <span className=' font-extralight'>Now</span>
            </Button>
            <div className='grow' />
            <Button
              variant='outline'
              className='aspect-square p-0'
              onClick={() => {
                dispatch(setPaused({ paused: !timeParams.paused }));
              }}
            >
              {timeParams.paused ? (
                <Play className='h-5 w-5' strokeWidth={1.5} />
              ) : (
                <Pause className='h-5 w-5' strokeWidth={1.5} />
              )}
            </Button>
            {/* <Button
              variant='outline'
              className='aspect-square p-0'
              onClick={() => {
                dispatch(setPaused({ paused: false }));
              }}
            >
              <Play className='h-5 w-5' strokeWidth={1.5} />
            </Button> */}
          </div>
        </div>
      )}
    </Html>
  );
}

const TextInfoTwo: React.FC<{
  timeScale: number | string;
  date: string;
  time: string;
}> = ({ timeScale, date, time }) => {
  const [, forceUpdate] = React.useReducer((x) => -x, 0);

  useAnimationFrame(() => {
    forceUpdate();
  });

  return (
    <div className='_flex-[2_2_0%] flex flex-col items-center justify-center text-xs font-medium select-none'>
      <h2>x{timeScale}</h2>
      <h2>{date}</h2>
      <h2 className='tabular-nums'>{time} UTC</h2>
    </div>
  );
};

const TextInfo: React.FC<{
  timeScale: number | string;
  timer: any;
}> = ({ timeScale, timer }) => {
  const [, forceUpdate] = React.useReducer((x) => -x, 0);

  useAnimationFrame(() => {
    forceUpdate();
  });

  return (
    <div className='_flex-[2_2_0%] flex flex-col items-center justify-center text-xs font-medium select-none'>
      <h2>x{timeScale}</h2>
      <h2>{moment(timer.current.now()).utc().format('ll')}</h2>
      <h2 className='tabular-nums'>
        {moment(timer.current.now()).utc().format('HH:mm:ss')} UTC
      </h2>
    </div>
  );
};

const CustomSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none overflow-visible cursor-pointer',
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className='relative h-[22px] w-full grow overflow-hidden bg-secondary mx-[11p]'
      style={{ clipPath: 'polygon(0 50%, 100% 0, 100% 100%)' }}
    >
      <SliderPrimitive.Range
        className='absolute h-full bg-primary'
        style={{ marginRight: 6 }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className='relative inline-block h-[26px] !w-0 transition-colors focus-visible:outline-none _focus-visible:ring-2 _focus-visible:ring-ring _focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 '>
      {/* <svg
        id='th-cursor'
        className=' pointer-events-auto cursor-pointer scale-x-75 z-10'
        viewBox='0 0 1 1'
      >
        <polygon
          points='0 0 1 0 0.5 1'
          fill={false ? '#11ff11' : '#00dd11'}
          stroke={false ? '#00ff00' : '#00aa22'}
          strokeWidth={0.07}
          strokeLinejoin='round'
        />
      </svg> */}
      <div className='absolute -left-[3px] -top-[2px]  m-auto_ w-[6px] h-full rounded-full bg-white active:bg-[#aaaaaa]' />
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
));

Slider.displayName = SliderPrimitive.Root.displayName;

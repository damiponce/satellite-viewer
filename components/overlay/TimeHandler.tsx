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

export default function TimeHandler({
  className,
  timer,
}: {
  className?: string;
  timer: any;
}) {
  const timeParams = useSelector((state: RootState) => state.time);
  const dispatch = useDispatch();

  const [, forceUpdate] = React.useReducer((x) => -x, 0);
  useAnimationFrame(() => {
    forceUpdate();
  });

  return (
    <div
      className={cn(
        className,
        'pointer-evens-auto aspect-square w-[150px] _bg-red-500/50 flex flex-col shrink-0 p-3 border-t-2 border-r-2 rounded-tr-lg [&>*]:my-1 bg-background/50 backdrop-blur-lg',
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
            dispatch(setTimeScale({ timeScale: value[0], isFromSlider: true }));
          }}
        />
      </div>
      <div className='_flex-[2_2_0%] flex flex-col items-center justify-center text-xs font-medium select-none'>
        <h2>x{timeParams.timeScale.toFixed(0)}</h2>
        <h2>{moment(timer.current.now()).utc().format('ll')}</h2>
        <h2 className='tabular-nums'>
          {moment(timer.current.now()).utc().format('HH:mm:ss')} UTC
        </h2>
      </div>
      <div className='_flex-1 flex flex-row gap-1.5 [&>*]:h-8 justify-between'>
        <Button
          variant='outline'
          className='aspect-square p-0'
          onClick={() => {
            timer.current.config({ time: Date.now() });
            dispatch(setTimeScale({ timeScale: 1, isFromSlider: true }));
          }}
        >
          <TimerReset className='h-5 w-5' strokeWidth={1.5} />
        </Button>
        <div className='grow' />
        <Button
          variant='outline'
          className='aspect-square p-0'
          onClick={() => {
            dispatch(setPaused({ paused: true }));
          }}
        >
          <Pause className='h-5 w-5' strokeWidth={1.5} />
        </Button>
        <Button
          variant='outline'
          className='aspect-square p-0'
          onClick={() => {
            dispatch(setPaused({ paused: false }));
          }}
        >
          <Play className='h-5 w-5' strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}

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

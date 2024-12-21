'use client';
import { cn } from '@/lib/utils';
import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { setPaused, setTime, setTimeScale } from '@/lib/time/timeSlice';
import moment from 'moment';
import { FastForward, Pause, Play, TimerReset } from 'lucide-react';
import { useFrame } from '@react-three/fiber';
import { useAnimationFrame } from './TimelineFunctions';
import {
  Container,
  Fullscreen,
  Text,
  Icon,
  Svg,
  TextRef,
} from '@react-three/uikit';
import { Defaults, DialogAnchor, Slider } from '@react-three/uikit-default';
import { Html } from '@react-three/drei';

export default function TimeHandler({
  className,
  timer,
}: {
  className?: string;
  timer: any;
}) {
  const timeParams = useSelector((state: RootState) => state.time);
  const dispatch = useDispatch();

  const timeScaleTextRef = React.useRef<string>('');
  const dateTextRef = React.useRef<string>('');
  const timeTextRef = React.useRef<string>('');

  const h2Ref = React.useRef<HTMLHeadingElement>(null);

  useFrame(() => {
    if (h2Ref.current)
      h2Ref.current.textContent = moment(timer.current.now())
        .utc()
        .format('HH:mm:ss');
    // timeScaleTextRef.current = `x${timeParams.timeScale}`;
    // dateTextRef.current = moment(timer.current.now()).utc().format('ll');
    // timeTextRef.current = moment(timer.current.now()).utc().format('HH:mm:ss');
  });

  return (
    <Fullscreen inset={0} positionType={'relative'}>
      <Container
        positionType={'absolute'}
        aspectRatio={1}
        width={150}
        height={150}
        flexDirection='column'
        positionLeft={0}
        positionBottom={0}
        backgroundColor='#000'
      >
        <Container
          width='100%'
          flexDirection='column'
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Html className='w-full'>
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
          </Html>
          {/* <Slider
            defaultValue={1}
            min={1}
            max={100}
            value={timeParams.sliderTimeScale}
            onValueChange={(value) => {
              dispatch(setTimeScale({ timeScale: value, isFromSlider: true }));
            }}
          /> */}
        </Container>
        <Container
          flexDirection='column'
          justifyContent={'center'}
          alignItems={'center'}
        >
          {/* <Text color='white'>{timeScaleTextRef.current}</Text>
          <Text color='white'>{dateTextRef.current}</Text>
          <Text color='white'>{timeTextRef.current}</Text> */}
          <Html>
            <h2 ref={h2Ref}></h2>
          </Html>
        </Container>
      </Container>
    </Fullscreen>
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

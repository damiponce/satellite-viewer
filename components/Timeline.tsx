'use client';
import React from 'react';

import {
  dtp,
  subdivide,
  minDistance,
  closestInterval,
  startOfInterval,
  useAnimationFrame,
} from './TimelineFunctions';

import { cn } from '@/lib/utils';
import { lerp } from '@/lib/lerp-min.js';

import moment from 'moment';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { setPaused } from '@/lib/time/timeSlice';

export default function Timeline({
  className,
  timer,
}: {
  className?: string;
  timer: any;
}) {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const timeParams = useSelector((state: RootState) => state.time);
  const dispatch = useDispatch();

  const tlDelta = React.useRef(86400); // Time delta in seconds

  const cursorStartPos = 1 / 3;
  const cursorPos = React.useRef(cursorStartPos);
  const [cursorHeld, setCursorHeld] = React.useState(false);

  const timelineStart = React.useRef(
    moment(timer.now()).subtract(tlDelta.current * cursorStartPos, 'seconds'),
  );
  const timelineEnd = React.useRef(
    moment(timer.now()).add(tlDelta.current * (1 - cursorStartPos), 'seconds'),
  );

  const smallTicks = React.useRef<number[]>([]);
  const mediumTicks = React.useRef<number[]>([]);
  const largeTicks = React.useRef<number[]>([]);
  const largeTickDates = React.useRef<moment.Moment[]>([]);

  const tlContainerRef = React.useRef<HTMLDivElement>(null);

  const intvl = React.useRef({
    seconds: 5,
    sm: 12,
    md: 1,
  });

  const following = React.useRef(true);

  function ticksCalculations() {
    let _largeTicks: number[] = [];
    let _largeTickDates: moment.Moment[] = [];
    let i = 0;
    while (i >= 0) {
      const _t = startOfInterval(timelineStart.current, intvl.current.seconds)
        .add(intvl.current.seconds * i, 'seconds')
        .valueOf();
      _largeTicks.push(
        lerp.s.pt(timelineStart.current, timelineEnd.current, 0, 1, _t),
      );
      _largeTickDates.push(moment(_t));
      if (_t > timelineEnd.current.valueOf()) i = -1;
      else i++;
    }
    let _smallTicks: number[] = [];
    let _mediumTicks: number[] = [];
    for (let i = 0; i <= _largeTicks.length; i++) {
      _smallTicks.push(
        ...subdivide(
          (tlDelta.current / intvl.current.seconds > 6 ? 1 : 2) *
            intvl.current.sm -
            1,
          _largeTicks[i],
          _largeTicks[i + 1],
        ),
      );
      _mediumTicks.push(
        ...subdivide(intvl.current.md, _largeTicks[i], _largeTicks[i + 1]),
      );
    }

    smallTicks.current = _smallTicks;
    mediumTicks.current = _mediumTicks;
    largeTicks.current = _largeTicks;
    largeTickDates.current = _largeTickDates;
  }

  function trackingTimeline() {
    timelineStart.current = moment(timer.now()).add(
      -tlDelta.current * cursorStartPos,
      'seconds',
    );
    timelineEnd.current = moment(timer.now()).add(
      tlDelta.current * (1 - cursorStartPos),
      'seconds',
    );

    ticksCalculations();
  }

  function paginatedTimeline() {
    if (moment(timer.now()) > timelineEnd.current) {
      timelineStart.current = timelineStart.current
        .clone()
        .add(tlDelta.current, 'seconds');
      timelineEnd.current = timelineEnd.current
        .clone()
        .add(tlDelta.current, 'seconds');
    }

    cursorPos.current = lerp.s.pt(
      timelineStart.current,
      timelineEnd.current,
      0,
      1,
      moment(timer.now()),
    );

    ticksCalculations();
  }

  useAnimationFrame(() => {
    forceUpdate();
    intvl.current = closestInterval(tlDelta.current);

    if (following.current) {
      trackingTimeline();
    } else {
      paginatedTimeline();
    }
  });

  function handleCursorHeld(
    e:
      | React.MouseEvent<SVGSVGElement>
      | React.TouchEvent<SVGSVGElement>
      | MouseEvent
      | TouchEvent,
  ) {
    e.preventDefault();
    e = e as MouseEvent | TouchEvent;
    if ((e as MouseEvent).buttons === 1 || e instanceof TouchEvent) {
      var clientX: number;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
      } else {
        clientX = e.touches[0].clientX;
      }

      const rect = tlContainerRef.current!.getBoundingClientRect(); //! !//
      const offsetX = clientX - rect.left;
      var mousePos = offsetX / rect.width;

      const timeAtMousePos = moment(
        lerp.s.pt(
          0,
          1,
          timelineStart.current.valueOf(),
          timelineEnd.current.valueOf(),
          mousePos,
        ),
      );

      // if (mousePos < 0 || mousePos > 1) return;

      const a = 1;
      if (mousePos < 0.05) {
        if (mousePos < 0.005) mousePos = 0.005;
        timelineStart.current = timelineStart.current
          .clone()
          .subtract((0.05 - mousePos) * tlDelta.current * a, 'seconds');
        timelineEnd.current = timelineEnd.current
          .clone()
          .subtract((0.05 - mousePos) * tlDelta.current * a, 'seconds');
      } else if (mousePos > 0.95) {
        if (mousePos > 0.995) mousePos = 0.995;
        timelineStart.current = timelineStart.current
          .clone()
          .add((mousePos - 0.95) * tlDelta.current * a, 'seconds');
        timelineEnd.current = timelineEnd.current
          .clone()
          .add((mousePos - 0.95) * tlDelta.current * a, 'seconds');
      }
      timer.config({ time: timeAtMousePos.valueOf() });
    }
  }

  function handleCursorDown(
    e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>,
  ) {
    following.current = false;
    setCursorHeld(true);
    dispatch(setPaused({ paused: true }));

    const abortSignal = new AbortController();
    document.addEventListener(
      'mouseup',
      () => {
        abortSignal.abort();
        setCursorHeld(false);
        dispatch(setPaused({ paused: false }));
      },
      {
        once: true,
      },
    );
    document.addEventListener(
      'touchend',
      () => {
        abortSignal.abort();
        setCursorHeld(false);
        dispatch(setPaused({ paused: false }));
      },
      {
        once: true,
      },
    );
    document.addEventListener('mousemove', handleCursorHeld, {
      signal: abortSignal.signal,
    });
    document.addEventListener('touchmove', handleCursorHeld, {
      signal: abortSignal.signal,
    });
  }

  return (
    <div
      id='tl-container'
      ref={tlContainerRef}
      className={cn(
        className,
        'w-full h-8 border-red-500/30-border-t-[1px] pointer-events-auto ',
      )}
      onWheel={(e) => {
        const exp = 1.15;
        const delta = e.deltaY > 0 ? exp : 1 / exp;
        tlDelta.current *= delta;
        const rect = tlContainerRef.current!.getBoundingClientRect(); //! !//
        const offsetX = e.clientX - rect.left;
        const mousePos = offsetX / rect.width;
        const timeAtMousePos = moment(
          lerp.s.pt(
            0,
            1,
            timelineStart.current.valueOf(),
            timelineEnd.current.valueOf(),
            mousePos,
          ),
        );
        timelineStart.current = timeAtMousePos
          .clone()
          .add(-tlDelta.current * mousePos, 'seconds');
        timelineEnd.current = timeAtMousePos
          .clone()
          .add(tlDelta.current * (1 - mousePos), 'seconds');
      }}
    >
      {false && (
        <div className='absolute left-2 bottom-9 text-sm font-mono flex flex-row gap-10 items-end '>
          <p>
            now: {moment(timer.now()).format()}
            <br />
            sta: {timelineStart.current.format()}
            <br />
            end: {timelineEnd.current.format()}
          </p>
          {false && (
            <p>
              ms(real): {moment().milliseconds()}
              <br />
              diff: -
              {/* diff: {moment(timer.now()).diff(new Date(), 'milliseconds')} */}
              <br />
              ms(hypr): {moment(timer.now()).milliseconds()}
            </p>
          )}
          <p>
            tlDelta[s]: {tlDelta.current.toFixed(2)}
            <br />
            interval[s]: {intvl.current.seconds}
          </p>
          <p>
            ratio: {(tlDelta.current / intvl.current.seconds).toFixed(2)}
            <br />
            gap: {(minDistance(smallTicks.current) * innerWidth).toFixed(2)}
          </p>
          <p>
            sm: {intvl.current.sm}
            <br />
            md: {intvl.current.md}
          </p>
          <p>
            {timeParams.paused && 'paused'}
            <br />
            {following.current ? 'follow' : 'pages'}{' '}
          </p>
          <p className='w-[400px]'>
            largeTicks
            <br />
            {largeTicks.current.map((n) => n.toFixed(4)).join(', ')}
          </p>
        </div>
      )}
      <svg
        id='tl-cursor'
        className='absolute bottom-0 h-5 bg-red-500/0 p-1 pb-0 pointer-events-auto -translate-x-[50%] cursor-pointer z-10'
        // prettier-ignore
        style={{left: dtp(cursorPos.current)}}
        viewBox='0 0 1 1'
        onMouseDown={handleCursorDown}
        onTouchStart={handleCursorDown}
      >
        <polygon
          points='0 0 1 0 0.5 1'
          fill={cursorHeld ? '#3333ff' : '#0000ff'}
          stroke={cursorHeld ? '#0000ff' : '#000088'}
          strokeWidth={0.07}
        />
      </svg>

      <svg
        className='w-full h-full select-none '
        style={{
          maskImage:
            'linear-gradient(90deg, rgba(255,0,0,0) 0%, rgba(255,0,0,1) 5%, rgba(255,0,0,1) 95%, rgba(255,0,0,0) 100%) ',
        }}
      >
        {smallTicks.current.map(
          (p) =>
            p >= 0 &&
            p <= 1 && (
              <line
                key={`small-tick${p.toFixed(6)}`}
                x1={dtp(p)}
                x2={dtp(p)}
                y1={dtp(1 - 0.25)}
                y2='100%'
                stroke='grey'
                strokeWidth='1'
              />
            ),
        )}
        {mediumTicks.current.map(
          (p) =>
            p >= 0 &&
            p <= 1 && (
              <line
                key={`medium-tick${p.toFixed(6)}`}
                x1={dtp(p)}
                x2={dtp(p)}
                y1={dtp(1 - 0.35)}
                y2='100%'
                stroke='grey'
                strokeWidth='1'
              />
            ),
        )}
        {largeTicks.current.map(
          (p) =>
            p >= 0 &&
            p <= 1 && (
              <line
                key={`large-tick${p.toFixed(6)}`}
                x1={dtp(p)}
                x2={dtp(p)}
                y1={dtp(1 - 0.5)}
                y2='100%'
                stroke='white'
                strokeWidth='1'
              />
            ),
        )}
        {largeTickDates.current.map((d, i) => (
          <text
            key={`large-tick-date${d.format()}`}
            x={dtp(largeTicks.current[i])}
            y='100%'
            dy='-60%'
            textAnchor='middle'
            fontSize='0.6em'
            fill='white'
            className='select-none'
          >
            {d.format('ll HH:mm:ss.SSS')}
          </text>
        ))}
      </svg>
    </div>
  );
}

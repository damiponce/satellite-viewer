import React from 'react';

export function dtp(p: number) {
  return `${p * 100}%`;
}

export function subdivide(n: number, start: number, end: number): number[] {
  let step = (end - start) / (n + 1);
  let result = [];
  for (let i = 1; i <= n; i++) {
    result.push(start + step * i);
  }
  return result;
}

export function minDistance(arr: number[]) {
  if (arr.length < 2) return 0;
  return arr[1] - arr[0];
}

export const largeTickIntervals = [
  { seconds: 5, sm: 12, md: 1 }, //    5s
  { seconds: 10, sm: 12, md: 1 }, //    10s
  { seconds: 15, sm: 12, md: 1 }, //    15s
  { seconds: 30, sm: 12, md: 1 }, //    30s
  { seconds: 60, sm: 12, md: 1 }, //    60s
  { seconds: 120, sm: 12, md: 1 }, //    2m (120s)
  { seconds: 300, sm: 12, md: 1 }, //    5m (300s)
  { seconds: 600, sm: 12, md: 1 }, //    10m (600s)
  { seconds: 900, sm: 12, md: 1 }, //    15m (900s)
  { seconds: 1800, sm: 12, md: 1 }, //    30m (1800s)
  { seconds: 3600, sm: 12, md: 1 }, //    60m (3600s)
  { seconds: 7200, sm: 12, md: 1 }, //    2h (7200s) (120m)
  { seconds: 14400, sm: 18, md: 1 }, //    4h (14400s) (240m)
  { seconds: 21600, sm: 24, md: 2 }, //    6h (21600s) (360m)
  { seconds: 43200, sm: 24, md: 1 }, //    12h (43200s) (720m)
  { seconds: 86400, sm: 24, md: 1 }, //    24h (86400s) (1440m)
  { seconds: 172800, sm: 24, md: 1 }, //    2d (172800s) (2880m) (48h)
  { seconds: 345600, sm: 24, md: 3 }, //    4d (345600s) (5760m) (96h)
  { seconds: 604800, sm: 28, md: 6 }, //    7d (604800s) (10080m) (168h)
  { seconds: 1296000, sm: 28, md: 14 }, //    15d (1296000s) (21600m) (360h)
];

export function intervals() {
  const windowWidth = window.innerWidth;
  let intervals = 2;
  if (windowWidth > 1600) {
    //? probably should make tl's max-w 2000px~
    intervals = 8;
  } else if (windowWidth > 1250) {
    intervals = 6;
  } else if (windowWidth > 900) {
    intervals = 4;
  }
  return intervals;
}

export function closestInterval(tlDelta: number): {
  seconds: number;
  sm: number;
  md: number;
} {
  const maxIntervals = intervals();

  let i = 0;
  let closest = largeTickIntervals[0];
  while (tlDelta / closest.seconds > maxIntervals) {
    i++;
    closest = largeTickIntervals[i];
  }

  return closest;
}

export function startOfInterval(
  date: moment.Moment,
  seconds: number,
): moment.Moment {
  if (seconds > 604800) {
    const roundedWeeks =
      Math.floor(date.week() / (seconds / 604800)) * (seconds / 604800);
    return date
      .clone()
      .week(roundedWeeks)
      .startOf('week')
      .hours(0)
      .minutes(0)
      .seconds(0)
      .milliseconds(0);
  } else if (seconds > 86400) {
    const roundedDays =
      Math.floor(date.date() / (seconds / 86400)) * (seconds / 86400);
    return date
      .clone()
      .date(roundedDays)
      .hours(0)
      .minutes(0)
      .seconds(0)
      .milliseconds(0);
  } else if (seconds > 3600) {
    const roundedHours =
      Math.floor(date.hours() / (seconds / 3600)) * (seconds / 3600);
    return date
      .clone()
      .hours(roundedHours)
      .minutes(0)
      .seconds(0)
      .milliseconds(0);
  } else if (seconds > 60) {
    const roundedMinutes =
      Math.floor(date.minutes() / (seconds / 60)) * (seconds / 60);
    return date.clone().minutes(roundedMinutes).seconds(0).milliseconds(0);
  } else {
    const roundedSeconds = Math.floor(date.seconds() / seconds) * seconds;
    return date.clone().seconds(roundedSeconds).milliseconds(0);
  }
}

export const useAnimationFrame = (callback: any) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = React.useRef(0);
  const previousTimeRef = React.useRef(0);

  const animate = (time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }); // Make sure the effect runs only once
};

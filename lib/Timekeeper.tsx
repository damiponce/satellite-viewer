import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './redux/store';
import hypertimer from 'hypertimer';

var timer = hypertimer({
  rate: 1,
  time: Date.now(),
  paced: true,
});
// console.log('TIMER CREATED HOPEFULLY JUST ONCE OR TWICE');

export default function Timekeeper({
  deltaMs,
  set,
}: {
  deltaMs: number;
  set?: (timer: any) => void;
}) {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const timeParams = useSelector((state: RootState) => state.time);
  const dispatch = useDispatch();

  const setterIterFunc = React.useCallback(() => {
    return timer.setInterval(() => {
      set && set(timer);
    }, deltaMs);
  }, [deltaMs, set]);

  const [setterIter, setSetterIter] = React.useState<NodeJS.Timeout | null>(
    setterIterFunc(),
  );

  React.useEffect(() => {
    // console.info('Timekeeper useEffect paused', timeParams.paused);
    forceUpdate();
    if (timeParams.paused) {
      if (timer.running) {
        timer.clearInterval(setterIter);
        timer.pause();
      }
    } else {
      if (!timer.running) {
        setSetterIter(setterIterFunc());
        timer.continue();
      }
    }

    //@ts-nocheck
  }, [timeParams.paused]);

  React.useEffect(() => {
    // console.info('Timekeeper useEffect scale', timeParams.timeScale);
    forceUpdate();
    timer.config({ rate: timeParams.timeScale });
  }, [timeParams.timeScale]);

  return <></>;
}

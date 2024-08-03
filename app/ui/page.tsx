'use client';
import React from 'react';

import { store } from '@/lib/redux/store';
import { Provider } from 'react-redux';

import Overlay from '@/components/overlay/Overlay';
import Timekeeper from '@/lib/Timekeeper';

import hypertimer from 'hypertimer';

export default function Page() {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const timer = React.useRef(
    hypertimer({
      rate: 1,
      time: Date.now(),
      paced: true,
    }),
  );

  return (
    <Provider store={store}>
      <Overlay timer={timer} />
      <Timekeeper
        deltaMs={10}
        set={(t) => {
          timer.current = t;
          forceUpdate();
        }}
      />
    </Provider>
  );
}

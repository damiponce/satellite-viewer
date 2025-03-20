import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import styles from '@/app/loading.module.scss';
import { cn } from '@/lib/utils';

const LoadingContext = createContext({
  isLoading: true,
  addLoadingTask: (taskId: string) => {},
  completeLoadingTask: (taskId: string) => {},
});

const TASKS = {
  'earth-textures': 'Loading Earth textures',
  'satellite-data': 'Fetching satellite data',
};

export const LoadingProvider = ({ children }: { children: any }) => {
  const [pendingTasks, setPendingTasks] = useState<Set<string>>(
    new Set(['earth-textures', 'satellite-data']),
  );

  const addLoadingTask = useCallback((taskId: string) => {
    setPendingTasks((prev) => new Set(prev).add(taskId));
  }, []);

  const completeLoadingTask = useCallback((taskId: string) => {
    setPendingTasks((prev) => {
      const newTasks = new Set(prev);
      newTasks.delete(taskId);
      return newTasks;
    });
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading: pendingTasks.size > 0, //false
        addLoadingTask,
        completeLoadingTask,
      }}
    >
      {/* {false && ( */}
      {pendingTasks.size > 0 && (
        <div className='absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 text-white z-[500000]'>
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2]'>
            <h2 className='text-6xl font-bold text-center'>SatView</h2>
            {/* <h3 className='text-xs font-mono text-center text-red-500/75 '>
              [WORK IN PROGRESS]
            </h3> */}
          </div>
          <div
            className={cn(
              'absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2]',
              'bottom-[7vh] text-center space-y-4 flex flex-col justify-center items-center',
            )}
          >
            <div className='text-normal font-medium flex flex-col'>
              {true
                ? Array.from(pendingTasks).map(
                    (task) =>
                      Object.keys(TASKS).indexOf(task) !== -1 && (
                        <h2 key={task}>{TASKS[task as keyof typeof TASKS]}</h2>
                      ),
                  )
                : Object.keys(TASKS).indexOf(Array.from(pendingTasks)[0]) !==
                    -1 && (
                    <h2>
                      {TASKS[Array.from(pendingTasks)[0] as keyof typeof TASKS]}
                    </h2>
                  )}
            </div>
            <div className={styles.demo_container}>
              <div className={styles.progress_bar}>
                <div className={styles.progress_bar_value}></div>
              </div>
            </div>
            <h3 className='text-xs font-normal text-zinc-400 '>
              Thanks for waiting :3
            </h3>
          </div>
          <div className='absolute inset-0 bg-zinc-950 z-[1] animate-pulse' />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

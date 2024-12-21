import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RootState } from '@/lib/redux/store';
import { SatellitesType } from '@/lib/satellites/satellite';
import {
  addRawSatellite,
  removeSatellite,
} from '@/lib/satellites/satelliteSlice';
import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash';
import { Plus, X } from 'lucide-react';
import React, { Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

export default function SatelliteListPanel() {
  const dispatch = useDispatch();
  const satellites = useSelector((state: RootState) => state.satellites);

  return (
    <div className='flex flex-col gap-4'>
      <Tabs defaultValue='singles' className='min-w-[300px]'>
        <TabsList className='grid w-full grid-cols-2 bg-muted/30 backdrop-blur-lg backdrop-brightness-150 '>
          <TabsTrigger value='singles'>Singles</TabsTrigger>
          <TabsTrigger value='groups'>Groups</TabsTrigger>
        </TabsList>
        <TabsContent value='singles'>
          <div className='flex flex-row mb-4_'>
            <Input
              type='text'
              className='rounded-tr-none rounded-br-none focus-visible:ring-1 border-r-0'
              placeholder='NORAD ID, name, etc.'
              disabled
            />
            <Button
              type='submit'
              className='aspect-square p-0 rounded-tl-none rounded-bl-none '
              variant='outline'
              disabled
            >
              <Plus className='h-5 w-5' />
            </Button>
          </div>
        </TabsContent>
        <TabsContent value='groups'>
          <div className='flex flex-row mb-4_'>
            <Input
              type='text'
              className='rounded-tr-none rounded-br-none focus-visible:ring-1 border-r-0'
              placeholder='NORAD ID, name, etc.'
              disabled
            />
            <Button
              type='submit'
              className='aspect-square p-0 rounded-tl-none rounded-bl-none '
              variant='outline'
              disabled
            >
              <Plus className='h-5 w-5' />
            </Button>
          </div>
          <Suspense fallback={null}>
            <SatList
              satellites={satellites}
              dispatch={dispatch}
              // selections={selections}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const SatList = ({
  satellites,
  dispatch,
  // selections,
}: {
  satellites: SatellitesType;
  dispatch: Dispatch<UnknownAction>;
  // selections: any;
}) => (
  <div className='flex flex-col flex-nowrap gap-4 max-h-[40vh] overflow-y-scroll'>
    {satellites.length > 0 ? (
      satellites.map((satellite) => (
        <div
          key={`sat-list-${satellite.object_id}`}
          className='flex flex-row h-5 items-center '
        >
          {/* <Checkbox
            className='h-5 w-5 '
            checked={satellite.visible}
            onCheckedChange={() => {
              dispatch(
                setVisible({
                  noradId: satellite.noradId,
                  visible: !satellite.visible,
                }),
              );
            }}
          /> */}
          <Label
            className='font-normal mx-2 mr-6 w-full _flex _flex-row _items-center'
            htmlFor='airplane-mode'
          >
            {satellite.object_name}
            <span className='ml-[0.3rem] text-[0.6rem] font-semibold text-muted-foreground'>
              {false && (
                <span className='text-[0.5rem]'>
                  NORAD
                  <br />
                </span>
              )}
              {satellite.object_id}
            </span>
          </Label>

          {/* <Button
            variant='secondary'
            className='h-5 aspect-square bg-transparent p-0 ml-1'
            onClick={() => {
              dispatch(
                toggleInfo({
                  id: satellite.object_id,
                }),
              );
            }}
          >
            <Info
              className={cn(
                'h-4 w-4',
                selections.info.id === satellite.object_id
                  ? ''
                  : 'stroke-muted-foreground/50',
              )}
              strokeWidth={1.75}
            />
          </Button> */}
          {/* <Button
            variant='secondary'
            className='h-5 aspect-square bg-transparent p-0 ml-1'
            // disabled={!satellite.visible}
            onClick={() => {
              dispatch(
                toggleFocused({
                  id: satellite.object_id,
                }),
              );
            }}
          >
            <ScanEye
              className={cn(
                'h-4 w-4',
                selections.focused.id === satellite.object_id
                  ? ''
                  : 'stroke-muted-foreground/50',
              )}
              strokeWidth={1.75}
            />
          </Button> */}
          <Button
            variant='secondary'
            className='h-5 aspect-square bg-transparent p-0 ml-1'
            onClick={() => {
              const satClone = cloneDeep(satellite);
              const satIndex = satellites.findIndex(
                (s) => s.object_id === satellite.object_id,
              );
              dispatch(
                removeSatellite({
                  object_id: satellite.object_id,
                }),
              );
              toast('Satellite removed', {
                action: {
                  label: 'Undo',
                  onClick: () => {
                    if (
                      satellites.findIndex((s) => s.object_id === satIndex) > -1
                    )
                      return;
                    dispatch(
                      addRawSatellite({
                        satellite: satClone,
                        index: satIndex,
                      }),
                    );
                  },
                },
                closeButton: false,
              });
            }}
          >
            <X className='h-4 w-4' strokeWidth={1.75} />
          </Button>
        </div>
      ))
    ) : (
      <p className='text-sm text-muted-foreground/50 h-5'>
        No satellites added.
      </p>
    )}
  </div>
);

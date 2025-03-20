import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupType } from '@/lib/groups/group';
import { addGroup, removeGroup, setGroup } from '@/lib/groups/groupSlice';
import { loadJsonData } from '@/lib/idb/storage';
import { RootState } from '@/lib/redux/store';
import { SatellitesType } from '@/lib/satellites/satellite';
import {
  addRawSatellite,
  addSatellitesFromDB,
  removeSatellite,
} from '@/lib/satellites/satelliteSlice';
import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { cloneDeep, update } from 'lodash';
import { Plus, X } from 'lucide-react';
import React, { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

export default function SatelliteListPanel() {
  const dispatch = useDispatch();
  const groups = useSelector((state: RootState) => state.groups);
  const [groupInput, setGroupInput] = React.useState<string>('');

  return (
    <div className='flex flex-col gap-4 -mt-2'>
      <Tabs defaultValue='groups' className='min-w-[200px]'>
        {/* <TabsList className='grid w-full grid-cols-2 bg-muted/30 backdrop-blur-lg backdrop-brightness-150 '>
          <TabsTrigger value='groups'>Groups</TabsTrigger>
          <TabsTrigger value='singles' disabled>
            Singles
          </TabsTrigger>
        </TabsList> */}
        {/* <TabsContent value='singles'>
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
        </TabsContent> */}
        <TabsContent value='groups'>
          <div className='flex flex-row mb-4_'>
            <Input
              type='text'
              className='rounded-tr-none rounded-br-none border-r-0 focus-visible:ring-1 focus-visible:z-10'
              placeholder='NOAA, SAOCOM, etc.'
              value={groupInput}
              onChange={(e) => {
                setGroupInput(e.currentTarget.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (
                    groups.find(
                      (g) =>
                        g.name_filter === e.currentTarget.value.toUpperCase(),
                    )
                  ) {
                    toast.warning('Group filter already exists.');
                    setGroupInput('');
                    return;
                  }
                  dispatch(
                    addGroup({
                      name: e.currentTarget.value,
                      name_filter: e.currentTarget.value.toUpperCase(),
                    }),
                  );
                  toast.success('Group filter added.');
                  setGroupInput('');
                }
              }}
            />
            <Button
              type='submit'
              className='aspect-square p-0 rounded-tl-none rounded-bl-none focus-visible:ring-1 focus-visible:z-10'
              variant='outline'
              onClick={() => {
                if (
                  groups.find((g) => g.name_filter === groupInput.toUpperCase())
                ) {
                  toast.warning('Group filter already exists.');
                  setGroupInput('');
                  return;
                }
                dispatch(
                  addGroup({
                    name: groupInput,
                    name_filter: groupInput.toUpperCase(),
                  }),
                );
                toast.success('Group filter added.');
                setGroupInput('');
              }}
            >
              <Plus className='h-5 w-5' />
            </Button>
          </div>
          <Suspense fallback={null}>
            <SatGroupList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SatGroupList() {
  const dispatch = useDispatch();
  const satellites = useSelector((state: RootState) => state.satellites);
  const groups = useSelector((state: RootState) => state.groups);

  function getGroupCount(group: GroupType) {
    return satellites.filter((sat) =>
      sat.object_name.includes(group.name_filter),
    ).length;
  }

  return (
    <div className='flex flex-col flex-nowrap pt-2 gap-0 max-h-[20vh] overflow-y-scroll scrollbar-custom'>
      {groups.length > 0 ? (
        groups.map((group) => (
          <div
            key={`sat-group-${group.name}`}
            className='flex flex-row px-2 py-2 mr-2 items-center cursor-pointer hover:bg-muted/50 rounded-md'
            onClick={() => {
              dispatch(
                setGroup({
                  name: group.name,
                  enabled: !group.enabled,
                }),
              );
            }}
          >
            <Checkbox className='h-5 w-5 ' checked={group.enabled} />
            <Label className='font-medium mx-2 mr-6 w-full cursor-pointer'>
              {group.name}
              <span className='font-normal text-xs h-full text-muted-foreground/65 text-right w-min ml-[5px] cursor-pointer'>
                {'· '}
                {getGroupCount(group)}
              </span>
            </Label>
            {/* <Label className='font-normal text-xs text-muted-foreground/75 text-right mx-2 w-min cursor-pointer'>
              {getGroupCount(group)}
            </Label> */}
            {!group.deleteable && (
              <div className='ml-1 h-5 aspect-square p-0' />
            )}
            {group.deleteable && (
              <Button
                variant='secondary'
                className='h-5 aspect-square bg-transparent p-0 ml-1'
                onClick={() => {
                  // const groupsClone = cloneDeep(groups);
                  const groupsIndex = groups.findIndex(
                    (s) => s.name_filter === group.name_filter,
                  );
                  dispatch(
                    removeGroup({
                      name_filter: group.name_filter,
                    }),
                  );
                  toast.info('Group filter removed', {
                    action: {
                      label: 'Undo',
                      onClick: () => {
                        // !!!!!!!!!!
                        // if (
                        //   groups.findIndex(
                        //     (s) => s.name_filter === group.name_filter,
                        //   ) > -1
                        // )
                        //   return;
                        dispatch(
                          addGroup({
                            name: group.name,
                            name_filter: group.name_filter,
                            index: groupsIndex,
                          }),
                        );
                      },
                    },
                  });
                }}
              >
                <X className='h-4 w-4' strokeWidth={1.75} />
              </Button>
            )}
          </div>
        ))
      ) : (
        <p className='text-sm text-muted-foreground/50 h-5'>
          No group filters added.
        </p>
      )}
    </div>
  );
}

function SatList() {
  const dispatch = useDispatch();
  const satellites = useSelector((state: RootState) => state.satellites);

  return (
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
                        satellites.findIndex((s) => s.object_id === satIndex) >
                        -1
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
}

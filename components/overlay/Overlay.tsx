import React, { useEffect, useRef, useState, useReducer } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Satellite,
  Layers3,
  Map,
  Video,
  Plus,
  X,
  Eye,
  EyeOff,
  Info,
  TableProperties,
  ScanEye,
} from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import TooltipWrapper from '../TooltipWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { PopoverAnchor } from '@radix-ui/react-popover';
import _settings, { SettingsGroup } from '@/lib/settings/settings';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { update } from '@/lib/settings/settingsSlice';
import {
  addRawSatellite,
  removeSatellite,
  setVisible,
} from '@/lib/satellites/satelliteSlice';

import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';

import { toast } from 'sonner';
import { Toaster } from '../ui/sonner';

import { cloneDeep } from 'lodash';

import dynamic from 'next/dynamic';
import TimeHandler from './TimeHandler';
import { Toggle } from '../ui/toggle';
import { cn } from '@/lib/utils';
import {
  setInfo,
  toggleFocused,
  toggleInfo,
} from '@/lib/selections/selectionsSlice';

const Timeline = dynamic(() => import('./Timeline'), { ssr: false });

type SettingsPanelState = {
  isOpen: boolean;
  lastPanel: string;
};

type InfoPanelState = {
  isOpen: boolean;
};

function settingsPanelReducer(
  state: SettingsPanelState,
  action: { type: string; payload: any },
) {
  if (action.type === 'set_is_open') {
    return {
      ...state,
      isOpen: action.payload,
    };
  } else if (action.type === 'set_last_panel') {
    return {
      ...state,
      lastPanel: action.payload,
    };
  }
  throw Error('Unknown action.');
}

function infoPanelReducer(
  state: InfoPanelState,
  action: { type: string; payload: any },
) {
  if (action.type === 'set_is_open') {
    return {
      ...state,
      isOpen: action.payload,
    };
  } else if (action.type === 'toggle_is_open') {
    return {
      ...state,
      isOpen: !state.isOpen,
    };
  }
  throw Error('Unknown action.');
}

export default function Overlay({ timer }: { timer: any }) {
  const [isTogglesVisible, setIsTogglesVisible] = useState(true);

  const [settingsPanel, dispatchSettingsPanel] = useReducer(
    settingsPanelReducer,
    {
      isOpen: false,
      lastPanel: 'none',
    },
  );

  const [infoPanel, dispatchInfoPanel] = useReducer(infoPanelReducer, {
    isOpen: false,
  });

  const settings = useSelector((state: RootState) => state.settings);
  const selections = useSelector((state: RootState) => state.selections);
  const satellites = useSelector((state: RootState) => state.satellites);
  const dispatch = useDispatch();

  async function tryFetch(id: number) {
    const staticData = await fetch(
      `https://tle.ivanstanojevic.me/api/tle/${id}`,
      { cache: 'force-cache', next: { revalidate: 60 * 60 * 12 } },
    ).then((res) => {
      if (res.ok) return res.json();
      else {
        toast.error('An error has ocurred...', {
          description: `${res.status}: Error fetching data.`,
        });
        return null;
      }
    });
    // console.log(staticData);
  }

  // tryFetch(25544);

  // React.useEffect(() => {
  //   console.log('overlay ', timer, timer.getTime());
  // }, [timer.now()]);

  const infoSat = satellites.find((s) => s.noradId === selections.info.id);

  const [loaded, setLoaded] = useState(false);
  setTimeout(() => {
    setLoaded(true);
  }, 1500);
  if (!loaded) return null;

  return (
    <div className='inset-0 absolute z-10 pointer-events-none '>
      <Toaster richColors closeButton style={{ pointerEvents: 'auto' }} />
      <TooltipProvider>
        {isTogglesVisible && (
          <>
            {/* <div className='absolute bottom-0 w-full flex flex-row pointer-events-none *:pointer-events-auto'>
              <TimeHandler timer={timer} />
              <Timeline timer={timer} />
            </div> */}
            <div className='flex flex-col absolute top-2 left-2 pointer-events-auto'>
              <ToggleGroup
                className='_mb-2 justify-start'
                type='single'
                variant='outline'
                onValueChange={(value: string) => {
                  if (
                    (value === settingsPanel.lastPanel || value === '') &&
                    settingsPanel.isOpen
                  ) {
                    dispatchSettingsPanel({
                      type: 'set_is_open',
                      payload: false,
                    });
                  } else {
                    dispatchSettingsPanel({
                      type: 'set_is_open',
                      payload: true,
                    });

                    value !== '' &&
                      dispatchSettingsPanel({
                        type: 'set_last_panel',
                        payload: value,
                      });
                  }
                }}
              >
                <TooltipWrapper text='Satellite selection'>
                  <ToggleGroupItem
                    value='satellite_selection'
                    aria-label='Open satellite selection panel'
                  >
                    <Satellite className='h-5 w-5' />
                  </ToggleGroupItem>
                </TooltipWrapper>

                <TooltipWrapper text='Satellite elements'>
                  <ToggleGroupItem
                    value='satellite_elements'
                    aria-label='Open satellite elements panel'
                  >
                    <Layers3 className='h-5 w-5' />
                  </ToggleGroupItem>
                </TooltipWrapper>

                <TooltipWrapper text='Map'>
                  <ToggleGroupItem value='map' aria-label='Open map settings'>
                    <Map className='h-5 w-5' />
                  </ToggleGroupItem>
                </TooltipWrapper>

                <TooltipWrapper text='Camera'>
                  <ToggleGroupItem
                    value='camera'
                    aria-label='Open camera settings'
                  >
                    <Video className='h-5 w-5' />
                  </ToggleGroupItem>
                </TooltipWrapper>
              </ToggleGroup>

              {false && (
                <Card>
                  <CardHeader>
                    <CardTitle>Satellites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TooltipWrapper text='Airplane Mode' side='right'>
                      <div className='flex items-center space-x-2'>
                        <Switch id='airplane-mode' />
                        <Label htmlFor='airplane-mode'>Airplane Mode</Label>
                      </div>
                    </TooltipWrapper>
                  </CardContent>
                </Card>
              )}

              <Popover open={settingsPanel.isOpen}>
                <PopoverAnchor asChild>
                  <div></div>
                </PopoverAnchor>
                <PopoverContent
                  className='w-auto bg-background/50 backdrop-blur-lg'
                  align='start'
                >
                  <div className='grid gap-4'>
                    <div className='space-y-2'>
                      <h4 className='font-medium leading-none'>
                        {
                          {
                            satellite_selection: 'Satellites',
                            satellite_elements: 'Satellite elements',
                            map: 'Map',
                            camera: 'Camera',
                          }[settingsPanel.lastPanel as string]
                        }
                      </h4>
                    </div>
                    {
                      {
                        satellite_selection: (
                          <div className='flex flex-col gap-4'>
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
                            {satellites.length > 0 ? (
                              satellites.map((satellite) => (
                                <div
                                  key={`sat-list-${satellite.name}`}
                                  className='flex flex-row h-5 items-center '
                                >
                                  <Checkbox
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
                                  />
                                  <Label
                                    className='font-normal mx-2 mr-6 w-full _flex _flex-row _items-center'
                                    htmlFor='airplane-mode'
                                  >
                                    {satellite.name}
                                    <span className='ml-[0.3rem] text-[0.6rem] font-semibold text-muted-foreground'>
                                      {false && (
                                        <span className='text-[0.5rem]'>
                                          NORAD
                                          <br />
                                        </span>
                                      )}
                                      {satellite.noradId}
                                    </span>
                                  </Label>

                                  <Button
                                    variant='secondary'
                                    className='h-5 aspect-square bg-transparent p-0 ml-1'
                                    onClick={() => {
                                      dispatch(
                                        toggleInfo({ id: satellite.noradId }),
                                      );
                                    }}
                                  >
                                    <Info
                                      className={cn(
                                        'h-4 w-4',
                                        selections.info.id === satellite.noradId
                                          ? ''
                                          : 'stroke-muted-foreground/50',
                                      )}
                                      strokeWidth={1.75}
                                    />
                                  </Button>
                                  <Button
                                    variant='secondary'
                                    className='h-5 aspect-square bg-transparent p-0 ml-1'
                                    disabled={!satellite.visible}
                                    onClick={() => {
                                      dispatch(
                                        toggleFocused({
                                          id: satellite.noradId,
                                        }),
                                      );
                                    }}
                                  >
                                    <ScanEye
                                      className={cn(
                                        'h-4 w-4',
                                        selections.focused.id ===
                                          satellite.noradId
                                          ? ''
                                          : 'stroke-muted-foreground/50',
                                      )}
                                      strokeWidth={1.75}
                                    />
                                  </Button>
                                  <Button
                                    variant='secondary'
                                    className='h-5 aspect-square bg-transparent p-0 ml-1'
                                    onClick={() => {
                                      const satClone = cloneDeep(satellite);
                                      const satIndex = satellites.findIndex(
                                        (s) => s.noradId === satellite.noradId,
                                      );
                                      dispatch(
                                        removeSatellite({
                                          noradId: satellite.noradId,
                                        }),
                                      );
                                      toast('Satellite removed', {
                                        action: {
                                          label: 'Undo',
                                          onClick: () => {
                                            if (
                                              satellites.findIndex(
                                                (s) => s.noradId === satIndex,
                                              ) > -1
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
                        ),
                        satellite_elements: Object.entries(
                          _settings.elements as SettingsGroup,
                        ).map(([setting, data]) => (
                          <TooltipWrapper
                            key={`${setting}`}
                            text={data.tooltip}
                            side='right'
                          >
                            <div className='flex items-center space-x-2'>
                              <Switch
                                id={`settings_elements_${setting}`}
                                // @ts-ignore
                                checked={settings['elements'][setting]}
                                onCheckedChange={(value) =>
                                  dispatch(
                                    update({
                                      path: `elements.${setting}`,
                                      value: value,
                                    }),
                                  )
                                }
                                disabled={data.disabled}
                              />
                              <Label htmlFor={`settings_elements_${setting}`}>
                                {data.label}
                              </Label>
                            </div>
                          </TooltipWrapper>
                        )),
                        map: (
                          <RadioGroup
                            value={settings['map'] as string}
                            onValueChange={(value) =>
                              dispatch(
                                update({
                                  path: `map`,
                                  value: value,
                                }),
                              )
                            }
                          >
                            {Object.entries(_settings.map as SettingsGroup).map(
                              ([setting, data]) => (
                                <TooltipWrapper
                                  key={`${setting}`}
                                  text={data.tooltip}
                                  side='right'
                                >
                                  <div className='flex items-center space-x-2'>
                                    <RadioGroupItem
                                      value={setting}
                                      id={`settings_map_${setting}`}
                                      disabled={data.disabled}
                                    />
                                    <Label htmlFor={`settings_map_${setting}`}>
                                      {data.label}
                                    </Label>
                                  </div>
                                </TooltipWrapper>
                              ),
                            )}
                          </RadioGroup>
                        ),
                        camera: (
                          <>
                            <RadioGroup
                              value={settings['camera'] as string}
                              onValueChange={(value) =>
                                dispatch(
                                  update({
                                    path: `camera`,
                                    value: value,
                                  }),
                                )
                              }
                            >
                              {Object.entries(
                                _settings.camera as SettingsGroup,
                              ).map(([setting, data]) => (
                                <TooltipWrapper
                                  key={`${setting}`}
                                  text={data.tooltip}
                                  side='right'
                                >
                                  <div className='flex items-center space-x-2'>
                                    <RadioGroupItem
                                      value={setting}
                                      id={`settings_camera_${setting}`}
                                      disabled={data.disabled}
                                    />
                                    <Label
                                      htmlFor={`settings_camera_${setting}`}
                                    >
                                      {data.label}
                                    </Label>
                                  </div>
                                </TooltipWrapper>
                              ))}
                            </RadioGroup>
                            <h4 className='font-medium leading-none mt-4'>
                              View
                            </h4>
                            {Object.entries(
                              _settings.view as SettingsGroup,
                            ).map(([setting, data]) => (
                              <TooltipWrapper
                                key={`${setting}`}
                                text={data.tooltip}
                                side='right'
                              >
                                <div className='flex items-center space-x-2'>
                                  <Switch
                                    id={`settings_view_${setting}`}
                                    // @ts-ignore
                                    checked={settings['view'][setting]}
                                    onCheckedChange={(value) =>
                                      dispatch(
                                        update({
                                          path: `view.${setting}`,
                                          value: value,
                                        }),
                                      )
                                    }
                                  />
                                  <Label htmlFor={`settings_view_${setting}`}>
                                    {data.label}
                                  </Label>
                                </div>
                              </TooltipWrapper>
                            ))}
                          </>
                        ),
                      }[settingsPanel.lastPanel as string]
                    }
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className='flex flex-col absolute top-2 right-[52px] pointer-events-auto'>
              <TooltipWrapper text='Show Info Panel'>
                <Toggle
                  variant='outline_toggle'
                  className='aspect-square p-0 '
                  onClick={() => {
                    dispatchInfoPanel({
                      type: 'toggle_is_open',
                      payload: false,
                    });
                    // dispatchSettingsPanel({
                    //   type: 'set_is_open',
                    //   payload: false,
                    // });
                  }}
                >
                  <Info className='h-5 w-5' />
                  {/* <TableProperties className='h-5 w-5' /> */}
                </Toggle>
              </TooltipWrapper>
              <Popover open={infoPanel.isOpen}>
                <PopoverAnchor asChild>
                  <div></div>
                </PopoverAnchor>
                <PopoverContent
                  className='w-auto bg-background/50 backdrop-blur-lg max-w-screen-sm'
                  align='center'
                  collisionPadding={8}
                >
                  <div className='grid gap-4 max-w-[calc(100vw_-_50px)]'>
                    {/* WHY 50 PIXELS????? */}
                    {selections.info.id === null ? (
                      <div className='space-y-2 w-full'>
                        <h4 className='font-medium leading-none text-muted-foreground text-center'>
                          No satellite selected.
                        </h4>
                      </div>
                    ) : (
                      <>
                        <div className='space-y-2 w-fit mx-auto'>
                          <h4 className='font-medium leading-none text-center'>
                            {infoSat?.name}
                          </h4>
                        </div>
                        <div className='w-fit mx-auto'>
                          <Table className='flex flex-row gap-6 justify-center !container '>
                            <TableBody>
                              {[
                                {
                                  key: 'Latitude',
                                  //@ts-ignore
                                  value: selections.info.posGeo.lat.toFixed(5),
                                },
                                {
                                  key: 'Longitude',

                                  //@ts-ignore
                                  value: selections.info.posGeo.lon.toFixed(5),
                                },
                                {
                                  key: 'Height',
                                  value:
                                    //@ts-ignore
                                    selections.info.posGeo.height.toFixed(5),
                                },
                              ].map(({ key, value }) => (
                                <TableRow key={key}>
                                  <TableHead className='font-medium'>
                                    {key}
                                  </TableHead>
                                  <TableCell className='tabular-nums text-right'>
                                    {value}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <code className='text-xs text-muted-foreground w-full overflow-scroll'>
                          {infoSat?.tle1}
                          <br />
                          {infoSat?.tle2}
                        </code>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}

        <div className='flex flex-col absolute top-2 right-2 pointer-events-auto'>
          <TooltipWrapper text='Toggle UI'>
            <Button
              variant='outline_toggle'
              className='aspect-square p-0 cursor-pointer'
              onClick={() => {
                setIsTogglesVisible(!isTogglesVisible),
                  dispatchSettingsPanel({
                    type: 'set_is_open',
                    payload: false,
                  }),
                  dispatchInfoPanel({
                    type: 'set_is_open',
                    payload: false,
                  });
              }}
            >
              {isTogglesVisible ? (
                <Eye className='h-5 w-5' />
              ) : (
                <EyeOff className='h-5 w-5' />
              )}
            </Button>
          </TooltipWrapper>
        </div>
      </TooltipProvider>
    </div>
  );
}

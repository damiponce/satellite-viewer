import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RootState } from '@/lib/redux/store';
import { PopoverAnchor } from '@radix-ui/react-popover';
import {
  Eye,
  EyeOff,
  Info,
  Layers3,
  Map,
  Satellite,
  Video,
} from 'lucide-react';
import { useReducer, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TooltipWrapper from '../TooltipWrapper';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Popover, PopoverContent } from '../ui/popover';
import { Switch } from '../ui/switch';

import { Toaster } from '../ui/sonner';

import dynamic from 'next/dynamic';
import { Toggle } from '../ui/toggle';
import CameraSettingsPanel from './sections/CameraSettingsPanel';
import SatelliteElementsPanel from './sections/SatelliteElementsPanel';
import SatelliteListPanel from './sections/SatelliteListPanel';
import TexturesPanel from './sections/TexturesPanel';

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

  const infoSat = satellites.find((s) => s.object_id === selections.info.id);

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
            <div className='absolute bottom-0 w-full flex flex-row pointer-events-none *:pointer-events-auto'>
              {/* <TimeHandler timer={timer} /> */}
              {/* <Timeline timer={timer} /> */}
            </div>

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
                        satellite_selection: <SatelliteListPanel />,
                        satellite_elements: <SatelliteElementsPanel />,
                        map: <TexturesPanel />,
                        camera: <CameraSettingsPanel />,
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
                            {infoSat?.object_name}
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
                          {infoSat?.tle_line0}
                          <br />
                          {infoSat?.tle_line1}
                          <br />
                          {infoSat?.tle_line2}
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

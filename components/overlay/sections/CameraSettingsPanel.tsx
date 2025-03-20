import TooltipWrapper from '@/components/TooltipWrapper';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { RootState } from '@/lib/redux/store';
import _settings, { SettingsGroup } from '@/lib/settings/settings';
import { update } from '@/lib/settings/settingsSlice';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function CameraSettingsPanel() {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  return (
    <>
      {/* <RadioGroup
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
        {Object.entries(_settings.camera as SettingsGroup).map(
          ([setting, data]) => (
            <TooltipWrapper key={`${setting}`} text={data.tooltip} side='right'>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem
                  value={setting}
                  id={`settings_camera_${setting}`}
                  disabled={data.disabled}
                />
                <Label htmlFor={`settings_camera_${setting}`}>
                  {data.label}
                </Label>
              </div>
            </TooltipWrapper>
          ),
        )}
      </RadioGroup> */}
      {/* <h4 className='font-medium leading-none mt-4'>View</h4> */}
      {Object.entries(_settings.view as SettingsGroup).map(
        ([setting, data]) => (
          <TooltipWrapper key={`${setting}`} text={data.tooltip} side='right'>
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
              <Label htmlFor={`settings_view_${setting}`}>{data.label}</Label>
            </div>
          </TooltipWrapper>
        ),
      )}
    </>
  );
}

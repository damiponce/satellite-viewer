import TooltipWrapper from '@/components/TooltipWrapper';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RootState } from '@/lib/redux/store';
import _settings, { SettingsGroup } from '@/lib/settings/settings';
import { update } from '@/lib/settings/settingsSlice';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function SatelliteElementsPanel() {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  return (
    <>
      {Object.entries(_settings.elements as SettingsGroup).map(
        ([setting, data]) => (
          <TooltipWrapper key={`${setting}`} text={data.tooltip} side='right'>
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
        ),
      )}
    </>
  );
}

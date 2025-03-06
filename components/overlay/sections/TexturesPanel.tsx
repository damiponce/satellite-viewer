import TooltipWrapper from '@/components/TooltipWrapper';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RootState } from '@/lib/redux/store';
import _settings, { SettingsGroup } from '@/lib/settings/settings';
import { update } from '@/lib/settings/settingsSlice';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function TexturesPanel() {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  return (
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
      {Object.entries(_settings.map as SettingsGroup).map(([setting, data]) => (
        <TooltipWrapper key={`${setting}`} text={data.tooltip} side='right'>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem
              value={setting}
              id={`settings_map_${setting}`}
              disabled={data.disabled}
            />
            <Label htmlFor={`settings_map_${setting}`}>{data.label}</Label>
          </div>
        </TooltipWrapper>
      ))}
    </RadioGroup>
  );
}

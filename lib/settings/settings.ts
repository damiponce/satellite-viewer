export type Setting = {
  type: 'switch' | 'check' | 'radio' | 'slider' | 'text';
  value: boolean | number | string;
  label: string;
  disabled?: boolean;
  tooltip?: string;
  description?: string;
  options?: string[];
};

export type SettingsGroup = {
  [any: string]: Setting;
};

export type Settings = {
  [any: string]: SettingsGroup | Setting;
};

export type FlatSetting = boolean | number | string;

export type FlatSettingsGroup = {
  [any: string]: FlatSetting;
};

export type FlatSettings = {
  [any: string]: FlatSettingsGroup | FlatSetting;
};

const settings: Settings = {
  elements: {
    point: {
      type: 'switch',
      value: true,
      label: 'Point',
      tooltip: 'Show point',
    },
    label: {
      type: 'switch',
      value: false,
      label: 'Label',
      tooltip: 'Show label',
      disabled: true,
    },
    orbitEci: {
      type: 'switch',
      value: false,
      label: 'Orbit (ECI)',
      tooltip: 'Show ECI orbit',
      disabled: true,
    },
    orbitEcef: {
      type: 'switch',
      value: false,
      label: 'Orbit track',
      tooltip: 'Show orbit track',
      disabled: true,
    },
    groundTrack: {
      type: 'switch',
      value: false,
      label: 'Ground Track',
      tooltip: 'Show ground track [WIP]',
      disabled: true,
    },
  },
  map: {
    real: {
      type: 'radio',
      value: true,
      label: 'Real',
      tooltip: 'Use satellite view [WIP]',
    },
    dots: {
      type: 'radio',
      value: false,
      label: 'Dots',
      tooltip: 'Use dots view',
      disabled: true,
    },
  },
  camera: {
    eci: {
      type: 'radio',
      value: false,
      label: 'Inertial',
      tooltip: 'Use inertial (ECI) coordinate system',
      disabled: true,
    },
    ecef: {
      type: 'radio',
      value: true,
      label: 'Fixed',
      tooltip: 'Use fixed (ECEF) coordinate system',
    },
  },
  view: {
    grid: {
      type: 'switch',
      value: false,
      label: 'Grid',
      tooltip: 'Show grid',
    },
    gizmo: {
      type: 'switch',
      value: false,
      label: 'Gizmo',
      tooltip: 'Show gizmo',
    },
  },
};

export default settings;

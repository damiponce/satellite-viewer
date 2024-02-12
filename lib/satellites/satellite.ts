export type SatelliteType = {
  noradId: number;
  name: string;
  tle1: string;
  tle2: string;
  fetchedAt: number;
  color: number;
  selected: boolean;
  visible: boolean;
  elements: {
    point: boolean;
    label: boolean;
    orbitEci: boolean;
    orbitEcef: boolean;
    groundTrack: boolean;
  };
};

export type SatellitesType = SatelliteType[];

export class orbitElements {}

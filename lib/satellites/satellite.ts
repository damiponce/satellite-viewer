// export type SatelliteType = {
//   noradId: number;
//   name: string;
//   tle1: string;
//   tle2: string;
//   fetchedAt: number;
//   color: number;
//   selected: boolean;
//   visible: boolean;
//   elements: {
//     point: boolean;
//     label: boolean;
//     orbitEci: boolean;
//     orbitEcef: boolean;
//     groundTrack: boolean;
//   };
// };

export type SatelliteType = {
  object_id: number;
  object_name: string;
  tle_line0: string;
  tle_line1: string;
  tle_line2: string;
};

export type SatellitesType = SatelliteType[];

export class orbitElements {}

export type SelectionsType = {
  focused: {
    id: number | null;
    posEc: {
      x: number | string;
      y: number | string;
      z: number | string;
    };
  };
  info: {
    id: number | string | null;
    speed: number | string;
    posGeo: {
      lat: number | string;
      lon: number | string;
      height: number | string;
    };
    posEc: {
      x: number | string;
      y: number | string;
      z: number | string;
    };
    tle: {
      ndot: number | string; // first time derivative of the mean motion
      nddot: number | string; // second time derivative of the mean motion
      bstar: number | string; // ballistic drag coefficient (1/earth radii)
      inclo: number | string; // inclination (radians)
      nodeo: number | string; // right ascension of ascending node (radians)
      ecco: number | string; // eccentricity
      argpo: number | string; // argument of perigee (radians)
      mo: number | string; // mean anomaly (radians)
      no: number | string; // mean motion (radians/minute)
    };
  };
};

export class orbitElements {}

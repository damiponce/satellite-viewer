import React, { useEffect, useRef, useState } from 'react';
import * as TLE from 'tle.js';

function Overlay() {
  const tleStr = useRef<string>(
    `ISS (ZARYA)
    1 25544U 98067A   24016.87842653  .00032364  00000-0  58271-3 0  9990
    2 25544  51.6419 350.0354 0005130  98.7712 348.5344 15.49499681434931`,
  );

  const tle = useRef({
    name: '',
    number: 0,
    class: '',
    id: '',
    epoch: 0,
    fdmm: 0,
    sdmm: 0,
    drag: 0,
    ephemeris: 0,
    esn: 0,
    inclination: 0,
    ascension: 0,
    eccentricity: 0,
    perigee: 0,
    anomaly: 0,
    motion: 0,
    revolution: 0,
  });

  useEffect(() => {
    tle.current.name = TLE.getSatelliteName(tleStr.current);
    tle.current.number = TLE.getCatalogNumber(tleStr.current);
    tle.current.class = TLE.getClassification(tleStr.current);
    tle.current.id =
      TLE.getIntDesignatorYear(tleStr.current) +
      '-' +
      TLE.getIntDesignatorLaunchNumber(tleStr.current) +
      TLE.getIntDesignatorPieceOfLaunch(tleStr.current);
    tle.current.epoch = TLE.getEpochTimestamp(tleStr.current);
    tle.current.fdmm = TLE.getFirstTimeDerivative(tleStr.current);
    tle.current.sdmm = TLE.getSecondTimeDerivative(tleStr.current);
    tle.current.drag = TLE.getBstarDrag(tleStr.current);
    tle.current.ephemeris = TLE.getOrbitModel(tleStr.current);
    tle.current.esn = TLE.getTleSetNumber(tleStr.current);
    tle.current.inclination = TLE.getInclination(tleStr.current);
    tle.current.ascension = TLE.getRightAscension(tleStr.current);
    tle.current.eccentricity = TLE.getEccentricity(tleStr.current);
    tle.current.perigee = TLE.getPerigee(tleStr.current);
    tle.current.anomaly = TLE.getMeanAnomaly(tleStr.current);
    tle.current.motion = TLE.getMeanMotion(tleStr.current);
    tle.current.revolution = TLE.getRevNumberAtEpoch(tleStr.current);
  }, [tleStr]);

  return (
    <div
      style={{
        color: 'white',
        position: 'absolute',
        top: 0,
        right: 0,
        // border: '1px red solid',
        padding: 4,
      }}
    >
      <input
        style={{
          backgroundColor: '#0000',
          border: '1px grey solid',
          borderRadius: '8px',
          fontSize: 12,
          padding: 2,
          display: 'inline-block',
          maxWidth: 300,
          minWidth: 100,
          width: '100%',
          height: '2rem',
        }}
        type='text'
        value={tleStr.current}
        onInput={(e) => (tleStr.current = (e.target as HTMLInputElement).value)}
        onChange={(e) =>
          (tleStr.current = (e.target as HTMLInputElement).value)
        }
      />

      <table style={{ fontSize: 12 }}>
        <tr>
          <td>name</td>
          <td>{tle.current.name}</td>
        </tr>
        <tr>
          <td>number</td>
          <td>{tle.current.number}</td>
        </tr>
        <tr>
          <td>class</td>
          <td>{tle.current.class}</td>
        </tr>
        <tr>
          <td>id</td>
          <td>{tle.current.id}</td>
        </tr>
        <tr>
          <td>date</td>
          <td>{tle.current.epoch}</td>
        </tr>
        <tr>
          <td>fdmm</td>
          <td>{tle.current.fdmm}</td>
        </tr>
        <tr>
          <td>sdmm</td>
          <td>{tle.current.sdmm}</td>
        </tr>
        <tr>
          <td>drag</td>
          <td>{tle.current.drag}</td>
        </tr>
        <tr>
          <td>ephemeris</td>
          <td>{tle.current.ephemeris}</td>
        </tr>
        <tr>
          <td>esn</td>
          <td>{tle.current.esn}</td>
        </tr>
        <tr>
          <td>inclination</td>
          <td>{tle.current.inclination}</td>
        </tr>
        <tr>
          <td>ascension</td>
          <td>{tle.current.ascension}</td>
        </tr>
        <tr>
          <td>eccentricity</td>
          <td>{tle.current.eccentricity}</td>
        </tr>
        <tr>
          <td>perigee</td>
          <td>{tle.current.perigee}</td>
        </tr>
        <tr>
          <td>anomaly</td>
          <td>{tle.current.anomaly}</td>
        </tr>
        <tr>
          <td>motion</td>
          <td>{tle.current.motion}</td>
        </tr>
        <tr>
          <td>revolution</td>
          <td>{tle.current.revolution}</td>
        </tr>
      </table>
    </div>
  );
}

export default Overlay;

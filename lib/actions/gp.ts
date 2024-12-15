'use server';
import { sql, db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import moment from 'moment';
import { fetchDataWithLogin } from '@/lib/actions/spacetrack';

function chunkArray(arr: any[], size: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function eSQ(s: string) {
  if (s.includes("'")) {
    return s.replace(/'/g, "''");
  } else {
    return s;
  }
}

export async function updateDB() {
  const client = await db.connect();

  const fetch_data = await fetchDataWithLogin(
    `https://www.space-track.org/basicspacedata/query/class/gp/decay_date/null-val/object_type/payload/epoch/%3Enow-30/orderby/norad_cat_id/format/json`,
  );

  const chunks = chunkArray(fetch_data, 1000);
  console.log('CHUNKS:', chunks.length);

  const errors = [];
  const failed_strs = [];
  let i = 1;
  await client.query('TRUNCATE gp;');
  for (const chunk of chunks) {
    let str = `INSERT INTO gp (gp_id, creation_date, object_name, object_id, epoch, classification_type, object_type, rcs_size, tle_line0, tle_line1, tle_line2) VALUES `;
    for (const _gp of chunk) {
      str += `('${_gp.GP_ID}', '${_gp.CREATION_DATE}', '${eSQ(
        _gp.OBJECT_NAME,
      )}', '${eSQ(_gp.OBJECT_ID)}', '${_gp.EPOCH}', '${
        _gp.CLASSIFICATION_TYPE
      }', '${_gp.OBJECT_TYPE}', '${_gp.RCS_SIZE}', '${eSQ(_gp.TLE_LINE0)}', '${
        _gp.TLE_LINE1
      }', '${_gp.TLE_LINE2}')`;
      if (_gp !== chunk[chunk.length - 1]) {
        str += ',\n';
      } else {
        str += `;`;
      }
      // } else {
      //   str += `ON CONFLICT (gp_id) DO UPDATE SET creation_date='${
      //     _gp.CREATION_DATE
      //   }', object_name='${eSQ(_gp.OBJECT_NAME)}', object_id='${eSQ(
      //     _gp.OBJECT_ID,
      //   )}', epoch='${_gp.EPOCH}', classification_type='${
      //     _gp.CLASSIFICATION_TYPE
      //   }', object_type='${_gp.OBJECT_TYPE}', rcs_size= '${
      //     _gp.RCS_SIZE
      //   }', tle_line0= '${eSQ(_gp.TLE_LINE0)}', tle_line1= '${
      //     _gp.TLE_LINE1
      //   }', tle_line2='${_gp.TLE_LINE2}';`;
      // }
    }

    console.log(`LENGTH [${i}]: ${chunk.length}`);

    try {
      await client.query(str);
      console.log(`INSERTED CHUNK ${i} OF ${chunks.length} [${chunk.length}]`);
    } catch (error) {
      errors.push(error);
      failed_strs.push(str);
      console.log(`FAILED CHUNK ${i} OF ${chunks.length} [${chunk.length}]`);
      console.error(error);
      console.error(failed_strs);
    }
    i++;
  }

  client.query('UPDATE metadata SET last_uploaded = NOW() WHERE id = 1;');
  // client.query(
  //   'INSERT INTO metadata (last_uploaded) VALUES (NOW()) ON CONFLICT (id) DO UPDATE SET last_uploaded = NOW();',
  // );

  // if (errors.length) return NextResponse.json({ ...errors }, { status: 500 });
  if (errors.length) return false;

  // const gp = await sql`SELECT * FROM gp;`;
  // const gp_count = await client.query(`SELECT COUNT(*) FROM gp`);

  return true;
}

export async function isDBOld() {
  const client = await db.connect();
  const last_uploaded = moment.utc(
    (await client.query('SELECT last_uploaded FROM metadata;'))['rows'][0][
      'last_uploaded'
    ],
  );

  if (moment().diff(moment(last_uploaded), 'hours') < 24) {
    return false;
  }

  return true;
}

export async function getDB() {
  console.log('GETTING VERCEL DB');
  const client = await db.connect();

  if (await isDBOld()) {
    console.log('UPDATING VERCEL DB');
    await updateDB();
  }
  const gp = await client.query('SELECT * FROM gp;');
  return gp['rows'];
}

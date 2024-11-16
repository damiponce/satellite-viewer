import { sql, db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { GP } from '@/public/response';
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

export async function GET(request: Request) {
  const client = await db.connect();
  const last_uploaded = moment.utc(
    (await client.query('SELECT last_uploaded FROM metadata;'))['rows'][0][
      'last_uploaded'
    ],
  );

  if (moment().diff(moment(last_uploaded), 'seconds') < 24) {
    return NextResponse.json({ last_uploaded }, { status: 200 });
  }

  const fetch_data = fetchDataWithLogin(
    `https://www.space-track.org/basicspacedata/query/class/gp/decay_date/null-val/object_type/payload/epoch/%3Enow-30/orderby/norad_cat_id/format/json`,
  );

  return NextResponse.json({ fetch_data }, { status: 200 });

  console.log('LENGTH', GP.length);
  const errors = [];
  const failed_strs = [];

  const chunks = chunkArray(GP, 1000);
  let i = 1;
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
        str += ' ON CONFLICT (gp_id) DO NOTHING;';
      }
    }

    // console.log(str);
    // console.log('LENGTH', GP.length);

    try {
      await client.query(str);
      console.log(`INSERTED CHUNK ${i} OF ${chunks.length} [${chunk.length}]`);
    } catch (error) {
      errors.push(error);
      failed_strs.push(str);
    }
    i++;
  }

  client.query(
    'INSERT INTO metadata (last_uploaded) VALUES (NOW()) ON CONFLICT (id) DO UPDATE SET last_uploaded = NOW();',
  );

  if (errors.length) return NextResponse.json({ ...errors }, { status: 500 });

  // const gp = await sql`SELECT * FROM gp;`;
  // const gp_count = await client.query(`SELECT COUNT(*) FROM gp`);
  return NextResponse.json(
    {
      status: 'OK',
      //  count: gp_count['rows'][0]['count']
    },
    { status: 200 },
  );
}

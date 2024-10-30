async function fetchSatellites(search: string) {
  let satellites: any[] = [];
  let response = await fetch(
    `https://tle.ivanstanojevic.me/api/tle?search=${search}&page-size=100`,
  );
  let data = await response.json();
  satellites = [...satellites, ...data.member];
  let count: number = data.totalItems;
  let pages = Math.ceil(count / 100);
  let i = 2;
  while (i <= pages) {
    response = await fetch(
      `https://tle.ivanstanojevic.me/api/tle?search=${search}&page-size=100&page=${i}`,
    );
    data = await response.json();
    satellites = [...satellites, ...data.member];
    i++;
  }
  return satellites;
}

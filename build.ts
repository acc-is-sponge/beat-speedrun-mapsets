import { dirname } from "path";
import {
  MapSource,
  Source,
  fetchScoreSaberLeaderboards,
  fillSongInfo,
  getScoreSaberMostRecentlyRankedDate,
} from "./source";
import { mkdir, writeFile } from "fs/promises";

type MapSet = { [songHash: string]: { [difficultyRaw: string]: number } };

async function createMapSet(
  source: Source,
  path: string,
  getStar: (stat: {
    difficultyRaw: string;
    info: NonNullable<MapSource["info"]>;
    scoreSaber?: {
      stars: number;
      rankedDate: Date | null;
    };
  }) => number | false | null | undefined
) {
  console.log(`creating MapSet ${path}...`);
  const mapSet: MapSet = {};

  for (const [songHash, { difficulties, info }] of Object.entries(source)) {
    for (const [difficultyRaw, difficulty] of Object.entries(difficulties)) {
      let stat = { difficultyRaw, info: info!, ...difficulty };
      const star = getStar(stat);
      if (typeof star != "number") continue;

      console.log(`${info!.name} (${difficultyRaw}): ★${star}`);

      const difficulties = mapSet[songHash] || (mapSet[songHash] = {});
      difficulties[difficultyRaw] = star;
    }
  }

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(mapSet));
}

const timestamp = new Date().toISOString().slice(0, 10);
const source: Source = {};
await fetchScoreSaberLeaderboards(source);
await fillSongInfo(source);

// ScoreSaber MapSets
{
  const mostRecentlyRankedDate = getScoreSaberMostRecentlyRankedDate(source);

  await createMapSet(
    source,
    `scoresaber/v3/all/${timestamp}.json`,
    ({ scoreSaber }) => scoreSaber?.stars
  );
  await createMapSet(
    source,
    `scoresaber/v3/hot/${timestamp}.json`,
    ({ scoreSaber }) =>
      scoreSaber?.rankedDate &&
      mostRecentlyRankedDate.getTime() - 1000 * 60 * 60 * 24 <
        scoreSaber.rankedDate.getTime() &&
      scoreSaber.stars
  );
  await createMapSet(
    source,
    `scoresaber/v3/modern/${timestamp}.json`,
    ({ scoreSaber }) =>
      scoreSaber?.rankedDate &&
      mostRecentlyRankedDate.getTime() - 1000 * 60 * 60 * 24 * 365 * 2 <
        scoreSaber.rankedDate.getTime() &&
      scoreSaber.stars
  );
  await createMapSet(
    source,
    `scoresaber/v3/lt6/${timestamp}.json`,
    ({ scoreSaber }) =>
      scoreSaber?.stars && scoreSaber.stars < 6 && scoreSaber.stars
  );
  await createMapSet(
    source,
    `scoresaber/v3/he10/${timestamp}.json`,
    ({ scoreSaber }) =>
      scoreSaber?.stars && scoreSaber.stars >= 10 && scoreSaber.stars
  );
  await createMapSet(
    source,
    `scoresaber/v3/nts/${timestamp}-nts.json`,
    ({ scoreSaber, info }) => 90 <= info.duration && scoreSaber?.stars
  );
}

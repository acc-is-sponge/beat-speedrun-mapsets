import { getLeaderboards } from "./api/scoresaber";
import { getMapsByHash } from "./api/beatsaver";
import { setTimeout } from "timers/promises";

export type Source = { [songHash: string]: MapSource };

export type MapSource = {
  difficulties: {
    [difficultyRaw: string]: {
      scoreSaber?: {
        stars: number;
        rankedDate: Date | null;
      };
    };
  };
  info?: {
    name: string;
    bpm: number;
    duration: number;
  };
};

export function getScoreSaberMostRecentlyRankedDate(source: Source): Date {
  let ret = new Date(2018, 4, 1);
  for (const { difficulties } of Object.values(source)) {
    for (const { scoreSaber } of Object.values(difficulties)) {
      if (!scoreSaber || !scoreSaber.rankedDate) continue;
      if (ret.getTime() > scoreSaber.rankedDate.getTime()) continue;
      ret = scoreSaber.rankedDate;
    }
  }
  return ret;
}

export async function fetchScoreSaberLeaderboards(source: Source) {
  console.log("fetching ScoreSaber leaderboards...");

  let page = 0;

  while (true) {
    const leaderboards = await getLeaderboards(page);
    if (leaderboards.length == 0) break;

    for (const leaderboard of leaderboards) {
      const {
        id,
        songHash,
        songName,
        rankedDate: rankedDateString,
        difficulty: { difficultyRaw },
        stars,
      } = leaderboard;

      const rankedDate =
        typeof rankedDateString != "string" ? null : new Date(rankedDateString);
      console.log(
        `[${id}] ${songName} (${difficultyRaw}) -- ★${stars}${
          rankedDate ? ` ranked at ${rankedDate.toISOString()}` : ""
        }`
      );

      const { difficulties } =
        source[songHash] || (source[songHash] = { difficulties: {} });
      const difficulty =
        difficulties[difficultyRaw] || (difficulties[difficultyRaw] = {});
      difficulty.scoreSaber = { rankedDate, stars };
    }

    ++page;

    // TBH This isn't good enough for the ScoreSaber API limit
    if (page % 10 == 0) await setTimeout(1000);
  }
}

export async function fillSongInfo(source: Source) {
  console.log("fill song info...");

  const songHashes = Object.keys(source);
  for (let i = 0; i < songHashes.length; i += 50) {
    const hashes = songHashes.slice(i, i + 50);
    const maps = await getMapsByHash(hashes);

    for (let j = 0; j < hashes.length; ++j) {
      const hash = hashes[j];
      const map = maps[j];
      const mapSource = source[hash];
      mapSource.info = {
        name: map.name,
        bpm: map.metadata.bpm,
        duration: map.metadata.duration,
      };
    }

    // Some delay for BeatSaver
    if (i % 250 == 200) await setTimeout(1000);
  }
}

import { getLeaderboards } from "./api/scoresaber";
import { setTimeout } from "timers/promises";
import { mkdir, writeFile } from "fs/promises";

type MapSet = { [songHash: string]: { [difficultyRaw: string]: number } };
const dest: MapSet = {};
let page = 0;
let isSkippingMostRecentRankedMaps = true;
let latestRankedMapDate: Date | null = null;

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
        rankedDate ? `ranked at ${rankedDate}` : ""
      }`
    );

    if (isSkippingMostRecentRankedMaps) {
      if (!rankedDate) throw `ranked date unspecified: ${songHash}`;
      if (!latestRankedMapDate) {
        latestRankedMapDate = rankedDate;
      } else if (
        1000 * 60 * 60 * 24 <
        Math.abs(latestRankedMapDate.getTime() - rankedDate.getTime())
      ) {
        isSkippingMostRecentRankedMaps = false;
      }
    }

    if (isSkippingMostRecentRankedMaps) {
      console.log(
        "  ... skipping (The most recent ranked map will be reweighted at the next ranking batch)"
      );
    } else {
      const difficulties = dest[songHash] || (dest[songHash] = {});
      difficulties[difficultyRaw] = stars;
    }
  }

  ++page;

  // TBH This isn't good enough for the ScoreSaber API limit
  if (page % 10 == 0) await setTimeout(1000);
}

const yearAndMonth = new Date()
  .toLocaleDateString("UTC", { year: "numeric", month: "2-digit" })
  .split("/")
  .join("");
await mkdir("scoresaber", { recursive: true });
await writeFile(`scoresaber/${yearAndMonth}.json`, JSON.stringify(dest));

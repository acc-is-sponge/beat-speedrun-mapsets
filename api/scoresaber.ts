// https://docs.scoresaber.com/
export type LeaderboardInfo = {
  id: number;
  songHash: string;
  songName: string;
  rankedDate: string | Record<string, never> | null;
  difficulty: { difficultyRaw: string };
  stars: number;
};

export async function getLeaderboards(
  page: number
): Promise<LeaderboardInfo[]> {
  const url = `https://scoresaber.com/api/leaderboards?ranked=true&category=1&page=${page}`;
  const response = await fetch(url);
  const json = await response.json();
  return json.leaderboards;
}

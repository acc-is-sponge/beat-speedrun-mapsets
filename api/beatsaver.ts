// https://api.beatsaver.com/docs/
export type MapDetail = {
  id: string;
  name: string;
  metadata: MapDetailMetadata;
};

export type MapDetailMetadata = {
  bpm: number;
  duration: number;
};

const commonHeaders = {
  "User-Agent": "Beat Speedrun Mapsets/1.0.0",
};

export async function getMapsByHash(hashes: string[]): Promise<MapDetail[]> {
  if (hashes.length == 0) return [];
  if (hashes.length > 50) throw new Error("hashes must be up to 50");
  const commaSeparatedHashes = hashes.map((h) => h.toLowerCase()).join(",");
  const response = await fetch(
    `https://api.beatsaver.com/maps/hash/${commaSeparatedHashes}`,
    { headers: commonHeaders }
  );
  const json = await response.json();
  return hashes.length == 1 ? [json] : hashes.map((h) => json[h.toLowerCase()]);
}

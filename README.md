# Beat Speedrun Mapsets

Mapset definitions for [Beat Speedrun MOD](https://github.com/acc-is-sponge/beat-speedrun-mod).

## Rules

- Mapsets maintained in this repository must be immutable.
- The mapset based on [ScoreSaber](https://scoresaber.com/)'s star rating must be placed under `scoresaber/`.

## Format

```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "type": "object",
  "patternProperties": {
    "[0-9A-F]{40}": {
      "type": "object",
      "patternProperties": {
        "_(Easy|Normal|Hard|Expert|ExpertPlus)_SoloStandard": {
          "type": "number"
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

In short in TypeScript:

```ts
type MapSet = { [H in SongHash]: { [D in DifficultyRaw]: Star } };
type SongHash = string;
type DifficultyRaw = `_${'Easy' | 'Normal' | 'Hard' | 'Expert' | 'ExpertPlus'}_SoloStandard`;
type Star = number;
```


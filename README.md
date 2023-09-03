# Beat Speedrun Mapsets

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

In short:

```ts
type MapSet = { [songHash: string]: { [difficultyRaw: string]: number } };
```


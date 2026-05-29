# Global Availability Globe

Commercial React prototype for an interactive global team availability widget.

## Features

- COBE WebGL globe
- Interactive drag control
- Clickable timezone nodes
- Active marker focus animation
- Local time and UTC offset per region
- Availability status based on working hours
- Timezone boundary overlay from timezone-boundary-builder GeoJSON ZIP
- Fallback UTC meridian overlay
- Portfolio-ready commercial UI

## Run locally

```bash
npm install
npm run dev
```

## Production data

For best performance, download `timezones-with-oceans-now.geojson.zip` from timezone-boundary-builder releases and place it here:

```txt
public/data/timezones-with-oceans-now.geojson.zip
```

The component will try local data first, then GitHub release fallback, then UTC meridian fallback.

# Algeria GeoJSON Data

## Data Sources

### Recommended Sources for Algeria Wilayas GeoJSON:

1. **Natural Earth Data**: https://www.naturalearthdata.com/
   - Admin 1 boundaries (states/provinces)
   - Public domain

2. **GADM**: https://gadm.org/download_country.html
   - Algeria administrative boundaries
   - Free for academic/non-commercial use

3. **OpenStreetMap**: https://www.openstreetmap.org/
   - Extract using Overpass API
   - ODbL license

4. **Humanitarian Data Exchange**: https://data.humdata.org/
   - OCHA administrative boundaries

## File Structure

```
/data/geojson/
├── algeria-wilayas.geojson    # 48 wilayas boundaries
├── algeria-country.geojson    # Country outline
└── README.md                  # This file
```

## Required GeoJSON Format

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "01",
        "code": "01",
        "name_ar": "أدرار",
        "name_en": "Adrar",
        "event_count": 0
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lng, lat], ...]]
      }
    }
  ]
}
```

## Instructions

1. Download Algeria admin level 1 boundaries from one of the sources above
2. Convert to GeoJSON format if needed (using QGIS or ogr2ogr)
3. Add Arabic names (`name_ar`) property
4. Rename the file to `algeria-wilayas.geojson`
5. Place in this directory

## Simplification

For web performance, simplify the geometry:

```bash
# Using mapshaper CLI
mapshaper algeria-raw.geojson -simplify 10% -o algeria-wilayas.geojson
```

## Wilaya Codes Reference

| Code | Name (Arabic) | Name (French) |
|------|---------------|---------------|
| 01 | أدرار | Adrar |
| 02 | الشلف | Chlef |
| 03 | الأغواط | Laghouat |
| ... | ... | ... |
| 48 | غليزان | Relizane |

*See full list in /data/seed/events.json*

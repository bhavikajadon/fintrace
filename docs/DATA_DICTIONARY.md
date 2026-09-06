# FINTRACE raw data dictionary

`backend/data/demo_history.csv` is an original synthetic fixture dataset for development and demos.

| field | meaning |
|---|---|
| date | synthetic observation date |
| security_id | FINTRACE fixture identifier |
| symbol | display symbol |
| name | security name used by the demo |
| sector | analytical grouping |
| asset_type | EQUITY or INDEX |
| open | synthetic open |
| high | synthetic high |
| low | synthetic low |
| close | synthetic close |
| volume | synthetic volume units |
| source | always FINTRACE_SYNTHETIC for this fixture |
| status | always DEMO for this fixture |

This dataset is not live, is not scraped, and should not be represented as historical exchange data.

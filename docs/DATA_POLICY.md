# FINTRACE data policy for development

The repository's included market observations are synthetic development fixtures generated specifically for FINTRACE. They are not presented as live market data and should not be used for trading decisions.

The production application must use a licensed or otherwise authorized market-data source. The application exposes a provider boundary so the source can be replaced without changing the UI or analytics contracts.

Every production quote should carry:
- source
- status: LIVE / DELAYED / STALE / DEMO / ERROR
- observed timestamp
- ingestion timestamp

FINTRACE should never label synthetic or stale observations as live.

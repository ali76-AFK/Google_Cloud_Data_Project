## CampaignPulse
<p align="center">
  <img src="./output_GUI.png" alt="CampaignPulse GUI" width="900">
</p>


Analytics dashboard for purchase tracking and KPI reporting using BigQuery, FastAPI, React, and the GA4 sample ecommerce dataset.

## Overview

CampaignPulse is a small end-to-end analytics application built on Google Cloud and BigQuery.  
It stages raw event data from the public GA4 sample ecommerce dataset, builds reporting marts, and exposes the results through a local API for dashboard-style consumption.

The project demonstrates how to connect cloud-based analytics engineering with backend APIs and a frontend reporting interface in one structured workflow.

## Data Source

This project uses the public BigQuery dataset:

`bigquery-public-data.ga4_obfuscated_sample_ecommerce`

The dataset contains obfuscated Google Analytics 4 ecommerce event export data from the Google Merchandise Store covering three months from 2020-11-01 to 2021-01-31. [web:465]

## Features

- BigQuery-based staging and mart workflow.
- SQL models for reusable analytics transformations.
- Local backend API for analytics queries.
- Frontend dashboard for KPI-style reporting.
- Repeatable rebuild scripts for SQL execution.
- End-to-end project structure covering data, backend, and frontend layers.

## Architecture

### Data Layer
- Raw source: GA4 sample ecommerce data in BigQuery.
- Staging models:
  - `stg_events_core`
  - `stg_ecommerce_events`
- Reporting marts:
  - `mart_daily_overview`
  - `mart_funnel_daily`

### Backend
- Python API for querying analytics outputs.
- Local service layer for exposing KPI and reporting endpoints.

### Frontend
- JavaScript-based dashboard UI.
- Displays purchase-related analytics and reporting views for interactive consumption.

## Tech Stack

- **Frontend:** JavaScript, HTML
- **Backend:** Python
- **Cloud / Data:** BigQuery, SQL
- **Infra / Tooling:** Docker, Shell scripts, Makefile

## Project Structure

```text
backend/              # Local API and analytics service layer
frontend/             # Dashboard frontend
infra/docker/         # Containerization setup
scripts/              # SQL execution helpers
sql/
├── staging/          # Staging models
└── marts/            # Reporting marts
docker-compose.yml
Makefile
README.md
```

## Setup

### Prerequisites
- Google Cloud SDK
- BigQuery CLI (`bq`)
- Access to a Google Cloud project with BigQuery API enabled
- Local backend environment

### Authenticate locally
```bash
gcloud auth application-default login
```

### Enable BigQuery
```bash
gcloud services enable bigquery.googleapis.com
```

### Create datasets
```bash
bq --location=US mk --dataset YOUR_PROJECT_ID:staging
bq --location=US mk --dataset YOUR_PROJECT_ID:marts
```

## Build the Models

Run the SQL models in dependency order:

```bash
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID \
bash scripts/run_sql.sh sql/staging/stg_events_core.sql

GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID \
bash scripts/run_sql.sh sql/staging/stg_ecommerce_events.sql

GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID \
bash scripts/run_sql.sh sql/marts/mart_daily_overview.sql

GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID \
bash scripts/run_sql.sh sql/marts/mart_funnel_daily.sql
```

## Validate

Example API check:

```bash
curl -i "http://localhost:8000/api/overview?start=2020-11-01&end=2021-01-31"
```

## What This Project Demonstrates

- Analytics engineering with staging and mart models.
- BigQuery-based transformation workflows.
- Backend API integration for reporting use cases.
- Frontend consumption of analytics outputs.
- Structured end-to-end project organization across data, application, and infrastructure layers.

## Notes

Do not commit credentials, access tokens, ADC files, or local configuration.  
Keep all project-specific values configurable through environment variables.

## Future Improvements

- Add richer KPI visualizations.
- Add user-selectable filters in the dashboard.
- Introduce automated testing for backend endpoints.
- Add deployment targets for cloud-hosted demo environments.

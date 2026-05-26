CREATE OR REPLACE TABLE `YOUR_GCP_PROJECT_ID.staging.stg_events_core` AS
SELECT
  PARSE_DATE('%Y%m%d', event_date) AS event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_ts,
  event_name,
  user_pseudo_id,
  user_id,
  (
    SELECT ep.value.int_value
    FROM UNNEST(event_params) ep
    WHERE ep.key = 'ga_session_id'
  ) AS ga_session_id,
  CONCAT(
    user_pseudo_id,
    '-',
    CAST((
      SELECT ep.value.int_value
      FROM UNNEST(event_params) ep
      WHERE ep.key = 'ga_session_id'
    ) AS STRING)
  ) AS session_id,
  traffic_source.name AS user_acquisition_campaign,
  traffic_source.source AS user_acquisition_source,
  traffic_source.medium AS user_acquisition_medium,
  ecommerce.transaction_id AS transaction_id,
  ecommerce.purchase_revenue AS purchase_revenue,
  ecommerce.shipping_value AS shipping_value,
  ecommerce.tax_value AS tax_value,
  ecommerce.total_item_quantity AS total_item_quantity
FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20201101' AND '20210131';

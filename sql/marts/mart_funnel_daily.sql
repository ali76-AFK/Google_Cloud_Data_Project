CREATE OR REPLACE TABLE `YOUR_GCP_PROJECT_ID.marts.mart_funnel_daily` AS
SELECT
  event_date AS date,
  COUNTIF(event_name = 'view_item') AS product_views,
  COUNTIF(event_name = 'add_to_cart') AS add_to_cart,
  COUNTIF(event_name = 'begin_checkout') AS begin_checkout,
  COUNTIF(event_name = 'purchase') AS purchases,
  SAFE_DIVIDE(COUNTIF(event_name = 'add_to_cart'), COUNTIF(event_name = 'view_item')) AS view_to_cart_rate,
  SAFE_DIVIDE(COUNTIF(event_name = 'begin_checkout'), COUNTIF(event_name = 'add_to_cart')) AS cart_to_checkout_rate,
  SAFE_DIVIDE(COUNTIF(event_name = 'purchase'), COUNTIF(event_name = 'begin_checkout')) AS checkout_to_purchase_rate
FROM `YOUR_GCP_PROJECT_ID.staging.stg_ecommerce_events`
GROUP BY 1
ORDER BY 1;

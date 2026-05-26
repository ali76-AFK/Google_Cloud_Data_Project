CREATE OR REPLACE TABLE `YOUR_GCP_PROJECT_ID.staging.stg_ecommerce_events` AS
SELECT
  event_date,
  event_ts,
  event_name,
  user_pseudo_id,
  user_id,
  ga_session_id,
  session_id,
  user_acquisition_campaign,
  user_acquisition_source,
  user_acquisition_medium,
  transaction_id,
  purchase_revenue,
  shipping_value,
  tax_value,
  total_item_quantity
FROM `YOUR_GCP_PROJECT_ID.staging.stg_events_core`
WHERE event_name IN ('view_item', 'add_to_cart', 'begin_checkout', 'purchase');

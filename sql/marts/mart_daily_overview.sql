CREATE OR REPLACE TABLE `YOUR_GCP_PROJECT_ID.marts.mart_daily_overview` AS
WITH transaction_level AS (
  SELECT
    event_date AS date,
    transaction_id,
    MAX(IFNULL(purchase_revenue, 0)) AS transaction_revenue,
    MAX(IFNULL(total_item_quantity, 0)) AS transaction_item_quantity,
    COUNTIF(event_name = 'purchase') AS purchases
  FROM `YOUR_GCP_PROJECT_ID.staging.stg_ecommerce_events`
  WHERE event_name = 'purchase'
    AND transaction_id IS NOT NULL
    AND transaction_id != '(not set)'
  GROUP BY 1, 2
)
SELECT
  date,
  SUM(purchases) AS purchases,
  COUNT(*) AS transactions,
  SUM(transaction_revenue) AS purchase_revenue,
  SUM(transaction_item_quantity) AS total_item_quantity,
  SAFE_DIVIDE(SUM(transaction_revenue), COUNT(*)) AS avg_order_value,
  SAFE_DIVIDE(SUM(transaction_item_quantity), COUNT(*)) AS items_per_transaction
FROM transaction_level
GROUP BY 1
ORDER BY 1;
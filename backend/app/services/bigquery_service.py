import os
from datetime import date
from typing import Any, Dict, List

USE_BIGQUERY = os.getenv("USE_BIGQUERY", "false").lower() == "true"

def _mock_overview(start: date, end: date) -> Dict[str, Any]:
    return {
        "date_range": {"start": str(start), "end": str(end)},
        "kpis": {
            "purchases": 0,
            "transactions": 0,
            "purchase_revenue": 0.0,
            "total_item_quantity": 0,
            "avg_order_value": 0.0,
            "items_per_transaction": 0.0
        },
        "timeseries": []
    }

def _mock_funnel(start: date, end: date) -> Dict[str, Any]:
    return {
        "date_range": {"start": str(start), "end": str(end)},
        "steps": [
            {"step": "view_item", "count": 0},
            {"step": "add_to_cart", "count": 0},
            {"step": "begin_checkout", "count": 0},
            {"step": "purchase", "count": 0}
        ],
        "rates": {
            "view_to_cart_rate": 0.0,
            "cart_to_checkout_rate": 0.0,
            "checkout_to_purchase_rate": 0.0
        }
    }

def query_overview(start: date, end: date) -> Dict[str, Any]:
    if not USE_BIGQUERY:
        return _mock_overview(start, end)

    from google.cloud import bigquery

    project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
    client = bigquery.Client(project=project_id)

    sql = f"""
    SELECT
      date,
      purchases,
      transactions,
      purchase_revenue,
      total_item_quantity,
      avg_order_value,
      items_per_transaction
    FROM `{project_id}.marts.mart_daily_overview`
    WHERE date BETWEEN @start AND @end
    ORDER BY date
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("start", "DATE", str(start)),
            bigquery.ScalarQueryParameter("end", "DATE", str(end)),
        ],
        maximum_bytes_billed=int(os.getenv("BQ_MAX_BYTES_BILLED", "1000000000")),
        dry_run=False,
        use_query_cache=True,
    )

    rows = list(client.query(sql, job_config=job_config).result())

    timeseries: List[Dict[str, Any]] = []
    for r in rows:
        timeseries.append({
            "date": str(r["date"]),
            "purchases": int(r["purchases"] or 0),
            "transactions": int(r["transactions"] or 0),
            "purchase_revenue": float(r["purchase_revenue"] or 0),
            "total_item_quantity": int(r["total_item_quantity"] or 0),
            "avg_order_value": float(r["avg_order_value"] or 0),
            "items_per_transaction": float(r["items_per_transaction"] or 0),
        })

    totals = {
        "purchases": sum(x["purchases"] for x in timeseries),
        "transactions": sum(x["transactions"] for x in timeseries),
        "purchase_revenue": sum(x["purchase_revenue"] for x in timeseries),
        "total_item_quantity": sum(x["total_item_quantity"] for x in timeseries),
    }
    totals["avg_order_value"] = totals["purchase_revenue"] / totals["transactions"] if totals["transactions"] else 0.0
    totals["items_per_transaction"] = totals["total_item_quantity"] / totals["transactions"] if totals["transactions"] else 0.0

    return {
        "date_range": {"start": str(start), "end": str(end)},
        "kpis": totals,
        "timeseries": timeseries
    }

def query_funnel(start: date, end: date) -> Dict[str, Any]:
    if not USE_BIGQUERY:
        return _mock_funnel(start, end)

    from google.cloud import bigquery

    project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
    client = bigquery.Client(project=project_id)

    sql = f"""
    SELECT
      date,
      product_views,
      add_to_cart,
      begin_checkout,
      purchases,
      view_to_cart_rate,
      cart_to_checkout_rate,
      checkout_to_purchase_rate
    FROM `{project_id}.marts.mart_funnel_daily`
    WHERE date BETWEEN @start AND @end
    ORDER BY date
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("start", "DATE", str(start)),
            bigquery.ScalarQueryParameter("end", "DATE", str(end)),
        ],
        maximum_bytes_billed=int(os.getenv("BQ_MAX_BYTES_BILLED", "1000000000")),
        dry_run=False,
        use_query_cache=True,
    )

    rows = list(client.query(sql, job_config=job_config).result())

    totals = {
        "view_item": 0,
        "add_to_cart": 0,
        "begin_checkout": 0,
        "purchase": 0,
    }

    for r in rows:
        totals["view_item"] += int(r["product_views"] or 0)
        totals["add_to_cart"] += int(r["add_to_cart"] or 0)
        totals["begin_checkout"] += int(r["begin_checkout"] or 0)
        totals["purchase"] += int(r["purchases"] or 0)

    return {
        "date_range": {"start": str(start), "end": str(end)},
        "steps": [
            {"step": "view_item", "count": totals["view_item"]},
            {"step": "add_to_cart", "count": totals["add_to_cart"]},
            {"step": "begin_checkout", "count": totals["begin_checkout"]},
            {"step": "purchase", "count": totals["purchase"]},
        ],
        "rates": {
            "view_to_cart_rate": totals["add_to_cart"] / totals["view_item"] if totals["view_item"] else 0.0,
            "cart_to_checkout_rate": totals["begin_checkout"] / totals["add_to_cart"] if totals["add_to_cart"] else 0.0,
            "checkout_to_purchase_rate": totals["purchase"] / totals["begin_checkout"] if totals["begin_checkout"] else 0.0,
        }
    }
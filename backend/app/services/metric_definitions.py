METRIC_DEFINITIONS = {
    "purchases": "Count of purchase events.",
    "transactions": "Distinct count of ecommerce.transaction_id on purchase events.",
    "purchase_revenue": "Sum of ecommerce.purchase_revenue.",
    "total_item_quantity": "Sum of ecommerce.total_item_quantity.",
    "avg_order_value": "purchase_revenue / transactions.",
    "items_per_transaction": "total_item_quantity / transactions.",
    "product_views": "Count of view_item events.",
    "add_to_cart": "Count of add_to_cart events.",
    "begin_checkout": "Count of begin_checkout events.",
    "checkout_to_purchase_rate": "purchase / begin_checkout."
}

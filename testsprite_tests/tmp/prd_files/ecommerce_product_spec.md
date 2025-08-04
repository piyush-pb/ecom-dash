# E-commerce Customer Analytics & Operations Dashboard
## Product Specification Document

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Overview
The E-commerce Customer Analytics & Operations Dashboard is an integrated data platform that combines customer behavior tracking, sales analytics, inventory management, and operational workflows into a unified interface. Built using PostHog, SQL, Excel, and Retool, it enables e-commerce businesses to make data-driven decisions quickly and efficiently.

### 1.2 Product Goals
- **Primary**: Provide real-time visibility into business performance and customer behavior
- **Secondary**: Streamline operational workflows and reduce manual processes
- **Tertiary**: Enable predictive analytics for inventory and customer retention

### 1.3 Target Market
- Small to medium e-commerce businesses (annual revenue $100K - $10M)
- Direct-to-consumer brands with 100+ monthly orders
- Multi-channel retailers needing unified analytics

---

## 2. DETAILED FEATURE SPECIFICATIONS

### 2.1 REAL-TIME SALES DASHBOARD

#### 2.1.1 Feature Description
A comprehensive sales monitoring interface that displays key performance indicators in real-time, enabling quick decision-making and performance tracking.

#### 2.1.2 Functional Requirements

**Dashboard Widgets:**

| Widget | Data Source | Update Frequency | User Access |
|--------|-------------|------------------|-------------|
| Today's Revenue | SQL (orders table) | Real-time | All users |
| Orders Count | SQL (orders table) | Real-time | All users |
| Conversion Rate | PostHog + SQL | 15 minutes | Manager+ |
| Average Order Value | SQL (orders table) | Real-time | All users |
| Top Products | SQL (order_items join) | 1 hour | All users |
| Traffic Sources | PostHog events | 30 minutes | Manager+ |

**Time Period Filters:**
- Today, Yesterday, Last 7 days, Last 30 days, Custom range
- Year-over-year comparison toggle
- Hour-by-hour breakdown for current day

**SQL Implementation:**
```sql
-- Real-time revenue query
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    SUM(total) as revenue,
    COUNT(*) as order_count,
    AVG(total) as avg_order_value
FROM orders 
WHERE created_at >= CURRENT_DATE 
    AND status NOT IN ('cancelled', 'refunded')
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Top products query
SELECT 
    p.name,
    p.sku,
    SUM(oi.quantity) as units_sold,
    SUM(oi.quantity * oi.price) as revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND o.status = 'completed'
GROUP BY p.id, p.name, p.sku
ORDER BY revenue DESC
LIMIT 10;
```

**PostHog Integration:**
```javascript
// Track key sales events
posthog.capture('purchase_completed', {
    order_id: order.id,
    total: order.total,
    items_count: order.items.length,
    customer_type: customer.segment,
    source: customer.acquisition_source
});

// Conversion funnel setup
posthog.insight({
    insight: 'funnels',
    events: [
        { id: 'page_view', name: 'Product View' },
        { id: 'add_to_cart', name: 'Add to Cart' },
        { id: 'checkout_start', name: 'Checkout Started' },
        { id: 'purchase_completed', name: 'Purchase Completed' }
    ]
});
```

#### 2.1.3 Technical Specifications

**Retool Dashboard Configuration:**
- Grid layout with responsive breakpoints
- Auto-refresh every 30 seconds for real-time metrics
- Loading states and error handling for all widgets
- Export functionality for all charts and tables

**Performance Requirements:**
- Initial load time: < 2 seconds
- Widget refresh time: < 1 second
- Support for 50+ concurrent users
- 99.9% uptime SLA

#### 2.1.4 Acceptance Criteria
- [ ] All widgets load within 2 seconds
- [ ] Data accuracy verified against source systems (>99.5%)
- [ ] Mobile responsive design works on tablets
- [ ] Real-time updates function correctly
- [ ] Export functionality works for all visualizations
- [ ] User permissions properly restrict access to sensitive data

---

### 2.2 CUSTOMER BEHAVIOR ANALYTICS

#### 2.2.1 Feature Description
Comprehensive customer journey tracking and analysis system that captures user interactions, segments customers, and provides actionable insights for retention and acquisition.

#### 2.2.2 Functional Requirements

**Customer Segmentation:**

| Segment | Criteria | Update Frequency |
|---------|----------|------------------|
| New Customers | First purchase < 30 days | Daily |
| Repeat Customers | 2+ purchases | Daily |
| VIP Customers | LTV > $500 OR 5+ orders | Daily |
| At-Risk Customers | No purchase 60+ days | Daily |
| Churned Customers | No purchase 180+ days | Weekly |

**Behavioral Tracking Events:**
```javascript
// Core tracking events
const trackingEvents = {
    // Navigation events
    'page_view': { page, category, product_id?, user_id? },
    'search': { query, results_count, user_id? },
    'filter_applied': { filter_type, filter_value, results_count },
    
    // Shopping events
    'product_viewed': { product_id, category, price, user_id? },
    'add_to_cart': { product_id, quantity, price, cart_total },
    'remove_from_cart': { product_id, quantity, price, cart_total },
    'wishlist_add': { product_id, user_id },
    
    // Checkout events
    'checkout_started': { cart_total, items_count, user_id? },
    'shipping_info_added': { shipping_method, cost },
    'payment_info_added': { payment_method },
    'purchase_completed': { order_id, total, items, customer_id },
    
    // Account events
    'account_created': { source, method },
    'login': { method },
    'profile_updated': { fields_changed }
};
```

**Customer Analytics Queries:**
```sql
-- Customer lifetime value calculation
WITH customer_metrics AS (
    SELECT 
        customer_id,
        COUNT(*) as total_orders,
        SUM(total) as lifetime_value,
        AVG(total) as avg_order_value,
        MIN(created_at) as first_order_date,
        MAX(created_at) as last_order_date,
        EXTRACT(DAYS FROM (MAX(created_at) - MIN(created_at))) as customer_lifespan_days
    FROM orders 
    WHERE status = 'completed'
    GROUP BY customer_id
)
SELECT 
    cm.*,
    CASE 
        WHEN total_orders = 1 THEN 'New'
        WHEN total_orders >= 5 OR lifetime_value >= 500 THEN 'VIP'
        WHEN CURRENT_DATE - last_order_date::date > 60 THEN 'At-Risk'
        WHEN CURRENT_DATE - last_order_date::date > 180 THEN 'Churned'
        ELSE 'Regular'
    END as customer_segment,
    lifetime_value / NULLIF(customer_lifespan_days, 0) * 365 as annual_value
FROM customer_metrics;

-- Cohort analysis query
SELECT 
    DATE_TRUNC('month', first_order_date) as cohort_month,
    period_number,
    COUNT(DISTINCT customer_id) as customers,
    SUM(revenue) as cohort_revenue
FROM (
    SELECT 
        c.customer_id,
        c.first_order_date,
        EXTRACT(YEAR FROM AGE(o.created_at, c.first_order_date)) * 12 + 
        EXTRACT(MONTH FROM AGE(o.created_at, c.first_order_date)) as period_number,
        o.total as revenue
    FROM customer_first_orders c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.status = 'completed'
) cohort_data
GROUP BY cohort_month, period_number
ORDER BY cohort_month, period_number;
```

#### 2.2.3 Customer Journey Visualization

**Retool Implementation:**
- Sankey diagram for customer flow through website
- Cohort analysis heatmap
- Customer segment distribution pie chart
- Funnel analysis with drop-off points
- Geographic distribution map

#### 2.2.4 Acceptance Criteria
- [ ] All customer events tracked accurately (>99% capture rate)
- [ ] Customer segments update automatically based on behavior
- [ ] Cohort analysis displays retention rates correctly
- [ ] Journey visualization loads within 3 seconds
- [ ] Data can be filtered by time period, segment, and acquisition source

---

### 2.3 INVENTORY MANAGEMENT SYSTEM

#### 2.3.1 Feature Description
Automated inventory tracking and management system with low-stock alerts, reorder recommendations, and supplier management capabilities.

#### 2.3.2 Functional Requirements

**Inventory Tracking Features:**

| Feature | Description | Data Source | Alert Threshold |
|---------|-------------|-------------|-----------------|
| Stock Levels | Current quantity on hand | SQL (products) | Configurable per product |
| Reorder Points | Automatic reorder triggers | Calculated | When stock <= reorder_point |
| Stock Valuation | Total inventory value | SQL calculation | Monthly variance > 10% |
| Fast/Slow Movers | Product velocity analysis | SQL + time series | Weekly analysis |
| Supplier Performance | Lead times and quality metrics | Manual + automated | SLA breaches |

**Inventory Calculations:**
```sql
-- Stock status with reorder recommendations
SELECT 
    p.id,
    p.name,
    p.sku,
    p.stock_quantity,
    p.reorder_point,
    p.cost,
    p.stock_quantity * p.cost as stock_value,
    CASE 
        WHEN p.stock_quantity <= 0 THEN 'Out of Stock'
        WHEN p.stock_quantity <= p.reorder_point THEN 'Low Stock'
        WHEN p.stock_quantity <= p.reorder_point * 2 THEN 'Watch'
        ELSE 'Normal'
    END as stock_status,
    COALESCE(sales_data.avg_daily_sales, 0) as avg_daily_sales,
    CASE 
        WHEN COALESCE(sales_data.avg_daily_sales, 0) > 0 
        THEN p.stock_quantity / sales_data.avg_daily_sales 
        ELSE NULL 
    END as days_of_stock_remaining
FROM products p
LEFT JOIN (
    SELECT 
        oi.product_id,
        AVG(daily_sales.quantity) as avg_daily_sales
    FROM (
        SELECT 
            oi.product_id,
            DATE(o.created_at) as sale_date,
            SUM(oi.quantity) as quantity
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
            AND o.status = 'completed'
        GROUP BY oi.product_id, DATE(o.created_at)
    ) daily_sales
    GROUP BY product_id
) sales_data ON p.id = sales_data.product_id
ORDER BY 
    CASE stock_status
        WHEN 'Out of Stock' THEN 1
        WHEN 'Low Stock' THEN 2
        WHEN 'Watch' THEN 3
        ELSE 4
    END,
    days_of_stock_remaining ASC NULLS LAST;

-- ABC Analysis for inventory prioritization
WITH product_revenue AS (
    SELECT 
        p.id,
        p.name,
        p.sku,
        SUM(oi.quantity * oi.price) as total_revenue,
        SUM(oi.quantity) as total_quantity_sold
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at >= CURRENT_DATE - INTERVAL '12 months'
        AND o.status = 'completed'
    GROUP BY p.id, p.name, p.sku
),
ranked_products AS (
    SELECT 
        *,
        SUM(total_revenue) OVER() as total_business_revenue,
        total_revenue / SUM(total_revenue) OVER() * 100 as revenue_percentage,
        SUM(total_revenue / SUM(total_revenue) OVER() * 100) OVER(ORDER BY total_revenue DESC) as cumulative_percentage
    FROM product_revenue
)
SELECT 
    *,
    CASE 
        WHEN cumulative_percentage <= 80 THEN 'A - High Value'
        WHEN cumulative_percentage <= 95 THEN 'B - Medium Value'  
        ELSE 'C - Low Value'
    END as abc_category
FROM ranked_products
ORDER BY total_revenue DESC;
```

**Automated Alerts System:**
```sql
-- Create alerts table
CREATE TABLE inventory_alerts (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    alert_type VARCHAR(50), -- 'low_stock', 'out_of_stock', 'overstock', 'no_sales'
    severity VARCHAR(20), -- 'high', 'medium', 'low'
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    acknowledged_by INTEGER -- user_id
);

-- Daily alert generation procedure
CREATE OR REPLACE FUNCTION generate_inventory_alerts()
RETURNS void AS $$
BEGIN
    -- Clear existing unresolved alerts
    DELETE FROM inventory_alerts WHERE resolved_at IS NULL;
    
    -- Out of stock alerts
    INSERT INTO inventory_alerts (product_id, alert_type, severity, message)
    SELECT 
        id,
        'out_of_stock',
        'high',
        'Product ' || name || ' (' || sku || ') is out of stock'
    FROM products 
    WHERE stock_quantity <= 0;
    
    -- Low stock alerts  
    INSERT INTO inventory_alerts (product_id, alert_type, severity, message)
    SELECT 
        id,
        'low_stock',
        'medium',
        'Product ' || name || ' (' || sku || ') is below reorder point (' || stock_quantity || '/' || reorder_point || ')'
    FROM products 
    WHERE stock_quantity > 0 AND stock_quantity <= reorder_point;
    
END;
$$ LANGUAGE plpgsql;
```

#### 2.3.3 Excel Integration for Inventory Planning

**Weekly Inventory Report:**
- Automated export of stock levels, sales velocity, and reorder recommendations
- Pivot tables for category-wise analysis
- Charts showing stock trends and seasonal patterns
- Supplier performance scorecards

**Excel Template Structure:**
```
Sheet 1: Current Stock Status
- Product details with current stock levels
- Days of inventory remaining
- Reorder recommendations

Sheet 2: Sales Velocity Analysis  
- 30/60/90 day sales trends
- Seasonal adjustment factors
- ABC classification

Sheet 3: Purchase Planning
- Suggested purchase orders by supplier
- Budget impact analysis
- Lead time considerations

Sheet 4: Performance Metrics
- Stockout frequency
- Inventory turnover rates
- Carrying cost analysis
```

#### 2.3.4 Acceptance Criteria
- [ ] Stock levels update in real-time with each order
- [ ] Low stock alerts trigger automatically based on reorder points
- [ ] ABC analysis categorizes products correctly
- [ ] Excel reports generate automatically weekly
- [ ] Supplier performance metrics calculate accurately
- [ ] Inventory valuation matches accounting records

---

### 2.4 ORDER MANAGEMENT INTERFACE

#### 2.4.1 Feature Description
Comprehensive order processing and customer service interface that enables efficient order lookup, status management, and customer communication.

#### 2.4.2 Functional Requirements

**Order Search & Filtering:**
```sql
-- Advanced order search query
SELECT 
    o.id,
    o.created_at,
    o.status,
    o.total,
    c.email,
    c.first_name,
    c.last_name,
    COUNT(oi.product_id) as item_count,
    STRING_AGG(p.name, ', ') as products
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE 1=1
    AND ($1 IS NULL OR o.id::text ILIKE '%' || $1 || '%')
    AND ($2 IS NULL OR c.email ILIKE '%' || $2 || '%')
    AND ($3 IS NULL OR o.status = $3)
    AND ($4 IS NULL OR o.created_at >= $4)
    AND ($5 IS NULL OR o.created_at <= $5)
GROUP BY o.id, o.created_at, o.status, o.total, c.email, c.first_name, c.last_name
ORDER BY o.created_at DESC
LIMIT $6 OFFSET $7;
```

**Order Status Workflow:**
| Status | Description | Next Allowed Status | Automated Actions |
|--------|-------------|-------------------|-------------------|
| pending | Payment received, awaiting fulfillment | processing, cancelled | Inventory reservation |
| processing | Order being prepared | shipped, cancelled | Update customer via email |
| shipped | Order dispatched | delivered, returned | Send tracking information |
| delivered | Order completed successfully | returned | Request review |
| cancelled | Order cancelled before shipping | refunded | Release inventory |
| refunded | Payment returned to customer | - | Update accounting |
| returned | Product returned by customer | refunded, exchanged | Quality inspection |

**Bulk Operations Interface:**
```javascript
// Retool bulk operations component
const BulkOrderActions = {
    actions: [
        {
            id: 'update_status',
            label: 'Update Status',
            component: 'select',
            options: ['processing', 'shipped', 'cancelled'],
            validation: (orders, newStatus) => {
                return orders.every(order => 
                    isValidStatusTransition(order.status, newStatus)
                );
            }
        },
        {
            id: 'send_notification',
            label: 'Send Notification',
            component: 'textarea',
            placeholder: 'Enter message to customers...'
        },
        {
            id: 'export_orders',
            label: 'Export to Excel',
            component: 'button',
            action: () => exportOrdersToExcel(selectedOrders)
        }
    ]
};
```

#### 2.4.3 Customer Service Features

**Customer Profile Integration:**
```sql
-- Complete customer profile query
WITH customer_summary AS (
    SELECT 
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.phone,
        c.created_at as customer_since,
        COUNT(o.id) as total_orders,
        SUM(CASE WHEN o.status = 'completed' THEN o.total ELSE 0 END) as lifetime_value,
        AVG(CASE WHEN o.status = 'completed' THEN o.total ELSE NULL END) as avg_order_value,
        MAX(o.created_at) as last_order_date,
        COUNT(CASE WHEN o.status = 'returned' THEN 1 END) as return_count
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    WHERE c.id = $1
    GROUP BY c.id, c.email, c.first_name, c.last_name, c.phone, c.created_at
)
SELECT 
    cs.*,
    CASE 
        WHEN cs.lifetime_value >= 1000 THEN 'VIP'
        WHEN cs.total_orders >= 5 THEN 'Loyal'
        WHEN cs.total_orders = 1 THEN 'New'
        ELSE 'Regular'
    END as customer_tier,
    EXTRACT(DAYS FROM (CURRENT_DATE - cs.last_order_date::date)) as days_since_last_order
FROM customer_summary cs;
```

**Communication Log:**
```sql
-- Customer communication tracking
CREATE TABLE customer_communications (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    order_id INTEGER REFERENCES orders(id),
    communication_type VARCHAR(50), -- 'email', 'phone', 'chat', 'sms'
    direction VARCHAR(20), -- 'inbound', 'outbound'
    subject VARCHAR(255),
    message TEXT,
    handled_by INTEGER, -- user_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE
);
```

#### 2.4.4 Acceptance Criteria
- [ ] Orders can be searched by ID, customer email, status, date range
- [ ] Order status updates trigger appropriate automated emails
- [ ] Bulk operations work for up to 100 orders simultaneously
- [ ] Customer profile displays complete order history and metrics
- [ ] Communication log captures all customer interactions
- [ ] Interface loads within 2 seconds for order searches

---

### 2.5 FINANCIAL REPORTING & FORECASTING

#### 2.5.1 Feature Description
Comprehensive financial analytics combining real-time data with Excel-based modeling for budgeting, forecasting, and profitability analysis.

#### 2.5.2 Functional Requirements

**Revenue Analytics:**
```sql
-- Daily revenue breakdown with trends
WITH daily_revenue AS (
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total) as gross_revenue,
        SUM(total - COALESCE(discount_amount, 0)) as net_revenue,
        AVG(total) as avg_order_value,
        COUNT(DISTINCT customer_id) as unique_customers
    FROM orders 
    WHERE status IN ('completed', 'shipped', 'delivered')
        AND created_at >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY DATE(created_at)
),
revenue_with_trends AS (
    SELECT 
        *,
        LAG(net_revenue, 1) OVER (ORDER BY date) as prev_day_revenue,
        LAG(net_revenue, 7) OVER (ORDER BY date) as prev_week_revenue,
        AVG(net_revenue) OVER (
            ORDER BY date 
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) as seven_day_avg
    FROM daily_revenue
)
SELECT 
    *,
    CASE 
        WHEN prev_day_revenue > 0 THEN 
            (net_revenue - prev_day_revenue) / prev_day_revenue * 100
        ELSE NULL 
    END as day_over_day_growth,
    CASE 
        WHEN prev_week_revenue > 0 THEN 
            (net_revenue - prev_week_revenue) / prev_week_revenue * 100
        ELSE NULL 
    END as week_over_week_growth
FROM revenue_with_trends
ORDER BY date DESC;
```

**Profitability Analysis:**
```sql
-- Product profitability with margins
SELECT 
    p.id,
    p.name,
    p.category,
    p.price as selling_price,
    p.cost as product_cost,
    p.price - p.cost as gross_profit_per_unit,
    (p.price - p.cost) / p.price * 100 as gross_margin_percent,
    COALESCE(sales_data.units_sold, 0) as units_sold_30d,
    COALESCE(sales_data.revenue, 0) as revenue_30d,
    COALESCE(sales_data.gross_profit, 0) as gross_profit_30d
FROM products p
LEFT JOIN (
    SELECT 
        oi.product_id,
        SUM(oi.quantity) as units_sold,
        SUM(oi.quantity * oi.price) as revenue,
        SUM(oi.quantity * (oi.price - p.cost)) as gross_profit
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
        AND o.status = 'completed'
    GROUP BY oi.product_id
) sales_data ON p.id = sales_data.product_id
ORDER BY gross_profit_30d DESC NULLS LAST;
```

#### 2.5.3 Excel Financial Models

**Monthly P&L Template:**
```
A. REVENUE
   1. Gross Sales             [SQL: SUM(orders.total)]
   2. Returns & Refunds       [SQL: SUM(refunds)]  
   3. Net Sales               [A1 - A2]
   4. Shipping Revenue        [SQL: SUM(shipping_cost)]
   
B. COST OF GOODS SOLD
   1. Product Costs           [SQL: SUM(quantity * product_cost)]
   2. Shipping Costs          [External data]
   3. Payment Processing      [Net Sales * 0.029]
   4. Total COGS              [B1 + B2 + B3]

C. GROSS PROFIT               [A3 - B4]
   Gross Margin %             [C / A3 * 100]

D. OPERATING EXPENSES
   1. Marketing Spend         [External data]
   2. Staff Costs             [External data]
   3. Software & Tools        [External data]
   4. Other Expenses          [External data]
   5. Total OpEx              [SUM(D1:D4)]

E. NET PROFIT                 [C - D5]
   Net Margin %               [E / A3 * 100]
```

**Forecasting Model:**
```excel
// 12-month revenue forecast
=FORECAST.LINEAR(
    future_month,
    historical_revenue_range,
    historical_month_range
) * seasonality_factor * growth_adjustment
```

**Cash Flow Projection:**
```
CASH INFLOWS:
- Daily Revenue (from SQL)      × Collection Rate (95%)
- Accounts Receivable Collection

CASH OUTFLOWS:  
- Inventory Purchases           (Lead time adjusted)
- Operating Expenses            (Fixed schedule)
- Marketing Spend              (Campaign calendar)
- Tax Payments                 (Quarterly)

NET CASH FLOW = Inflows - Outflows
CUMULATIVE CASH = Previous Balance + Net Cash Flow
```

#### 2.5.4 Automated Reporting

**Daily Financial Summary (SQL → Excel):**
```sql
-- Export query for daily financial dashboard
SELECT 
    'Revenue' as metric_category,
    'Gross Revenue' as metric_name,
    SUM(total) as today_value,
    SUM(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '1 day' 
             AND created_at < CURRENT_DATE THEN total ELSE 0 END) as yesterday_value,
    'currency' as format_type
FROM orders 
WHERE created_at >= CURRENT_DATE 
    AND status IN ('completed', 'shipped', 'delivered')

UNION ALL

SELECT 
    'Orders' as metric_category,
    'Order Count' as metric_name,
    COUNT(*)::numeric as today_value,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '1 day' 
               AND created_at < CURRENT_DATE THEN 1 END)::numeric as yesterday_value,
    'number' as format_type
FROM orders 
WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
    AND status IN ('completed', 'shipped', 'delivered');
```

#### 2.5.5 Acceptance Criteria
- [ ] Financial metrics calculate accurately against manual verification
- [ ] Excel models update automatically with daily data exports
- [ ] Forecasting models show R² > 0.8 for established products
- [ ] Cash flow projections update weekly with latest data
- [ ] Profitability analysis includes all cost components
- [ ] Reports generate automatically and email to stakeholders

---

## 3. TECHNICAL ARCHITECTURE

### 3.1 System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   E-commerce    │    │   Customer      │    │   Marketing     │
│   Platform      │    │   Website/App   │    │   Channels      │
│   (Shopify/WC)  │    │                 │    │   (Ads/Email)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ API Webhooks         │ Event Tracking       │ UTM Tracking
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PostHog                                 │
│  • Event Collection    • User Identification  • Funnel Analysis │
│  • Session Recording   • A/B Testing         • Cohort Analysis  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Daily ETL
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │  customers  │ │   orders    │ │  products   │ │order_items  ││
│  │  - id       │ │  - id       │ │  - id       │ │  - order_id ││
│  │  - email    │ │  - cust_id  │ │  - name     │ │  - prod_id  ││
│  │  - created  │ │  - total    │ │  - price    │ │  - quantity ││
│  │  - ltv      │ │  - status   │ │  - stock    │ │  - price    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────┬───────────────────────────────────────┘
                          │ Real-time Queries
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Retool                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │Sales Dash   │ │Customer     │ │Inventory    │ │Order Mgmt   ││
│  │- Revenue    │ │Analytics    │ │Management   │ │- Search     ││
│  │- Conversion │ │- Segments   │ │- Stock      │ │- Status     ││
│  │- Top Prods  │ │- Cohorts    │ │- Alerts     │ │- Bulk Ops   ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────
---
layout: /src/layouts/ProjectLayout.astro
title: 'DataFlowX'
pubDate: 2025-05-10
description: 'An end-to-end data engineering pipeline: ingest → validate → transform → warehouse → dashboard, orchestrated with Airflow and dbt.'
languages: ["python", "airflow", "dbt", "bigquery", "docker", "great-expectations"]
image:
  url: "/images/projects/dataflowx.webp"
  alt: "Data pipeline DAG thumbnail."
---

# DataFlowX

**DataFlowX** is a production-style **data engineering pipeline** for a fictional e-commerce company. It ingests daily orders, customers, and product catalog data from mixed sources (REST API + CSV), validates with **Great Expectations**, transforms with **dbt**, loads into a warehouse (BigQuery or Postgres), and publishes metrics to a lightweight dashboard.

---

## 🧩 What it demonstrates

- Reliable **scheduled ingestion** with **Apache Airflow**  
- **Data quality gates** via **Great Expectations**  
- **Transform & model** using **dbt** (staging, marts, tests, docs)  
- **Warehouse-ready** schemas (BigQuery/Postgres)  
- **Containerized** with **Docker Compose**  
- **Metrics + dashboard** (Metabase)  
- **Observability**: task logs, quality reports, dbt docs  

---

## 🏗️ Architecture

1. **Extract** – orders via fake REST, customers/products via CSV  
2. **Validate** – GE checks for schema, nulls, PK/FK  
3. **Load raw** – into `raw_*` schemas/tables  
4. **Transform** – dbt staging + marts (`fct_orders`, `dim_customers`, `dim_products`)  
5. **Serve** – Metabase dashboards & SQL KPI views  

---

## 📁 Repo layout (conceptual)

```
dataflowx/
├─ airflow/dags/dag_dataflowx.py
├─ ingestion/load_api_orders.py
├─ ingestion/load_csv_customers.py
├─ ingestion/load_csv_products.py
├─ great_expectations/expectations/orders.json
├─ dbt/models/staging/stg_orders.sql
├─ dbt/models/marts/fct_orders.sql
├─ dbt/tests/schema.yml
└─ metabase/sql/kpis.sql
```

---

## ⚙️ Airflow DAG

```python
# airflow/dags/dag_dataflowx.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
from ingestion.load_api_orders import load_api_orders
from ingestion.load_csv_customers import load_csv_customers
from ingestion.load_csv_products import load_csv_products
from utils.validation import run_ge_checkpoint
from utils.dbt import run_dbt

default_args = {"owner": "data", "retries": 1, "retry_delay": timedelta(minutes=5)}

with DAG(
    dag_id="dataflowx_daily_etl",
    start_date=datetime(2025, 1, 1),
    schedule_interval="0 2 * * *",   # daily at 2am UTC
    catchup=False,
    default_args=default_args,
) as dag:

    t_orders = PythonOperator(task_id="ingest_orders", python_callable=load_api_orders)
    t_customers = PythonOperator(task_id="ingest_customers", python_callable=load_csv_customers)
    t_products = PythonOperator(task_id="ingest_products", python_callable=load_csv_products)

    t_validate = PythonOperator(task_id="validate_raw", python_callable=run_ge_checkpoint)
    t_dbt = PythonOperator(task_id="dbt_build", python_callable=lambda: run_dbt("build"))

    [t_orders, t_customers, t_products] >> t_validate >> t_dbt
```

---

## 🧪 Data quality (Great Expectations)

```json
{
  "expectations": [
    {"expectation_type": "expect_table_columns_to_match_set",
     "kwargs": {"column_set": ["order_id","order_ts","customer_id","product_id","quantity","unit_price","status"]}},
    {"expectation_type": "expect_column_values_to_be_unique", "kwargs": {"column": "order_id"}},
    {"expectation_type": "expect_column_values_to_not_be_null", "kwargs": {"column": "order_ts"}},
    {"expectation_type": "expect_column_values_to_be_between", "kwargs": {"column": "quantity", "min_value": 1}},
    {"expectation_type": "expect_column_values_to_match_regex", "kwargs": {"column": "status", "regex": "^(PAID|PENDING|REFUNDED)$"}}
  ]
}
```

---

## 🔁 Ingestion snippets

```python
# ingestion/load_api_orders.py
import json
from pathlib import Path
from utils.warehouse import write_raw_table

def load_api_orders(**_):
    data = json.loads(Path("seeds/orders_seed.json").read_text())
    write_raw_table("orders", data)
```

```python
# ingestion/load_csv_customers.py
import pandas as pd
from utils.warehouse import write_raw_df

def load_csv_customers(**_):
    df = pd.read_csv("seeds/customers.csv")
    write_raw_df("customers", df)
```

---

## 🧱 dbt models

**Staging**

```sql
-- dbt/models/staging/stg_orders.sql
select
  cast(order_id as bigint) as order_id,
  cast(customer_id as bigint) as customer_id,
  cast(product_id as bigint) as product_id,
  cast(quantity as int) as quantity,
  cast(unit_price as numeric) as unit_price,
  cast(order_ts as timestamp) as order_ts,
  upper(status) as status
from {{ source('raw', 'orders') }}
```

**Marts**

```sql
-- dbt/models/marts/fct_orders.sql
with o as (select * from {{ ref('stg_orders') }}),
p as (select * from {{ ref('stg_products') }}),
c as (select * from {{ ref('stg_customers') }})
select
  o.order_id,
  o.order_ts::date as order_date,
  o.customer_id,
  c.country,
  o.product_id,
  p.category,
  o.quantity,
  o.unit_price,
  (o.quantity * o.unit_price) as gross_revenue
from o
left join c on o.customer_id = c.customer_id
left join p on o.product_id = p.product_id
```

**Tests**

```yaml
# dbt/tests/schema.yml
version: 2
models:
  - name: stg_orders
    columns:
      - name: order_id
        tests: [unique, not_null]
      - name: customer_id
        tests: [not_null]
  - name: fct_orders
    columns:
      - name: gross_revenue
        tests: [not_null]
```

---

## 📊 Dashboard KPIs (Metabase)

```sql
-- metabase/sql/kpis.sql
select
  order_date,
  sum(gross_revenue) as daily_revenue,
  avg(gross_revenue) as avg_order_value,
  count(distinct order_id) as orders
from fct_orders
group by order_date
order by order_date desc;
```

---

## 🔧 Tech stack

- Python  
- Apache Airflow  
- dbt (Data Build Tool)  
- Great Expectations  
- Docker  
- Postgres / BigQuery  
- Metabase  

---

## 🎯 Objective

The goal of **DataFlowX** is to showcase **end-to-end data engineering skills**: ingestion, orchestration, validation, transformation, warehouse modeling, and dashboarding. It balances simplicity (for demo) with realism (for professional pipelines).

---

🚀 *Developed by Mo*

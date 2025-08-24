---
layout: /src/layouts/MarkdownPostLayout.astro
title: Apache Kafka for Data Engineers — A Practical, No-Fluff Guide
author: Mo
description: "Everything a data engineer needs to ship reliable streaming pipelines with Kafka: core concepts, topic design, delivery semantics, local setup, Python examples, and operating tips."
image:
  url: "/images/posts/kafka-foundations.webp"
  alt: "Kafka topics and partitions diagram with producers and consumers."
pubDate: 2025-08-24
tags: ["Data Engineering", "Kafka", "Streaming", "Event-Driven", "ETL", "CDC"]
languages: ["kafka", "python", "sql", "bash", "docker"]
---

Apache Kafka is the backbone of many real-time data platforms. Think of it as a durable, scalable **commit log** that decouples event **producers** from **consumers**. This post focuses on what data engineers actually need to design, build, and operate Kafka pipelines with confidence.

## Why Kafka (When You Already Have a Warehouse + Batch)

- **Decoupling:** Producers don’t need to know who consumes. Add new pipelines without touching upstreams.  
- **Scalability:** Partitioned topics let you scale throughput horizontally.  
- **Durability + Replay:** Events are stored on disk; you can reprocess from any offset.  
- **Ecosystem:** Connectors, stream processors (ksqlDB, Flink, Spark), Schema Registry, and robust clients.

Use Kafka when you need **near real-time** ingestion, **event-driven** workflows, or **exact-once** pipelines into sinks (DW, DB, lake).

---

## Core Concepts (The 80/20)

- **Topic:** Named stream of events (immutable records).  
- **Partition:** Ordered, append-only log shard. **Ordering is guaranteed per partition**.  
- **Key:** Determines partition (hash(key) → partition). Use stable keys for locality and joins.  
- **Offset:** Log position inside a partition.  
- **Consumer Group:** Scale reads; each partition is “owned” by at most one consumer in the group.  
- **Retention:** Time/size based; separate **compaction** keeps the latest record **per key**.  
- **Brokers & Replication:** Redundancy via `replication.factor` (commonly 3 in prod).

### Delivery semantics
- **At-most-once:** Fastest; risk of loss (commit before processing).  
- **At-least-once (default):** No loss; duplicates possible.  
- **Exactly-once:** Use **idempotent producers** + **transactions** (writes to multiple topics/sinks atomically), or stateful processors with EOS.

---

## Topic & Partition Design (Cheat Sheet)

1. **Start with throughput math**  
   - msgs/s × avg record size ≈ MB/s → divide by target per-partition throughput (e.g., 10–50 MB/s) to choose partition count.
2. **Choose a stable key**  
   - Examples: `user_id`, `order_id`, or a composite key like `tenant_id|entity_id`.  
   - Avoid hot keys; if unavoidable, **add a “hash salt”** or **key-bucketing** (`user_id % 16`) to spread load.
3. **Retention**  
   - **Time-based** for event streams (e.g., 7–30 days).  
   - **Compaction** for upsert/change streams (CDC, dimension tables). You can **combine**: compact + retain N days of history.
4. **Naming convention**  
   - `domain.context.entity.event_version` (e.g., `checkout.orders.v1`).  
   - Bump version on breaking schema changes.

---

## Schemas & Contracts

Use **Schema Registry** with **Avro** or **Protobuf** to enforce compatibility:

- **Backward compatible** for additive changes (new optional fields).  
- **No breaking changes** without a new subject version (e.g., `...-value-v2`).  
- Keep **keys tiny and stable**, values evolve.

---

## Local Dev: Minimal Docker Compose

```yaml
version: "3.8"
services:
  kafka:
    image: bitnami/kafka:3.7
    container_name: kafka
    environment:
      - KAFKA_CFG_NODE_ID=1
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@kafka:9093
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER
      - KAFKA_CFG_OFFSETS_TOPIC_REPLICATION_FACTOR=1
      - KAFKA_CFG_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1
      - KAFKA_CFG_TRANSACTION_STATE_LOG_MIN_ISR=1
    ports: ["9092:9092"]
  ui:
    image: provectuslabs/kafka-ui:latest
    environment:
      - KAFKA_CLUSTERS_0_NAME=local
      - KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=kafka:9092
    ports: ["8080:8080"]
    depends_on: [kafka]

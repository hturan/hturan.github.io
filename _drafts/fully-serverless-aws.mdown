---
title:  "Fully Serverless AWS Infrastructure"
---

## S3
- No SEO

## Lambda

## API Gateway
- Parameter mapping and passing arguments
- Tools (Gordon, Serverless, etc.)

## DynamoDB
- HTTP requests proxied by API Gateway mean that you don't need a CRUD layer
  - GET using LIST
  - POST using UpdateItem and Insert
- Awful request mapping nonsense, double-check JSON shape
- Type specification through crazy strings

---

Would I reccommend this approach?

No.

At least, not without investing time in abstracting infrastructure by building tools on top of it.

Whilst this architecture gives us an incredibly scaleable modern web application, the amount of configuration needed is monumental.

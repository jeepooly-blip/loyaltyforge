# LoyaltyForge Public API v1

Base URL: `https://<your-deployment>/api/v1`

All requests must include your organization's API key, generated in the app
under **API & Widget**. Send it either as:

```
Authorization: Bearer lf_live_xxxxxxxxxxxxxxxxxxxx
```

or:

```
x-api-key: lf_live_xxxxxxxxxxxxxxxxxxxx
```

A key belongs to one organization; every request is automatically scoped to
that organization's programs and customers.

---

## Enroll a customer

```
POST /api/v1/programs/:programId/customers
```

Body:

```json
{
  "externalId": "customer-123",
  "name": "Alex Chen",
  "email": "alex@example.com",
  "phone": "+1-555-0100"
}
```

`externalId` is your own identifier for the customer (POS customer ID, email,
loyalty card number, etc.) — it's how LoyaltyForge recognizes the same person
across calls. If a customer with that `externalId` doesn't exist yet, one is
created.

Response:

```json
{ "customerId": "...", "externalId": "customer-123", "programId": "...", "balance": 0, "tier": null }
```

---

## Record an earn event

```
POST /api/v1/programs/:programId/earn
```

The program must be **published**. Provide either an explicit `amount`
(stamps or points to add), or a dollar `spend` amount and let LoyaltyForge
compute the amount from the program's rules (points-per-dollar, or one stamp
per qualifying visit). If the customer isn't enrolled yet, they're enrolled
automatically.

Body (explicit amount):

```json
{ "externalId": "customer-123", "amount": 1, "orderId": "order-456" }
```

Body (dollar-based, rules-driven):

```json
{ "externalId": "customer-123", "spend": 12.50, "orderId": "order-456" }
```

Response:

```json
{ "customerId": "...", "programId": "...", "earned": 1, "balance": 4, "tier": null }
```

---

## Redeem a reward

```
POST /api/v1/programs/:programId/redeem
```

If `amount` is omitted, it defaults to the program's configured reward cost
(`stampsRequired` for Stamp Card programs, `pointsForReward` for Points
programs). Returns `400` if the customer's balance is insufficient.

Body:

```json
{ "externalId": "customer-123" }
```

Response:

```json
{ "customerId": "...", "programId": "...", "redeemed": 10, "balance": 0 }
```

---

## Check balance

```
GET /api/v1/programs/:programId/balance?externalId=customer-123
```

Response:

```json
{ "customerId": "...", "programId": "...", "balance": 4, "tier": null, "enrolled": true }
```

---

## Errors

All errors are returned as `{ "error": "message" }` with an appropriate HTTP
status code (`400` invalid input, `401` invalid/missing API key, `404` not
found).

---

## Widget-facing endpoints (no API key)

These power `public/widget.js` and are intentionally unauthenticated, since
they run in a customer's browser on the cafe's own site. They're scoped by
organization **slug** (not a secret) and only ever allow a customer to act on
their own record via their email address.

- `GET /api/public/orgs/:slug/programs` — list published programs
- `POST /api/public/orgs/:slug/programs/:id/join` — self-enroll with `{ email, name? }`
- `GET /api/public/orgs/:slug/programs/:id/balance?email=...` — self-service balance check

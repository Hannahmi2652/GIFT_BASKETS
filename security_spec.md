# Little Moments – Gift Baskets: Firestore Security Specification

## 1. Data Invariants
1. **Strict Schema Enforcement**: Every document in `/submissions/{submissionId}` must contain strictly the five allowed fields (`fullName`, `phoneNumber`, `language`, `status`, `createdAt`) with no extra shadow fields.
2. **Boundary & Format Validation**: `fullName` must be 2–120 characters; `phoneNumber` must be 5–32 characters matching `^[+0-9()\-\s.]{5,32}$`; `language` must be one of `'en'`, `'fr'`, `'he'`.
3. **Server Timestamp Integrity**: On `create`, `createdAt` must equal `request.time` (server timestamp) and `status` must start as `'new'`.
4. **PII Isolation**: Customer names and phone numbers are PII. Public visitors and unverified accounts cannot `get`, `list`, `update`, or `delete` any document in `/submissions`.
5. **Verified Owner Access Only**: Only the verified business owner (`request.auth.token.email == 'hmazoulay@gmail.com' && request.auth.token.email_verified == true`) can read, list, update (`status` only), or delete submissions.
6. **Immutability After Creation**: During admin `update`, `fullName`, `phoneNumber`, `language`, and `createdAt` are immutable; only `status` (`'new'` or `'contacted'`) may change.

## 2. Adversarial "Dirty Dozen" Test Payloads
1. **Unauthenticated List Attempt**: `list /submissions` without auth -> `PERMISSION_DENIED`.
2. **Unauthenticated Get Attempt**: `get /submissions/sub1` without auth -> `PERMISSION_DENIED`.
3. **Non-Admin Authenticated Read**: `get /submissions/sub1` signed in as `other@example.com` -> `PERMISSION_DENIED`.
4. **Unverified Admin Email Spoof**: `list /submissions` with `email: 'hmazoulay@gmail.com'`, `email_verified: false` -> `PERMISSION_DENIED`.
5. **Shadow Field Injection on Create**: `create /submissions/sub1` with extra `isAdmin: true` field -> `PERMISSION_DENIED`.
6. **Client-Forged Timestamp on Create**: `create /submissions/sub1` with `createdAt` set to a past date instead of `request.time` -> `PERMISSION_DENIED`.
7. **Pre-Marked Contacted Status on Create**: `create /submissions/sub1` with `status: 'contacted'` -> `PERMISSION_DENIED`.
8. **Oversized Full Name (Denial of Wallet)**: `create /submissions/sub1` with 5000-character `fullName` -> `PERMISSION_DENIED`.
9. **Invalid Phone Format**: `create /submissions/sub1` with `phoneNumber: '<script>alert(1)</script>'` -> `PERMISSION_DENIED`.
10. **Invalid Language Code**: `create /submissions/sub1` with `language: 'de'` -> `PERMISSION_DENIED`.
11. **ID Poisoning on Create**: `create /submissions/invalid id with spaces!` -> `PERMISSION_DENIED`.
12. **Admin Mutating Customer Name on Update**: `update /submissions/sub1` modifying `fullName` instead of only `status` -> `PERMISSION_DENIED`.

# Big Red Social Publisher future scheduling integration

Applied to the deployed `bigred-social-publisher-staging` Worker on 2026-10-30.

The repository did not contain the deployed Worker module set, so this directory records the new module and the exact integration edits without replacing the existing application architecture.

## `review-store.mjs`

In `ReviewStore.openWindow`, remove the legacy requirement that a new 14-day window begin after `END`. `dateInfo(start)` remains the calendar/lower-bound validator, so arbitrary future windows are accepted without a monthly code change.

```diff
- dateInfo(start);assert(start>END&&typeof actor==='string'&&actor.length>3,'future-review-window-required');
+ dateInfo(start);assert(typeof actor==='string'&&actor.length>3,'future-review-window-required');
```

## `review-import.mjs`

Permit the private import path to omit an asset ID. After validating and hashing the bytes, generate a Publisher-native content ID (`seasonal-<48 hex>`). The Drive ID remains provenance only.

```diff
- if(!a||!/^[A-Za-z0-9_-]{1,120}$/.test(a.id)||!['image/jpeg','image/png'].includes(a.mime))throw Error('invalid-asset-import');
+ if(!a||(a.id!=null&&!/^[A-Za-z0-9_-]{1,120}$/.test(a.id))||!['image/jpeg','image/png'].includes(a.mime))throw Error('invalid-asset-import');
- const sha256=await digest(data),key='review-image:'+sha256;
+ const sha256=await digest(data),key='review-image:'+sha256,id=a.id||a.kind+'-'+sha256.slice(0,48);
- return ledger.reviewCommand('install-asset',{asset:{...a,sha256,key,bytes:data.byteLength}},'private-staging-import');
+ return ledger.reviewCommand('install-asset',{asset:{...a,id,sha256,key,bytes:data.byteLength}},'private-staging-import');
```

## `worker.mjs`

- Import `importFutureDrafts` from `future-import.mjs`.
- Add the production-only `import-future` Durable Object command.
- Add the private queue commands `production-import-review-asset` and `production-import-future-batch`.
- Verify every referenced private image before committing the atomic draft batch.

Production setting `AUTHORIZED_END` is intentionally blank. The existing start date, approval hash validation, unapproved-content block, duplicate-date checks, durable delivery locks, and cron scheduler remain in force.

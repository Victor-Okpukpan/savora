# savings-circle

A Clarity smart contract implementing Ajo/Esusu-style rotating savings circles on Stacks, denominated in native STX.

**Status: testnet only.** This has not been audited. Do not deploy to mainnet or use with real funds without a proper security review.

## How a circle works

1. **Create** — anyone can create a circle, choosing a contribution amount (in µSTX), a fixed number of members, whether it runs for one pass or loops indefinitely (multi-pass), and a minimum cadence between rounds (in Bitcoin blocks — 0 means no minimum, rounds can happen back-to-back). The creator automatically becomes member #0.
2. **Join** — other wallets join until every slot is filled. Once full, the circle becomes active. Join order is fixed and doubles as payout order — whoever joined first gets paid first.
3. **Contribute** — every round, all members must pay in the fixed contribution amount. Once the last member pays, the round settles automatically in that same transaction. A round can't accept contributions until the circle's cadence requirement has elapsed since the previous round finished (round 1 is always open immediately).
4. **Payout** — the pot (everyone's contribution, plus any leftover penalty bonus — see below) is split: a protocol fee goes to the treasury, the rest goes to whoever's turn it is.
5. **Pass completion** — once every member has been paid once, that's one full pass.
   - **Single-pass circles** end automatically here.
   - **Multi-pass circles** loop back to member #0 and start a new pass, and keep doing so until the creator explicitly ends it (see `end-circle` below).
6. **Leaving early** forfeits a percentage of *net* contributions (what you've paid in minus what you've already received as a payout — so someone who already got their payout and leaves afterward forfeits nothing further). That penalty splits between the circle's pot (as a bonus added to the next payout) and the protocol treasury. Whatever's left is refunded immediately.

### What v1 deliberately does not handle

- **Missed payments.** If someone doesn't pay their share, the round just sits stuck — nobody gets paid until they do (or leave). There's no deadline, timeout, or penalty for lateness — the cadence gate only enforces a *minimum* gap between rounds, not a deadline for the current one.
- **Mid-circle membership changes.** No backfilling an open slot after someone leaves, no adding members after a circle goes active.
- **Reshuffling payout order.** It's always join order, every pass.

These are known, deliberate scope cuts for the first version — not oversights.

## Contract reference

### Public (state-changing) functions

| Function | Who can call | What it does |
|---|---|---|
| `create-circle(contribution-amount, member-count, multi-pass, cycle-length-blocks)` | anyone | Creates a circle, caller joins as member #0. `cycle-length-blocks` is the minimum Bitcoin-block gap enforced between rounds (0 = none, capped at ~2 years). Returns the new `circle-id`. |
| `join-circle(circle-id)` | anyone not already in it | Joins an open circle. Flips it to active once full. |
| `contribute(circle-id)` | active members | Pays the round's contribution. Triggers payout automatically if it's the last contribution needed. |
| `leave-circle(circle-id)` | active members | Exits the circle early, forfeiting a penalty on net contributions (see above). |
| `end-circle(circle-id)` | the circle's creator only | Ends a multi-pass circle. Only callable right after a full pass has completed — never mid-round. |
| `set-admin(new-admin)` | current admin only | Transfers the admin role. |
| `set-treasury(new-treasury)` | current admin only | Changes where protocol fees are sent. |
| `set-round-fee-percent(percent)` | current admin only | Changes the per-round protocol fee (0-100). |
| `set-leave-penalty-percents(pot-percent, treasury-percent)` | current admin only | Changes the leave-penalty split (must sum to ≤100). |

### Read-only functions

| Function | Returns |
|---|---|
| `get-circle(circle-id)` | Full circle state, or `none` if it doesn't exist. |
| `get-member-info(circle-id, member)` | A member's `index`, `total-contributed`, `total-received`, `has-left`, or `none`. |
| `get-circle-member(circle-id, index)` | The principal at that slot, or `none`. |
| `has-contributed-this-round(circle-id, member)` | `true`/`false`. |
| `get-circle-count()` | Total circles ever created. Circle ids are `0..count-1`, so a frontend enumerates every circle by iterating that range — there's no separate index. |
| `get-admin()` / `get-treasury()` / `get-fee-config()` | Current protocol configuration. |

### Current defaults (admin-adjustable)

- Round fee: **3%** of the pot, sent to the treasury on every payout.
- Leave penalty: **20%** of net contributions — **15%** stays in the circle's pot (bonus for the next payout), **5%** goes to the treasury.

### Error codes

| Code | Meaning |
|---|---|
| `u100` | Caller is not the admin |
| `u101` | Caller is not the circle's creator |
| `u102` | Circle doesn't exist |
| `u103` | Circle isn't open (already full, active, or ended) |
| `u104` | Caller is already a member |
| `u105` | Caller is not a member |
| `u106` | Circle isn't active |
| `u107` | Caller already contributed this round |
| `u108` | Caller already left |
| `u109` | Can't end the circle mid-pass — wait for a pass to complete |
| `u110` | Invalid percentage (out of range, or a leave-penalty split summing over 100) |
| `u111` | Invalid circle parameters (zero contribution, or member count outside 2-100) |
| `u112` | Internal: expected member slot not found |
| `u113` | Round isn't open yet — the circle's cadence gap hasn't elapsed since the last round |

## Project layout

Standard Clarinet project:

```
clarity/
├── Clarinet.toml           # project + contract config
├── contracts/
│   └── savings-circle-v2.clar   # see "Contract naming / versioning" below for why "v2"
├── tests/
│   └── savings-circle.test.ts   # vitest suite (18 tests) using the Clarinet SDK simnet
├── settings/
│   ├── Devnet.toml
│   ├── Testnet.toml         # deployer account config for testnet deploys
│   └── Mainnet.toml
└── deployments/              # generated deployment plans (gitignored contents aside from what you commit)
```

This is a subdirectory of the main Savora repo, kept separate from the Next.js app's own tooling (`../tsconfig.json` and `../eslint.config.mjs` both explicitly exclude `clarity/`).

## Local development

Requires the [`clarinet` CLI](https://github.com/stx-labs/clarinet) (this project was built against v3.23.0).

```bash
cd clarity
npm install          # installs the vitest + Clarinet SDK test tooling
clarinet check        # syntax/type check + static analysis lints
npm test               # runs the vitest suite against Clarinet's simnet (no network needed)
```

`clarinet check` should report 0 errors and 0 warnings. If you touch the contract, run both before assuming it's fine — `clarinet check` catches syntax/type issues, but only the test suite verifies the actual money-flow logic (fee math, penalty splits, pass/round transitions) is correct.

> **Note:** the contract is pinned to `clarity_version = 3` in `Clarinet.toml`. The Clarinet scaffold's default (`clarity_version = 6`) silently breaks `as-contract` — a core primitive this contract depends on for every STX transfer. Don't bump that version without re-verifying `as-contract` still resolves.

### Contract naming / versioning

Stacks contracts are immutable and identified by `(deployer-address, contract-name)` — you **cannot** redeploy over the same name from the same address; the network rejects it with `ContractAlreadyExists`. We hit this the first time we needed to ship a breaking contract change (adding `cycle-length-blocks`).

Since redeploying to a fresh address just to keep the name `savings-circle` would mean provisioning and re-funding a whole new deployer wallet, the simpler fix is to **version the contract name** instead, reusing the same deployer:

1. Rename the `.clar` file (`savings-circle.clar` → `savings-circle-v2.clar`, etc.).
2. Update its `[contracts.*]` section in `Clarinet.toml` to match (both the section key and `path`).
3. Update the `CONTRACT` constant in `tests/savings-circle.test.ts`.
4. `clarinet check` + `npm test` to confirm nothing broke, then redeploy as normal.

The currently deployed name is **`savings-circle-v2`** — check the section header in `Clarinet.toml` if this drifts out of date.

## Deploying to testnet

1. **Use a dedicated deployer wallet**, not your personal one — whoever deploys becomes the contract's `admin`, a privileged role that can change the treasury address and fee percentages. Create a fresh wallet (e.g. a new account in Xverse), switch it to testnet, and note its `ST...` address.
2. **Fund it** with testnet STX from the [Hiro faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet).
3. **Encrypt the deployer's mnemonic** rather than storing it in plaintext:
   ```bash
   clarinet deployments encrypt
   ```
   This prompts for the seed phrase and a password, then prints a line like:
   ```
   encrypted_mnemonic_medium = "..."
   ```
   Paste that **entire line** (key included) into `settings/Testnet.toml`, replacing the placeholder `mnemonic = "..."` line entirely.

   ⚠️ **Gotcha we actually hit**: the scaffolded `Testnet.toml` comment tells you to "paste the encrypted mnemonic here" directly above the `mnemonic` field, which is misleading — the encrypted value needs the *different* key `encrypted_mnemonic_medium` (or `_basic`/`_high`/`_extreme`, matching whatever `--strength` you used; default is medium). Pasting it into `mnemonic = "..."` fails with `mnemonic has an invalid word count: 1`, because Clarinet tries to parse the encrypted blob as a raw 12/24-word phrase.

4. **Generate the deployment plan**:
   ```bash
   clarinet deployments generate --testnet --medium-cost
   ```
   A cost-strategy flag (`--low-cost` / `--medium-cost` / `--high-cost` / `--manual-cost`) is required. It'll prompt for the password you set in step 3, decrypt the mnemonic in memory, and write `deployments/default.testnet-plan.yaml`. Worth reviewing before applying.
5. **Apply it**:
   ```bash
   clarinet deployments apply --testnet
   ```
   Prompts for the password again, then broadcasts and confirms on testnet.
6. **The deployed contract address** is always `<deployer-address>.<contract-name>` — the `expected-sender` shown in the deployment plan, plus whatever the contract is currently named in `Clarinet.toml` (see "Contract naming / versioning" above). You can verify it on the [testnet explorer](https://explorer.hiro.so/?chain=testnet).
7. Set that address as `NEXT_PUBLIC_SAVINGS_CIRCLE_CONTRACT` in the Next.js app's environment (`.env.local` for local dev; your hosting provider's env vars for deployed environments) — see `../lib/contract.ts`.

### Current testnet deployment

```
ST27ANBXNBHX584DKXA9SY7FWYPAB54QHDWZE5841.savings-circle-v2   # current
ST27ANBXNBHX584DKXA9SY7FWYPAB54QHDWZE5841.savings-circle      # superseded, missing cycle-length-blocks -- do not use
```

Redeploying (e.g. after another contract change) always produces a **new** address if the deployer account is unchanged — Stacks contracts are immutable once deployed, there's no in-place upgrade. Follow "Contract naming / versioning" above (bump to `-v3`, etc.) rather than trying to redeploy over an existing name.

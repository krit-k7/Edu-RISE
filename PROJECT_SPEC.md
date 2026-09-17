# Project Spec: EduRISE | Privacy-Preserving Scholarship Verification on Midnight

## 1. Overview
A decentralized application (dApp) that lets students prove they meet a
scholarship's **GPA and household-income** thresholds without revealing
their exact GPA or income. It uses Midnight's zero-knowledge proofs so the
on-chain ledger only ever sees the pass/fail result of the check, not the
underlying private values.

> **Status note:** an earlier draft of this document described a larger
> system — issuer-signed credentials, a `category` field, and an `age`
> check — that was never implemented. This revision describes what the
> deployed contract (`contracts/scholarship.compact`) and frontend
> actually do today. The larger system is tracked as a roadmap item in
> §6, not claimed as shipped.

---

## 2. Core Architecture (as implemented)

### Components
```
[ Student (Browser Wallet) ] ──(private witness: gpa, income, applicant_secret)──▶
                                                                                    │
                                                                     (Local ZK proof generation)
                                                                                    │
                                                                                    ▼
[ Scholarship Board / Anyone ] ◀──(reads pass/fail + verified_count)── [ Compact Contract on Midnight Preprod ]
```

1. **Student Wallet (Frontend/Client)**:
   - Connects a Midnight-compatible wallet (1AM or Lace) via the official
     `@midnight-ntwrk/dapp-connector-api`.
   - The student enters their GPA and annual family income directly into
     the verify form; there is no separate credential-issuance step.
   - The browser locally generates and persists a random 32-byte
     "applicant secret" (`frontend/src/lib/applicantSecret.ts`), used only
     to derive this browser's nullifier — see §5.
2. **Compact Contract (`contracts/scholarship.compact`)**:
   - Publishes the scholarship's `min_gpa` and `max_income` thresholds as
     public (`sealed`) ledger state, fixed at deployment.
   - Exposes `verify_eligibility(gpa, income, applicant_secret)`, a
     circuit that takes GPA, income, and the applicant secret as private
     witnesses, asserts both thresholds are met, checks a nullifier
     derived from the applicant secret hasn't been used before, and
     increments a public `verified_count`.
3. **Admin / Deployment**:
   - Deployment is a CLI-only operation (`scripts/deploy.ts`), run with a
     funded Preprod wallet held in CI/deployment secrets — never in the
     browser. It writes `deployment.preprod.json`, the artifact the
     frontend build reads the contract address from.
   - The in-app Admin page is read-only: it shows the currently verified
     deployment and lets an allowlisted wallet sign a review challenge. It
     cannot itself deploy or redeploy a contract.

---

## 3. Privacy Model (as implemented)

| Data Point | What is Public (Ledger) | What is Private (Witness) |
| :--- | :--- | :--- |
| **Student Identity** | None | Wallet address only ever touches the transaction envelope, not the circuit inputs |
| **GPA** | Only that `GPA >= min_gpa` | Exact GPA (e.g., `9.13`) |
| **Family Income** | Only that `Income <= max_income` | Exact income (e.g., `₹1,80,000`) |
| **Applicant Secret** | Only its `persistentCommit` nullifier, once | The 32-byte secret itself, never disclosed |
| **Verification State** | Proof validity (pass/fail), aggregate `verified_count` | — |

---

## 4. Implementation Roadmap (completed phases)

- **Phase 1 (Level 1)**: WSL2/Docker + `compact` compiler setup; wrote the
  `.compact` contract; compiled circuits; wrote the local test suite;
  deployed to Preprod.
- **Phase 2 (Level 2)**: Wired the compiled contract to a React/Vite
  frontend; wallet connectivity via the official DApp Connector API.
- **Phase 3 (Level 3)**: Integration tests, CI/CD for both the contract
  and the frontend (`.github/workflows/ci.yaml`).
- **Phase 4 (Level 4)**: Production deploy of the frontend, a nullifier so
  a single browser/applicant secret can't verify twice, a verified
  deployment artifact, and hardened wallet/admin handling.

---

## 5. Repeat-Verification Policy

Repeated verification by the same applicant is **not allowed**. The
circuit derives a nullifier — `persistentCommit(applicant_secret, domain)`
— from the locally-persisted applicant secret and rejects a call whose
nullifier is already in `used_nullifiers`.

**Known limitation:** without an issuer-signed identity credential (§6),
this only stops the same browser/device from double-submitting. A student
who clears their browser storage, or uses a second device, gets a fresh
applicant secret and can verify again. Closing that gap requires binding
the nullifier to an externally-attested identity, not just a
locally-generated one — that's exactly what §6 describes.

---

## 6. Roadmap — Not Yet Implemented

These were part of the original vision and remain future work; nothing
below is claimed as shipped in the current contract or frontend:

- **Issuer-signed credentials.** A university/tax-authority "Issuer
  Portal" signs a structured credential (GPA, income, category) with a
  known public key; `verify_eligibility` would verify that signature
  inside the circuit (over the private witnesses) before checking the
  thresholds, rather than trusting self-reported GPA/income as it does
  today. This is what would let the nullifier in §5 be tied to a
  real-world identity instead of a browser-generated secret, closing that
  limitation.
- **Category-based eligibility.** An allowed-category check (e.g., a
  Merkle/commitment membership proof against a published list of
  eligible categories), alongside GPA and income.
- **Age gate.** A minimum/maximum age range check, structured the same
  way as the GPA and income range checks.
- **Scholarship Board disbursement flow.** Automated payout to
  verifiably-eligible addresses.

# EduRISE

**Privacy-Preserving Scholarship Verification on the Midnight Network**

[![Midnight Network](https://img.shields.io/badge/Network-Midnight-blueviolet?style=for-the-badge)](https://midnight.network)
[![Language](https://img.shields.io/badge/Language-Compact-orange?style=for-the-badge)](https://midnight.network)
[![Tested With](https://img.shields.io/badge/Tested%20With-Vitest-yellow?style=for-the-badge)](https://vitest.dev)
[![State](https://img.shields.io/badge/Level-4%20Complete-success?style=for-the-badge)](#)
[![CI](https://github.com/YOURNAME/EduRISE/actions/workflows/ci.yaml/badge.svg)](https://github.com/YOURNAME/EduRISE/actions/workflows/ci.yaml)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/YOURNAME/EduRISE&root=frontend)

---

## Abstract

EduRISE is a decentralized application (dApp) engineered on the **Midnight Network** utilizing the **Compact** smart contract language. The platform serves as a Zero-Knowledge (ZK) eligibility gate for academic scholarships. It allows students to cryptographically prove that they meet stringent academic and financial requirements (such as minimum GPA and maximum family income) without ever exposing their raw, sensitive data to centralized portals, scholarship boards, or the public blockchain ledger.

---

## Table of Contents

1. [Official Submission Links](#official-submission-links)
2. [Architectural Overview](#architectural-overview)
3. [Zero-Knowledge Privacy Model](#zero-knowledge-privacy-model)
4. [Smart Contract Implementation](#smart-contract-implementation)
5. [Hackathon Progression (Levels 1-4)](#hackathon-progression-levels-1-4)
6. [Project Showcase & Verification Proofs](#project-showcase--verification-proofs)
7. [Local Development & Setup Guide](#local-development--setup-guide)

---

## Official Submission Links

- **Live Application (Vercel):** [https://scholar-shield-ten.vercel.app/](https://scholar-shield-ten.vercel.app/)
- **Deployed Contract (Midnight Preprod):** [d13aabcf0599f9453f42637207303fb22ea0ed1f1bc8d34b56fe0f338da3287e](https://preprod.midnightexplorer.com/contracts/d13aabcf0599f9453f42637207303fb22ea0ed1f1bc8d34b56fe0f338da3287e)
- **Demo Video Presentation:** [Watch on Google Drive](https://drive.google.com/file/d/1YUe91VBOKsM_-cpF4jBO_dhbyJyNmcWX/view?usp=sharing)
- **Public Brand Presence:** YOURNAME

---

## Architectural Overview

EduRISE bridges modern web infrastructure with cutting-edge cryptographic privacy networks.

- **Smart Contract Layer:** Written in Compact (`scholarship.compact`), compiled to WebAssembly (WASM) and Zero-Knowledge Intermediate Representation (ZKIR). Deployed on the Midnight Preprod network.
- **Frontend Application Layer:** Built with React, TypeScript, and Vite. Styled using a custom cyber-grid aesthetic via Tailwind CSS.
- **Wallet Infrastructure:** Integrated with the `@midnight-ntwrk/dapp-connector-api` to interface directly with the 1AM and Lace browser extension wallets for local proof generation and transaction signing.
- **Testing & CI/CD:** End-to-end testing utilizing Vitest and local Docker-based Midnight environments. Automated CI/CD pipelines via GitHub Actions.

---

## Zero-Knowledge Privacy Model

The core value proposition of EduRISE is absolute data privacy for applicants.

### The Traditional Vulnerability
In legacy systems, students must upload unencrypted, highly sensitive documents (tax returns, university transcripts, national IDs) to centralized databases. These databases are prime targets for data breaches, resulting in severe identity theft.

### The EduRISE ZK Solution
EduRISE eliminates the need for data transmission. Verification is entirely mathematical.

1. **Public State (Ledger Data):** The scholarship board publishes the eligibility thresholds (`min_gpa` and `max_income`) to the public Midnight ledger. These values are fully transparent and verifiable by any observer.
2. **Private Witness (User Data):** The student inputs their actual GPA and family income locally into their browser. These values are designated as "private witnesses" in the Compact circuit.
3. **Local Proof Generation:** The student's browser wallet runs a localized Zero-Knowledge circuit. It checks if the private witness data satisfies the public state thresholds.
4. **On-Chain Verification:** The wallet submits a cryptographic proof to the Midnight blockchain. The network validators verify the math without ever seeing the underlying private inputs.

**Observer Matrix:**
- **Visible on-chain:** The scholarship thresholds, the user's public address, the fact that a valid proof was submitted.
- **Hidden permanently:** The student's actual GPA, their family's actual income, and the margin by which they exceeded or missed the threshold.

---

## Smart Contract Implementation

The Compact contract (`contracts/scholarship.compact`) is designed for maximum security and data minimization.

```compact
pragma language_version >=0.22.0;

export ledger min_gpa: Uint<32>;
export ledger max_income: Uint<32>;

// The constructor utilizes disclose() to explicitly make the thresholds public.
constructor(initial_min_gpa: Uint<32>, initial_max_income: Uint<32>) {
    min_gpa = disclose(initial_min_gpa);
    max_income = disclose(initial_max_income);
}

// The verification circuit accepts private witnesses (gpa, income).
// Because disclose() is NOT used here, the inputs remain mathematically shielded.
export circuit verify_eligibility(gpa: Uint<32>, income: Uint<32>): [] {
    assert(gpa >= min_gpa, "GPA does not meet minimum requirement");
    assert(income <= max_income, "Income exceeds maximum threshold");
}
```

---

## Hackathon Progression (Levels 1-4)

This repository fulfills the strict progression requirements of the "New Moon to Full" Midnight Builder Journey.

### Level 1: Setup & First Contract
- **Objective:** Establish the WSL2/Docker toolchain, write the foundational Compact contract, and document the product proposal (Age / Eligibility Gate).
- **Status:** Complete. The contract successfully compiles, generating the required `zkir` and `bzkir` proving artifacts.

### Level 2: Frontend Integration
- **Objective:** Develop a robust frontend interface and establish wallet connectivity.
- **Status:** Complete. The application successfully interfaces with the 1AM wallet via the Midnight DApp Connector API.
- **Deployed Contract Address (Preprod):**
  [d13aabcf0599f9453f42637207303fb22ea0ed1f1bc8d34b56fe0f338da3287e](https://preprod.midnightexplorer.com/contracts/d13aabcf0599f9453f42637207303fb22ea0ed1f1bc8d34b56fe0f338da3287e)

### Level 3: Production-Grade dApp
- **Objective:** Implement automated testing, Continuous Integration (CI/CD), and a polished user interface.
- **Status:** Complete. Vitest suites assert both successful verification and expected failure modes. GitHub Actions workflows automatically test the contract on every push.

### Level 4: MVP Goes Live
- **Objective:** Deploy the frontend to a production CDN, finalize documentation, and establish a public brand presence.
- **Status:** Complete.
  - **Live Application:** [https://scholar-shield-ten.vercel.app/](https://scholar-shield-ten.vercel.app/)
  - **Deployed Contract (Preprod):** [d13aabcf0599f9453f42637207303fb22ea0ed1f1bc8d34b56fe0f338da3287e](https://preprod.midnightexplorer.com/contracts/d13aabcf0599f9453f42637207303fb22ea0ed1f1bc8d34b56fe0f338da3287e)
  - **Demo Video Presentation:** [Watch on Google Drive](https://drive.google.com/file/d/1YUe91VBOKsM_-cpF4jBO_dhbyJyNmcWX/view?usp=sharing)
  - **Public Brand Presence:** YOURNAME

---

## Project Showcase & Verification Proofs

### User Interface
![UI Screenshot 1](./sub%20assets/ui1.png)
![UI Screenshot 2](./sub%20assets/ui2.png)
![UI Screenshot 3](./sub%20assets/ui3.png)

### CI/CD Pipeline
![CI/CD Pipeline](./sub%20assets/cicd%20ss.png)

### Contract Compilation Artifacts
![Successful Compilation](./sub%20assets/yarn%20compile%20ss.png)

### Automated Test Suite Execution
![Passing Tests](./sub%20assets/test%20output.png)

---

## Local Development & Setup Guide

For developers and auditors wishing to verify the Zero-Knowledge circuits and run the application locally, please follow these instructions carefully.

### 1. System Requirements
- **OS:** Windows Subsystem for Linux 2 (WSL2 - Ubuntu 24.04/26.04) or native Linux/macOS.
- **Containerization:** Docker Desktop with WSL2 integration enabled.
- **Runtime:** Node.js (v22.0.0 or higher) and Yarn package manager.

### 2. Dependency Initialization
Clone the repository and install the workspace dependencies from the root directory:
```bash
git clone https://github.com/YOURNAME/EduRISE.git
cd EduRISE
yarn install
```

### 3. Smart Contract Compilation
Compile the Compact zero-knowledge circuits into intermediate representation and generate the strictly-typed TypeScript interfaces:
```bash
export PATH="$HOME/.local/bin:$PATH"
yarn compile
```
*Note: This command populates the `contracts/managed/scholarship/` directory with the necessary prover keys and API definitions.*

### 4. Running the Local Midnight Network and Test Suite
To run the automated tests, you must initialize the local Midnight Docker network (which spins up a local indexer, proof-server, and blockchain node):
```bash
yarn env:up
yarn test:local
```
Once testing is complete, gracefully terminate the Docker instances to free up system resources:
```bash
yarn env:down
```

### 5. Running the Frontend Application
To run the React frontend locally and interact with the smart contract:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`. You must have the **1AM wallet** browser extension installed and configured to the appropriate network (Local or Preprod) to interact with the application.

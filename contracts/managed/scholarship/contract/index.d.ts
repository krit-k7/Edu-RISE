// Imports the Midnight Compact Runtime types.
import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

// Defines the witness functions required by the contract.
// This contract does not use any witnesses.
export type Witnesses<PS> = {
}

// Defines circuits that can modify the contract state.
export type ImpureCircuits<PS> = {
  // Verifies whether a user satisfies the eligibility requirements
  // based on GPA and income.
  verify_eligibility(context: __compactRuntime.CircuitContext<PS>,
                     gpa_0: bigint,
                     income_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

// Defines circuits that can be proven/executed.
export type ProvableCircuits<PS> = {
  // Verifies eligibility using the provided GPA and income.
  verify_eligibility(context: __compactRuntime.CircuitContext<PS>,
                     gpa_0: bigint,
                     income_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

// Defines pure circuits.
// No pure circuits are used in this contract.
export type PureCircuits = {
}

// Combines all circuits available in the contract.
export type Circuits<PS> = {
  // Checks the user's eligibility using GPA and income.
  verify_eligibility(context: __compactRuntime.CircuitContext<PS>,
                     gpa_0: bigint,
                     income_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

// Defines the data stored in the contract ledger.
export type Ledger = {
  // Minimum GPA required for eligibility.
  readonly min_gpa: bigint;

  // Maximum income allowed for eligibility.
  readonly max_income: bigint;
}

// Represents locations/references of the compiled contract.
export type ContractReferenceLocations = any;

// Stores the contract reference locations.
export declare const contractReferenceLocations : ContractReferenceLocations;

// Main contract class.
export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  // Contract witness functions.
  witnesses: W;

  // All circuits provided by the contract.
  circuits: Circuits<PS>;

  // Circuits that can modify state.
  impureCircuits: ImpureCircuits<PS>;

  // Circuits that can be proven.
  provableCircuits: ProvableCircuits<PS>;

  // Creates a new contract instance with the provided witnesses.
  constructor(witnesses: W);

  // Initializes the contract ledger with the minimum GPA
  // and maximum income values.
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               initial_min_gpa_0: bigint,
               initial_max_income_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

// Reads and returns the current contract ledger state.
export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;

// Provides access to pure circuits.
// This contract currently has no pure circuits.
export declare const pureCircuits: PureCircuits;

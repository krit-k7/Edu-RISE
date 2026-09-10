// Import the Midnight Compact Runtime.
import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

// Verify that the installed runtime version matches the contract runtime version.
__compactRuntime.checkRuntimeVersion('0.16.0');

// Descriptor for a Compact string.
const _descriptor_0 = __compactRuntime.CompactTypeOpaqueString;

// Descriptor for an unsigned 64-bit integer.
const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

// Descriptor for a boolean value.
const _descriptor_2 = __compactRuntime.CompactTypeBoolean;

// Descriptor for a fixed 32-byte value.
const _descriptor_3 = new __compactRuntime.CompactTypeBytes(32);

// Represents an Either type containing either a left or right value.
class _Either_0 {
  // Returns the memory alignment required for the Either type.
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment()));
  }

  // Converts a stored value into the Either structure.
  fromValue(value_0) {
    return {
      is_left: _descriptor_2.fromValue(value_0),
      left: _descriptor_3.fromValue(value_0),
      right: _descriptor_3.fromValue(value_0)
    }
  }

  // Converts the Either structure into a runtime value.
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.is_left).concat(_descriptor_3.toValue(value_0.left).concat(_descriptor_3.toValue(value_0.right)));
  }
}

// Create an instance of the Either type descriptor.
const _descriptor_4 = new _Either_0();

// Descriptor for a large unsigned integer.
const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

// Represents a Compact contract address.
class _ContractAddress_0 {
  // Returns the alignment required for a contract address.
  alignment() {
    return _descriptor_3.alignment();
  }

  // Converts a stored value into a contract address object.
  fromValue(value_0) {
    return {
      bytes: _descriptor_3.fromValue(value_0)
    }
  }

  // Converts a contract address object into a runtime value.
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.bytes);
  }
}

// Create an instance of the contract address descriptor.
const _descriptor_6 = new _ContractAddress_0();

// Descriptor for an unsigned 8-bit integer.
const _descriptor_7 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

// Main contract class.
export class Contract {
  // Stores the witness functions used by the contract.
  witnesses;

  // Initialize the contract and its circuits.
  constructor(...args_0) {
    // Ensure exactly one constructor argument is provided.
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }

    const witnesses_0 = args_0[0];

    // Ensure the witnesses argument is an object.
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }

    this.witnesses = witnesses_0;

    // Define the storeMessage circuit.
    this.circuits = {
      storeMessage: (...args_1) => {
        // Ensure the circuit receives exactly two arguments.
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`storeMessage: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }

        const contextOrig_0 = args_1[0];
        const newMessage_0 = args_1[1];

        // Validate the circuit context.
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('storeMessage',
                                     'argument 1 (as invoked from Typescript)',
                                     'hello-world.compact line 5 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }

        // Create a new circuit context with an empty gas cost.
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };

        // Prepare the proof data for the circuit execution.
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(newMessage_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };

        // Execute the actual storeMessage logic.
        const result_0 = this._storeMessage_0(context,
                                              partialProofData,
                                              newMessage_0);

        // Set the circuit output to an empty array.
        partialProofData.output = { value: [], alignment: [] };

        // Return the circuit result, updated context, proof data, and gas cost.
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };

    // Expose storeMessage as an impure circuit.
    this.impureCircuits = { storeMessage: this.circuits.storeMessage };

    // Expose storeMessage as a provable circuit.
    this.provableCircuits = { storeMessage: this.circuits.storeMessage };
  }

  // Initialize the contract state.
  initialState(...args_0) {
    // Ensure exactly one constructor context is provided.
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }

    const constructorContext_0 = args_0[0];

    // Validate the constructor context.
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }

    // Check that the initial Zswap state exists.
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }

    // Validate the initial Zswap state.
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }

    // Create the initial contract state.
    const state_0 = new __compactRuntime.ContractState();

    // Create an empty ledger array.
    let stateValue_0 = __compactRuntime.StateValue.newArray();

    // Add an empty/null initial state value.
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());

    // Store the initial state in the contract.
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);

    // Register the storeMessage operation.
    state_0.setOperation('storeMessage', new __compactRuntime.ContractOperation());

    // Create the circuit context used during initialization.
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);

    // Initialize proof data for the contract constructor.
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };

    // Initialize the ledger with an empty message.
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(0n),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(''),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);

    // Update the contract state with the initialized ledger.
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);

    // Return the initialized contract, private state, and Zswap state.
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }

  // Internal implementation of the storeMessage circuit.
  _storeMessage_0(context, partialProofData, newMessage_0) {
    // Store the new message in the ledger.
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(0n),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(newMessage_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);

    // The circuit does not return any values.
    return [];
  }
}

// Read the current ledger state.
export function ledger(stateOrChargedState) {
  // Convert the input into a StateValue.
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;

  // Create a ChargedState if required.
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;

  // Create a context for querying the ledger.
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };

  // Prepare proof data for the ledger query.
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };

  // Return the ledger with access to the stored message.
  return {
    get message() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_7.toValue(0n),
                                                                                                   alignment: _descriptor_7.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  };
}

// Empty context used internally by the generated contract code.
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};

// Create a dummy contract instance.
const _dummyContract = new Contract({ });

// This contract does not contain any pure circuits.
export const pureCircuits = {};

// Reference location for the contract's public ledger.
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };

// Source map reference generated by the compiler.
//# sourceMappingURL=index.js.map

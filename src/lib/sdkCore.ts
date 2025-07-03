// SDK Core re-exports - simplified version with mock implementations for now

// Mock implementations for development
export class AbiRegistry {
  static create() {
    return new AbiRegistry();
  }
}

export class Address {
  bech32: string;
  
  constructor(bech32: string) {
    this.bech32 = bech32;
  }
  
  static fromBech32(bech32: string) {
    return new Address(bech32);
  }
  
  toBech32() {
    return this.bech32;
  }
}

export class AddressValue {
  address: Address;
  
  constructor(address: Address) {
    this.address = address;
  }
}

export class ContractFunction {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}

export class Message {
  data: string;
  
  constructor(data: string) {
    this.data = data;
  }
}

export class ProxyNetworkProvider {
  url: string;
  
  constructor(url: string) {
    this.url = url;
  }
  
  async getAccount() {
    return {
      address: '',
      balance: '0',
      nonce: 0
    };
  }
}

export class SmartContract {
  address: Address;
  abi?: AbiRegistry;
  
  constructor(address: Address, abi?: AbiRegistry) {
    this.address = address;
    this.abi = abi;
  }
}

export class SmartContractController {
  provider: ProxyNetworkProvider;
  
  constructor(provider: ProxyNetworkProvider) {
    this.provider = provider;
  }
}

export class TokenTransfer {
  static egldFromAmount(amount: string) {
    console.log('Creating EGLD transfer for amount:', amount);
    return new TokenTransfer();
  }
}

export class Transaction {
  constructor(config?: Record<string, unknown>) {
    if (config) {
      Object.assign(this, config);
    }
  }
}

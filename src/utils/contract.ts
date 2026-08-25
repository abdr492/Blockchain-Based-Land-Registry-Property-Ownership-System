import { BrowserProvider, JsonRpcProvider, Contract, type ContractRunner } from 'ethers';
import deployedAddress from '../contracts/deployedAddress.json';
import LandRegistryABI from '../contracts/LandRegistryABI.json';

export const CONTRACT_ADDRESS = deployedAddress.LandRegistry;
export const LOCAL_RPC_URL = 'http://127.0.0.1:8545';
export const LOCAL_CHAIN_ID = 31337;

/**
 * Returns a read-only or signer-connected LandRegistry contract instance.
 */
export function getLandRegistryContract(runner?: ContractRunner | null): Contract {
  const provider = runner || new JsonRpcProvider(LOCAL_RPC_URL);
  return new Contract(CONTRACT_ADDRESS, LandRegistryABI, provider);
}

/**
 * Checks whether MetaMask is present in the browser environment.
 */
export function isMetaMaskAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean((window as unknown as { ethereum?: unknown }).ethereum);
}

/**
 * Requests connection to MetaMask wallet and returns the active account address and BrowserProvider.
 */
export async function connectMetaMaskWallet(): Promise<{
  address: string;
  provider: BrowserProvider;
  chainId: number;
}> {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not installed in this browser. Please install MetaMask or use simulated persona mode.');
  }

  const ethereum = (window as unknown as { ethereum: unknown }).ethereum;
  const provider = new BrowserProvider(ethereum as never);

  // Request user accounts
  const accounts = (await provider.send('eth_requestAccounts', [])) as string[];
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts selected in MetaMask.');
  }

  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  return {
    address: accounts[0],
    provider,
    chainId,
  };
}

/**
 * Prompts MetaMask to switch to the local Hardhat network (Chain ID: 31337)
 */
export async function switchToLocalHardhatNetwork(): Promise<void> {
  if (!isMetaMaskAvailable()) return;

  const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
  if (!ethereum) return;

  const hexChainId = '0x' + LOCAL_CHAIN_ID.toString(16);

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError: unknown) {
    const err = switchError as { code?: number };
    // Chain not added to MetaMask yet
    if (err.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: hexChainId,
            chainName: 'Hardhat Local Node',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: [LOCAL_RPC_URL],
          },
        ],
      });
    }
  }
}

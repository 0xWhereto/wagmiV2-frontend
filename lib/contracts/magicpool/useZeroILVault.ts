"use client";

import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  MAGICPOOL_ADDRESSES,
  ZERO_IL_VAULT_ABI,
  ERC20_ABI,
} from "./index";

const HUB_CHAIN_ID = 146; // Sonic

// sWETH and sWBTC addresses
const ASSET_ADDRESSES = {
  sWETH: "0x5E501C482952c1F2D58a4294F9A97759968c5125" as `0x${string}`,
  sWBTC: "0x2F0324268031E6413280F3B5ddBc4A97639A284a" as `0x${string}`,
} as const;

// Asset decimals
const ASSET_DECIMALS = {
  sWETH: 18,
  sWBTC: 8,
};

type VaultType = "sWETH" | "sWBTC";

export function useZeroILVault(vaultType: VaultType) {
  const { address } = useAccount();
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const vaultAddress = vaultType === "sWETH" 
    ? MAGICPOOL_ADDRESSES.wethZeroILVault 
    : MAGICPOOL_ADDRESSES.wbtcZeroILVault;
  
  const assetAddress = ASSET_ADDRESSES[vaultType];
  const decimals = ASSET_DECIMALS[vaultType];

  // Get vault stats
  const { data: vaultStats, refetch: refetchVaultStats } = useReadContract({
    address: vaultAddress,
    abi: ZERO_IL_VAULT_ABI,
    functionName: "getVaultStats",
    chainId: HUB_CHAIN_ID,
  });

  // Get estimated APR
  const { data: estimatedAPR } = useReadContract({
    address: vaultAddress,
    abi: ZERO_IL_VAULT_ABI,
    functionName: "estimatedAPR",
    chainId: HUB_CHAIN_ID,
  });

  // Get user vault token balance (wToken)
  const { data: wTokenBalance, refetch: refetchWToken } = useReadContract({
    address: vaultAddress,
    abi: ZERO_IL_VAULT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: HUB_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Get user asset balance
  const { data: assetBalance, refetch: refetchAsset } = useReadContract({
    address: assetAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: HUB_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Get asset allowance for vault
  const { data: assetAllowance, refetch: refetchAllowance } = useReadContract({
    address: assetAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, vaultAddress] : undefined,
    chainId: HUB_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Approve asset for vault
  const approveAsset = async (amount: bigint) => {
    return writeContractAsync({
      address: assetAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [vaultAddress, amount],
      chainId: HUB_CHAIN_ID,
    });
  };

  // Deposit asset to vault
  const deposit = async (amount: bigint) => {
    if (!address) throw new Error("No address");
    return writeContractAsync({
      address: vaultAddress,
      abi: ZERO_IL_VAULT_ABI,
      functionName: "deposit",
      args: [amount, address],
      chainId: HUB_CHAIN_ID,
    });
  };

  // Withdraw asset from vault
  const withdraw = async (amount: bigint) => {
    if (!address) throw new Error("No address");
    return writeContractAsync({
      address: vaultAddress,
      abi: ZERO_IL_VAULT_ABI,
      functionName: "withdraw",
      args: [amount, address, address],
      chainId: HUB_CHAIN_ID,
    });
  };

  const refetch = () => {
    refetchVaultStats();
    refetchWToken();
    refetchAsset();
    refetchAllowance();
  };

  // Parse vault stats
  const totalDeposited = vaultStats ? formatUnits(vaultStats[0], decimals) : "0";
  const totalBorrowed = vaultStats ? formatUnits(vaultStats[1], 6) : "0"; // MIM has 6 decimals
  const currentDTV = vaultStats ? Number(vaultStats[2]) / 100 : 0; // BP to percentage
  const assetPrice = vaultStats ? Number(vaultStats[3]) / 1e6 : 0; // 6 decimals to float
  const totalValueUSD = vaultStats ? formatUnits(vaultStats[4], 6) : "0";
  const pendingYield = vaultStats ? formatUnits(vaultStats[5], decimals) : "0";

  // Calculate APR from basis points
  const apr = estimatedAPR ? Number(estimatedAPR) / 100 : 15; // Default 15% if not set

  return {
    // Vault info
    vaultAddress,
    assetAddress,
    vaultType,
    decimals,
    
    // Vault stats
    totalDeposited,
    totalBorrowed,
    currentDTV, // percentage
    assetPrice, // USD
    totalValueUSD,
    pendingYield,
    apr, // percentage
    
    // User balances
    wTokenBalance: wTokenBalance ? formatUnits(wTokenBalance, decimals) : "0",
    wTokenBalanceRaw: wTokenBalance || BigInt(0),
    assetBalance: assetBalance ? formatUnits(assetBalance, decimals) : "0",
    assetBalanceRaw: assetBalance || BigInt(0),
    
    // Allowance
    assetAllowance: assetAllowance || BigInt(0),
    needsApproval: (amount: bigint) => (assetAllowance || BigInt(0)) < amount,
    
    // Actions
    approveAsset,
    deposit,
    withdraw,
    
    // State
    isPending: isWritePending,
    refetch,
  };
}

// Hook to get both vaults
export function useAllZeroILVaults() {
  const wethVault = useZeroILVault("sWETH");
  const wbtcVault = useZeroILVault("sWBTC");

  return {
    wethVault,
    wbtcVault,
    refetchAll: () => {
      wethVault.refetch();
      wbtcVault.refetch();
    },
  };
}


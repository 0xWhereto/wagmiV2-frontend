"use client";

import { useReadContract, useWriteContract, useAccount, useReadContracts } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  MAGICPOOL_ADDRESSES,
  MIM_TOKEN_ABI,
  MIM_MINTER_ABI,
  STAKING_VAULT_ABI,
  ERC20_ABI,
} from "./index";

const HUB_CHAIN_ID = 146; // Sonic

// ============ Hook for MIM Minter (Mint/Redeem) ============

export function useMIMMinter() {
  const { address } = useAccount();
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  // Get pool stats
  const { data: poolStats, refetch: refetchPoolStats } = useReadContract({
    address: MAGICPOOL_ADDRESSES.mimMinter,
    abi: MIM_MINTER_ABI,
    functionName: "getPoolStats",
    chainId: HUB_CHAIN_ID,
  });

  // Get user sUSDC balance
  const { data: sUSDCBalance, refetch: refetchSUSDC } = useReadContract({
    address: MAGICPOOL_ADDRESSES.sUSDC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: HUB_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Get user MIM balance
  const { data: mimBalance, refetch: refetchMIM } = useReadContract({
    address: MAGICPOOL_ADDRESSES.mimToken,
    abi: MIM_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: HUB_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Get allowance for sUSDC to MIMMinter
  const { data: sUSDCAllowance, refetch: refetchAllowance } = useReadContract({
    address: MAGICPOOL_ADDRESSES.sUSDC,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, MAGICPOOL_ADDRESSES.mimMinter] : undefined,
    chainId: HUB_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Approve sUSDC for MIMMinter
  const approveSUSDC = async (amount: bigint) => {
    return writeContractAsync({
      address: MAGICPOOL_ADDRESSES.sUSDC,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [MAGICPOOL_ADDRESSES.mimMinter, amount],
      chainId: HUB_CHAIN_ID,
    });
  };

  // Mint MIM with sUSDC
  const mintMIM = async (amount: bigint) => {
    return writeContractAsync({
      address: MAGICPOOL_ADDRESSES.mimMinter,
      abi: MIM_MINTER_ABI,
      functionName: "mint",
      args: [amount],
      chainId: HUB_CHAIN_ID,
    });
  };

  // Redeem sUSDC for MIM
  const redeemMIM = async (amount: bigint) => {
    return writeContractAsync({
      address: MAGICPOOL_ADDRESSES.mimMinter,
      abi: MIM_MINTER_ABI,
      functionName: "redeem",
      args: [amount],
      chainId: HUB_CHAIN_ID,
    });
  };

  const refetch = () => {
    refetchPoolStats();
    refetchSUSDC();
    refetchMIM();
    refetchAllowance();
  };

  return {
    // Pool stats
    totalSUSDCDeposited: poolStats ? formatUnits(poolStats[0], 6) : "0",
    totalMIMMinted: poolStats ? formatUnits(poolStats[1], 6) : "0",
    liquidity: poolStats ? poolStats[2].toString() : "0",
    
    // User balances
    sUSDCBalance: sUSDCBalance ? formatUnits(sUSDCBalance, 6) : "0",
    sUSDCBalanceRaw: sUSDCBalance || BigInt(0),
    mimBalance: mimBalance ? formatUnits(mimBalance, 6) : "0",
    mimBalanceRaw: mimBalance || BigInt(0),
    
    // Allowance
    sUSDCAllowance: sUSDCAllowance || BigInt(0),
    needsApproval: (amount: bigint) => (sUSDCAllowance || BigInt(0)) < amount,
    
    // Actions
    approveSUSDC,
    mintMIM,
    redeemMIM,
    
    // State
    isPending: isWritePending,
    refetch,
  };
}

// ============ Hook for Staking Vault (sMIM) ============

export function useStakingVault() {
  const { address } = useAccount();
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  // Get vault stats
  const { data: vaultStats, refetch: refetchVaultStats } = useReadContract({
    address: MAGICPOOL_ADDRESSES.stakingVault,
    abi: STAKING_VAULT_ABI,
    functionName: "getVaultStats",
    chainId: HUB_CHAIN_ID,
  });

  // Get user sMIM balance
  const { data: sMIMBalance, refetch: refetchSMIM } = useReadContract({
    address: MAGICPOOL_ADDRESSES.stakingVault,
    abi: STAKING_VAULT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: HUB_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Get user MIM balance
  const { data: mimBalance, refetch: refetchMIM } = useReadContract({
    address: MAGICPOOL_ADDRESSES.mimToken,
    abi: MIM_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: HUB_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Get MIM allowance for StakingVault
  const { data: mimAllowance, refetch: refetchAllowance } = useReadContract({
    address: MAGICPOOL_ADDRESSES.mimToken,
    abi: MIM_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, MAGICPOOL_ADDRESSES.stakingVault] : undefined,
    chainId: HUB_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Preview deposit
  const { data: previewDepositResult } = useReadContract({
    address: MAGICPOOL_ADDRESSES.stakingVault,
    abi: STAKING_VAULT_ABI,
    functionName: "previewDeposit",
    args: [parseUnits("1", 6)], // Preview for 1 MIM
    chainId: HUB_CHAIN_ID,
  });

  // Approve MIM for StakingVault
  const approveMIM = async (amount: bigint) => {
    return writeContractAsync({
      address: MAGICPOOL_ADDRESSES.mimToken,
      abi: MIM_TOKEN_ABI,
      functionName: "approve",
      args: [MAGICPOOL_ADDRESSES.stakingVault, amount],
      chainId: HUB_CHAIN_ID,
    });
  };

  // Deposit MIM to get sMIM
  const deposit = async (amount: bigint) => {
    if (!address) throw new Error("No address");
    return writeContractAsync({
      address: MAGICPOOL_ADDRESSES.stakingVault,
      abi: STAKING_VAULT_ABI,
      functionName: "deposit",
      args: [amount, address],
      chainId: HUB_CHAIN_ID,
    });
  };

  // Withdraw MIM by burning sMIM
  const withdraw = async (assets: bigint) => {
    if (!address) throw new Error("No address");
    return writeContractAsync({
      address: MAGICPOOL_ADDRESSES.stakingVault,
      abi: STAKING_VAULT_ABI,
      functionName: "withdraw",
      args: [assets, address, address],
      chainId: HUB_CHAIN_ID,
    });
  };

  const refetch = () => {
    refetchVaultStats();
    refetchSMIM();
    refetchMIM();
    refetchAllowance();
  };

  // Calculate interest rate from basis points
  const interestRate = vaultStats ? Number(vaultStats[4]) / 100 : 0; // Convert BP to percentage
  const utilization = vaultStats ? Number(vaultStats[3]) / 100 : 0; // Convert BP to percentage

  return {
    // Vault stats
    totalAssets: vaultStats ? formatUnits(vaultStats[0], 6) : "0",
    totalBorrowed: vaultStats ? formatUnits(vaultStats[1], 6) : "0",
    availableLiquidity: vaultStats ? formatUnits(vaultStats[2], 6) : "0",
    utilization, // percentage
    interestRate, // percentage (APR)
    totalInterestEarned: vaultStats ? formatUnits(vaultStats[5], 6) : "0",
    
    // User balances
    sMIMBalance: sMIMBalance ? formatUnits(sMIMBalance, 6) : "0",
    sMIMBalanceRaw: sMIMBalance || BigInt(0),
    mimBalance: mimBalance ? formatUnits(mimBalance, 6) : "0",
    mimBalanceRaw: mimBalance || BigInt(0),
    
    // Allowance
    mimAllowance: mimAllowance || BigInt(0),
    needsApproval: (amount: bigint) => (mimAllowance || BigInt(0)) < amount,
    
    // Exchange rate (sMIM per MIM)
    exchangeRate: previewDepositResult ? formatUnits(previewDepositResult, 6) : "1",
    
    // Actions
    approveMIM,
    deposit,
    withdraw,
    
    // State
    isPending: isWritePending,
    refetch,
  };
}

// ============ Combined Hook ============

export function useMagicPool() {
  const minter = useMIMMinter();
  const vault = useStakingVault();

  return {
    minter,
    vault,
    refetchAll: () => {
      minter.refetch();
      vault.refetch();
    },
  };
}


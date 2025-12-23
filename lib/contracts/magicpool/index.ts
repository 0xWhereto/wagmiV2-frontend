// 0IL Protocol contract addresses and ABIs (deployed to Sonic)
// Updated to v4 deployment

export const MAGICPOOL_ADDRESSES = {
  // Core 0IL Contracts V3 - Clean deployment with full MIM
  mimToken: "0x9ea06883EE9aA5F93d68fb3E85C4Cf44f4C01073" as `0x${string}`, // Full MIM with mintWithUSDC
  stakingVault: "0x0C55BC6A970055Bde2FFF573338cDC396DE5eF22" as `0x${string}`, // MIMStakingVaultV2
  mimUsdcPool: "0x61B0f8EFc07C255681a09ed98d6b47Aa1a194D87" as `0x${string}`, // MIM/sUSDC pool
  swethMimPool: "0x1b287D79E341C52B2aeC78a3803042D222C8Ab24" as `0x${string}`, // sWETH/MIM pool
  oracleAdapter: "0xA5725c6694DcDC1fba1BB26115c16DA633B41dbA" as `0x${string}`, // SimpleOracle
  v3LPVault: "0x40a8af8516cC5557127e6601cC5c794EDB5F97C8" as `0x${string}`, // V3LPVault
  leverageAMM: "0x1f0447A083fDD5099a310F1e1897F9Fb1043c875" as `0x${string}`, // LeverageAMMV2
  wETH: "0x6dbB555EaD5D236e912fCFe28cec0C737E9E1D04" as `0x${string}`, // Zero-IL wETH
  
  // Underlying synthetic tokens
  sUSDC: "0xa56a2C5678f8e10F61c6fBafCB0887571B9B432B" as `0x${string}`, // Synthetic sUSDC from Hub
  sWETH: "0x5E501C482952c1F2D58a4294F9A97759968c5125" as `0x${string}`,
  sWBTC: "0x20Ca9a180b6ae1f0Ba5B6750F47b1061C49E8aFE" as `0x${string}`,
} as const;

// MIM Token ABI (core functions)
export const MIM_TOKEN_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mintWithUSDC",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemForUSDC",
    inputs: [{ name: "mimAmount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "totalBacking",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "backingRatio",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

// MIMStakingVault (sMIM) ABI
export const STAKING_VAULT_ABI = [
  {
    type: "function",
    name: "deposit",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalAssets",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalBorrows",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCash",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "utilizationRate",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "averageUtilization",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "borrowRate",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "supplyRate",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "convertToShares",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "convertToAssets",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "borrowBalanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPoolWeeklyInterest",
    inputs: [{ name: "pool", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isWeekComplete",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;

// WToken (Zero-IL wETH) ABI
export const WTOKEN_ABI = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "minShares", type: "uint256" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "minAssets", type: "uint256" },
    ],
    outputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pricePerShare",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalValue",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPositionValue",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserPnL",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "pnl", type: "int256" },
      { name: "pnlPercent", type: "int256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "convertToShares",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "convertToAssets",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "entryPrice",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "depositsPaused",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawalsPaused",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;

// LeverageAMM ABI
export const LEVERAGE_AMM_ABI = [
  {
    type: "function",
    name: "getPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalDebt",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalLPValue",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCurrentDTV",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEquity",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "checkRebalance",
    inputs: [],
    outputs: [
      { name: "needsRebalance", type: "bool" },
      { name: "isDeleverage", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "accumulatedFees",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingWTokenFees",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isWeeklyPaymentDue",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getExpectedWeeklyInterest",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rebalance",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "payWeeklyInterest",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

// ERC20 ABI for approvals
export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

// For backwards compatibility, keep these exports
export const MIM_MINTER_ABI = MIM_TOKEN_ABI; // MIM now has mint functions built-in
export const ZERO_IL_VAULT_ABI = WTOKEN_ABI; // WToken is the zero-IL vault

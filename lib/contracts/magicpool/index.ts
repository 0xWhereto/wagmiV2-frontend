// MagicPool contract addresses and ABIs

export const MAGICPOOL_ADDRESSES = {
  mimToken: "0x2321e7dDdC1aF826E1827Ee41C306f8837656846" as `0x${string}`,
  mimMinter: "0x38FB72EB47213cC75797249a9daC5CD357F2021c" as `0x${string}`,
  stakingVault: "0x1880d94b47af6c80BbCa973B383221fD53A6e139" as `0x${string}`,
  wethZeroILVault: "0x27C42A9184D45A3657b7fEE9cd9969216BAd9CE3" as `0x${string}`,
  wbtcZeroILVault: "0x1544Dc2A93c148C04dEA54Bd150EBb5BB3948ac2" as `0x${string}`,
  wethZeroILStrategy: "0x80A13466aE5185d375e5b75b1bA66d47B773858c" as `0x${string}`,
  wbtcZeroILStrategy: "0xf51Ff777724F8B5Dae8e7BD6295D2d6eA7C89bC8" as `0x${string}`,
  sUSDC: "0xa56a2C5678f8e10F61c6fBafCB0887571B9B432B" as `0x${string}`,
} as const;

// MIM Token ABI (simplified)
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
] as const;

// MIM Minter ABI
export const MIM_MINTER_ABI = [
  {
    type: "function",
    name: "mint",
    inputs: [{ name: "_amount", type: "uint256" }],
    outputs: [{ name: "mimAmount", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeem",
    inputs: [{ name: "_amount", type: "uint256" }],
    outputs: [{ name: "sUSDCAmount", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getPoolStats",
    inputs: [],
    outputs: [
      { name: "_totalSUSDCDeposited", type: "uint256" },
      { name: "_totalMIMMinted", type: "uint256" },
      { name: "_liquidity", type: "uint128" },
      { name: "_currentTick", type: "int24" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pool",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSUSDCDeposited",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalMIMMinted",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

// Staking Vault ABI (ERC4626)
export const STAKING_VAULT_ABI = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeem",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
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
    name: "totalBorrowed",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "availableLiquidity",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUtilization",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCurrentInterestRate",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVaultStats",
    inputs: [],
    outputs: [
      { name: "_totalAssets", type: "uint256" },
      { name: "_totalBorrowed", type: "uint256" },
      { name: "_availableLiquidity", type: "uint256" },
      { name: "_utilization", type: "uint256" },
      { name: "_interestRate", type: "uint256" },
      { name: "_totalInterestEarned", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "previewDeposit",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "previewRedeem",
    inputs: [{ name: "shares", type: "uint256" }],
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
    name: "convertToShares",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

// Zero IL Vault ABI
export const ZERO_IL_VAULT_ABI = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
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
    name: "totalDeposited",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalBorrowed",
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
    name: "assetPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVaultStats",
    inputs: [],
    outputs: [
      { name: "_totalDeposited", type: "uint256" },
      { name: "_totalBorrowed", type: "uint256" },
      { name: "_currentDTV", type: "uint256" },
      { name: "_assetPrice", type: "uint256" },
      { name: "_totalValueUSD", type: "uint256" },
      { name: "_pendingYield", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "estimatedAPR",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isHealthy",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "previewDeposit",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "previewRedeem",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
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


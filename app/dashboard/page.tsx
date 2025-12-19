"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useSwitchChain } from "wagmi";
import { Header } from "@/components/Header";
import { useAllTokenBalances } from "@/hooks/useTokenBalances";
import { getTokenLogoBySymbol } from "@/lib/tokens/logos";
import { getTokensForChain } from "@/lib/tokens/tokenList";

// Hub chain ID (Sonic)
const HUB_CHAIN_ID = 146;

// Mock prices
const TOKEN_PRICES: Record<string, number> = {
  S: 0.5, sWETH: 3370, sUSDC: 1, sUSDT: 1, sDAI: 1,
  ETH: 3370, WETH: 3370, USDC: 1, USDT: 1, DAI: 1,
};

// Mock V3 positions data
const MOCK_V3_POSITIONS = [
  {
    id: "1",
    token0: { symbol: "sWETH", icon: "eth" },
    token1: { symbol: "sUSDC", icon: "usdc" },
    feeTier: 0.3,
    liquidity: "2,500",
    liquidityUsd: "$4,250.00",
    token0Amount: "0.5",
    token1Amount: "1,685.00",
    minPrice: "2,800",
    maxPrice: "4,200",
    currentPrice: "3,370",
    inRange: true,
    unclaimedFees: {
      token0: "0.002",
      token1: "6.75",
      usd: "$13.49",
    },
    apr: "24.5%",
  },
  {
    id: "2",
    token0: { symbol: "sUSDC", icon: "usdc" },
    token1: { symbol: "sUSDT", icon: "usdt" },
    feeTier: 0.05,
    liquidity: "10,000",
    liquidityUsd: "$10,000.00",
    token0Amount: "5,000.00",
    token1Amount: "5,000.00",
    minPrice: "0.995",
    maxPrice: "1.005",
    currentPrice: "1.0001",
    inRange: true,
    unclaimedFees: {
      token0: "2.50",
      token1: "2.48",
      usd: "$4.98",
    },
    apr: "8.2%",
  },
];

// Token Icon component
function TokenIcon({ symbol, size = 28 }: { symbol: string; size?: number }) {
  const gradients: Record<string, [string, string]> = {
    eth: ["#627EEA", "#4A5FC1"],
    usdc: ["#2775CA", "#1A5FAD"],
    usdt: ["#26A17B", "#1E8C6B"],
  };
  
  const [c1, c2] = gradients[symbol] || ["#5D93B2", "#4A7A96"];
  const id = `token-${symbol}-${size}-${Math.random()}`;

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill={`url(#${id})`}/>
      <circle cx="16" cy="16" r="15.5" stroke="white" strokeOpacity="0.2"/>
      <defs>
        <radialGradient id={id} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16 16) scale(16)">
          <stop stopColor={c1}/>
          <stop offset="1" stopColor={c2}/>
        </radialGradient>
      </defs>
    </svg>
  );
}

// Close Icon
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M15 5L5 15M5 5L15 15" stroke="#7B8187" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// Remove Liquidity Modal
function RemoveLiquidityModal({ 
  position, 
  onClose 
}: { 
  position: typeof MOCK_V3_POSITIONS[0]; 
  onClose: () => void;
}) {
  const [percentage, setPercentage] = useState(100);
  const [collectFees, setCollectFees] = useState(true);

  // Calculate amounts based on percentage
  const token0Amount = (parseFloat(position.token0Amount.replace(/,/g, '')) * percentage / 100).toFixed(4);
  const token1Amount = (parseFloat(position.token1Amount.replace(/,/g, '')) * percentage / 100).toFixed(2);
  const liquidityValue = parseFloat(position.liquidityUsd.replace(/[$,]/g, ''));
  const removeValue = (liquidityValue * percentage / 100).toFixed(2);

  const PERCENTAGE_OPTIONS = [25, 50, 75, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-[420px] bg-zinc-900 rounded-xl border border-zinc-800"
      >
        {/* Header */}
        <div className="px-5 pt-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-normal text-white">Remove Liquidity</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center -space-x-1">
                <TokenIcon symbol={position.token0.icon} size={20} />
                <TokenIcon symbol={position.token1.icon} size={20} />
              </div>
              <span className="text-xs text-zinc-500">
                {position.token0.symbol}/{position.token1.symbol} · {position.feeTier}%
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="hover:opacity-80 transition-opacity"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 pt-4 space-y-4">
          {/* Amount Slider */}
          <div>
            <div className="text-xs text-zinc-500 mb-2">Amount to Remove</div>
            
            <div className="rounded-xl px-4 py-4 bg-zinc-800/50">
              <div className="text-center mb-4">
                <div className="text-4xl font-semibold text-white mb-1">
                  {percentage}%
                </div>
                <div className="text-sm text-zinc-500">
                  ≈ ${removeValue}
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10B981 0%, #10B981 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />

              {/* Quick percentages */}
              <div className="flex items-center gap-2 mt-4">
                {PERCENTAGE_OPTIONS.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setPercentage(pct)}
                    className={`flex-1 py-2 rounded-xl text-sm font-normal transition-all ${
                      percentage === pct 
                        ? 'bg-emerald-500/15 text-white border border-emerald-500/30' 
                        : 'bg-zinc-800 text-zinc-400 border border-transparent'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* You Will Receive */}
          <div>
            <div className="text-xs text-zinc-500 mb-2">You Will Receive</div>
            
            <div className="rounded-xl px-4 py-3 bg-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TokenIcon symbol={position.token0.icon} size={24} />
                  <span className="text-sm text-white">{position.token0.symbol}</span>
                </div>
                <span className="text-sm font-medium text-white">{token0Amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TokenIcon symbol={position.token1.icon} size={24} />
                  <span className="text-sm text-white">{position.token1.symbol}</span>
                </div>
                <span className="text-sm font-medium text-white">{token1Amount}</span>
              </div>
            </div>
          </div>

          {/* Position Summary */}
          <div className="rounded-xl px-4 py-3 bg-zinc-800/50">
            <div className="text-xs text-zinc-500 mb-2">Current Position</div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-zinc-400">{position.token0.symbol}</span>
              <span className="text-white">{position.token0Amount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">{position.token1.symbol}</span>
              <span className="text-white">{position.token1Amount}</span>
            </div>
          </div>

          {/* Collect Fees Toggle */}
          <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-zinc-800/50">
            <div>
              <div className="text-sm text-white">Collect Fees</div>
              <div className="text-xs text-zinc-500">{position.unclaimedFees.usd} unclaimed</div>
            </div>
            <button
              onClick={() => setCollectFees(!collectFees)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                collectFees ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <div 
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  collectFees ? 'left-[calc(100%-20px)]' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Remove Button */}
          <button 
            className="w-full py-3 rounded-xl text-white font-medium text-base transition-opacity hover:opacity-90 bg-red-500/80"
          >
            Remove Liquidity
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// V3 Position Card
function V3PositionCard({ 
  position,
  onManage,
}: { 
  position: typeof MOCK_V3_POSITIONS[0];
  onManage: () => void;
}) {
  return (
    <div className="p-4 bg-zinc-900/30 rounded-xl hover:bg-zinc-900/50 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left: Token pair */}
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2">
            <TokenIcon symbol={position.token0.icon} size={32} />
            <TokenIcon symbol={position.token1.icon} size={32} />
          </div>
          <div>
            <div className="font-medium text-white">
              {position.token0.symbol} / {position.token1.symbol}
            </div>
            <div className="text-xs text-zinc-500">{position.feeTier}% fee</div>
          </div>
        </div>

        {/* Middle: Stats */}
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-xs text-zinc-500">Liquidity</div>
            <div className="text-sm font-medium text-white">{position.liquidityUsd}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">Unclaimed Fees</div>
            <div className="text-sm font-medium text-emerald-400">{position.unclaimedFees.usd}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">APR</div>
            <div className="text-sm font-medium text-emerald-400">{position.apr}</div>
          </div>
          
          {/* Range Status */}
          <div 
            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
              position.inRange 
                ? 'bg-emerald-500/15 text-emerald-400' 
                : 'bg-red-500/15 text-red-400'
            }`}
          >
            <span 
              className={`w-1.5 h-1.5 rounded-full ${
                position.inRange ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />
            {position.inRange ? "In Range" : "Out of Range"}
          </div>
        </div>

        {/* Right: Manage Button */}
        <button
          onClick={onManage}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
        >
          Manage
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  
  // State for modal
  const [selectedPosition, setSelectedPosition] = useState<typeof MOCK_V3_POSITIONS[0] | null>(null);
  
  // Balances
  const { balances: hubBalances } = useAllTokenBalances(HUB_CHAIN_ID);
  const hubTokens = getTokensForChain(HUB_CHAIN_ID);
  
  // Auto-switch to Hub chain
  useEffect(() => {
    if (isConnected && switchChain && chain?.id !== HUB_CHAIN_ID) {
      switchChain({ chainId: HUB_CHAIN_ID });
    }
  }, [isConnected, switchChain, chain?.id]);

  // Calculate total portfolio value
  const portfolioValue = Object.entries(hubBalances).reduce((total, [symbol, balance]) => {
    const price = TOKEN_PRICES[symbol] || 0;
    return total + (parseFloat(balance.balanceFormatted) * price);
  }, 0);

  // Calculate total LP value
  const lpValue = MOCK_V3_POSITIONS.reduce((total, pos) => {
    return total + parseFloat(pos.liquidityUsd.replace(/[$,]/g, ''));
  }, 0);

  // Calculate total unclaimed fees
  const totalFees = MOCK_V3_POSITIONS.reduce((total, pos) => {
    return total + parseFloat(pos.unclaimedFees.usd.replace(/[$,]/g, ''));
  }, 0);

  // Get assets with balances
  const assetsWithBalance = hubTokens
    .map((token) => ({
      ...token,
      balance: hubBalances[token.symbol]?.balanceFormatted || "0.00",
      balanceRaw: hubBalances[token.symbol]?.balanceRaw || "0",
      value: parseFloat(hubBalances[token.symbol]?.balanceFormatted || "0") * (TOKEN_PRICES[token.symbol] || 0),
    }))
    .filter((token) => parseFloat(token.balance) > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-zinc-100 text-2xl">Portfolio</h1>
              <span className="text-zinc-400 text-xl">
                ${(portfolioValue + lpValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-sm text-zinc-500">
              {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Not connected"}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="p-6 bg-zinc-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-zinc-500">Wallet Balance</span>
              </div>
              <div className="text-zinc-100 text-2xl">
                ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-6 bg-zinc-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-zinc-500">LP Positions</span>
              </div>
              <div className="text-zinc-100 text-2xl">
                ${lpValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-6 bg-zinc-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-zinc-500">Claimable Fees</span>
              </div>
              <div className="text-emerald-400 text-2xl">
                ${totalFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </motion.div>

          {/* V3 Positions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-zinc-300 text-lg">Liquidity Positions</h2>
              <span className="text-sm text-zinc-500">{MOCK_V3_POSITIONS.length} positions</span>
            </div>
            
            {!isConnected ? (
              <div className="text-center py-12 bg-zinc-900/30 rounded-xl">
                <div className="text-zinc-500">Connect wallet to view positions</div>
              </div>
            ) : MOCK_V3_POSITIONS.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/30 rounded-xl">
                <div className="text-zinc-500">No liquidity positions found</div>
              </div>
            ) : (
              <div className="space-y-3">
                {MOCK_V3_POSITIONS.map((position) => (
                  <V3PositionCard
                    key={position.id}
                    position={position}
                    onManage={() => setSelectedPosition(position)}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Assets Section */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <h2 className="text-zinc-300 text-lg mb-6">Wallet Assets</h2>
            
            {!isConnected ? (
              <div className="text-center py-12 bg-zinc-900/30 rounded-xl">
                <div className="text-zinc-500">Connect wallet to view assets</div>
              </div>
            ) : assetsWithBalance.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/30 rounded-xl">
                <div className="text-zinc-500">No assets found on Sonic</div>
              </div>
            ) : (
              <div className="space-y-3">
                {assetsWithBalance.map((token, index) => (
                  <motion.div
                    key={token.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    className="p-4 bg-zinc-900/30 rounded-xl hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-950">
                          <Image 
                            src={getTokenLogoBySymbol(token.symbol)} 
                            alt={token.symbol} 
                            width={40} 
                            height={40} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <div className="font-medium text-zinc-100">{token.symbol}</div>
                          <div className="text-sm text-zinc-500">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-zinc-100">{parseFloat(token.balance).toFixed(4)}</div>
                        <div className="text-sm text-zinc-500">
                          ${token.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </main>

      {/* Remove Liquidity Modal */}
      <AnimatePresence>
        {selectedPosition && (
          <RemoveLiquidityModal
            position={selectedPosition}
            onClose={() => setSelectedPosition(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

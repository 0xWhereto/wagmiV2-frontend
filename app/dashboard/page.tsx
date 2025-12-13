"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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

// Info icon
function InfoIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

export default function DashboardPage() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  
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
                ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                <span className="text-zinc-500">Total Value</span>
              </div>
              <div className="text-zinc-100 text-2xl">
                ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-6 bg-zinc-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-zinc-500">LP Positions</span>
              </div>
              <div className="text-zinc-100 text-2xl">--</div>
            </div>
            <div className="p-6 bg-zinc-900/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-zinc-500">Claimable Fees</span>
              </div>
              <div className="text-zinc-100 text-2xl">$0.00</div>
            </div>
          </motion.div>

          {/* Assets Section */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2 className="text-zinc-300 text-lg mb-6">Assets on Sonic</h2>
            
            {!isConnected ? (
              <div className="text-center py-12">
                <div className="text-zinc-500">Connect wallet to view assets</div>
              </div>
            ) : assetsWithBalance.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-zinc-500">No assets found on Sonic</div>
              </div>
            ) : (
              <div className="space-y-3">
                {assetsWithBalance.map((token, index) => (
                  <motion.div
                    key={token.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                    className="p-6 bg-zinc-900/30 rounded-xl hover:bg-zinc-900/50 transition-colors"
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

          {/* Activity Section (Placeholder) */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h2 className="text-zinc-300 text-lg mb-6">Recent Activity</h2>
            <div className="p-8 bg-zinc-900/30 rounded-xl text-center">
              <p className="text-zinc-500">No recent transactions</p>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}

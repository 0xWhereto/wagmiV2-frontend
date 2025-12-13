"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAccount, useSwitchChain } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { Header } from "@/components/Header";
import { getTokenLogoBySymbol, getChainLogo } from "@/lib/tokens/logos";
import { getTokensForChain, type Token } from "@/lib/tokens/tokenList";
import { 
  useLiquidity, 
  usePoolExists, 
  usePoolInfo,
  FEE_TIERS,
  priceToTick,
  tickToPrice,
  nearestUsableTick,
  getTickSpacing,
  MIN_TICK,
  MAX_TICK,
  type Position as V3Position 
} from "@/lib/contracts/hooks/useLiquidity";
import { useToast } from "@/components/Toast";
import { useAllTokenBalances } from "@/hooks/useTokenBalances";

// Hub chain ID (Sonic)
const HUB_CHAIN_ID = 146;

// Display position interface
export interface DisplayPosition {
  id: string;
  tokenId: bigint;
  token0: string;
  token1: string;
  token0Decimals?: number;
  token1Decimals?: number;
  token0Address: `0x${string}`;
  token1Address: `0x${string}`;
  chain: string;
  chainId: number;
  fee: number;
  liquidity: bigint;
  tickLower: number;
  tickUpper: number;
  minPrice: number;
  maxPrice: number;
  currentPrice: number;
  inRange: boolean;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
}

// Position Card Component
function PositionCard({ 
  position, 
  onManage,
  onCollect 
}: { 
  position: DisplayPosition; 
  onManage: () => void;
  onCollect: () => void;
}) {
  const token0Logo = getTokenLogoBySymbol(position.token0);
  const token1Logo = getTokenLogoBySymbol(position.token1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-zinc-900/30 rounded-xl hover:bg-zinc-900/50 transition-colors mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-950">
              <Image src={token0Logo} alt={position.token0} width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-950">
              <Image src={token1Logo} alt={position.token1} width={40} height={40} className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <div className="font-medium text-zinc-100">{position.token0} / {position.token1}</div>
            <div className="text-xs text-zinc-500">{position.fee / 10000}% fee</div>
          </div>
        </div>
        <span 
          className={`px-3 py-1 rounded-lg text-xs font-medium ${
            position.inRange 
              ? "bg-emerald-400/10 text-emerald-400" 
              : "bg-red-400/10 text-red-400"
          }`}
        >
          {position.inRange ? "In Range" : "Out of Range"}
        </span>
      </div>
      
      {/* Price Range */}
      <div className="flex justify-between text-sm mb-4">
        <div>
          <span className="text-zinc-500">Min: </span>
          <span className="text-zinc-100">{position.minPrice.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-zinc-500">Max: </span>
          <span className="text-zinc-100">{position.maxPrice.toFixed(4)}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-3">
        <button 
          onClick={onManage}
          className="flex-1 py-3 rounded-lg text-sm font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-100 transition-all"
        >
          Remove
        </button>
        <button 
          onClick={onCollect}
          className="flex-1 py-3 rounded-lg text-sm font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition-all"
        >
          Collect Fees
        </button>
      </div>
    </motion.div>
  );
}

// Token Selector
function TokenSelector({
  selected,
  onChange,
  tokens,
  excludeToken,
}: {
  selected: string;
  onChange: (symbol: string) => void;
  tokens: Token[];
  excludeToken?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { balances } = useAllTokenBalances(HUB_CHAIN_ID);

  const availableTokens = tokens
    .filter((t) => t.symbol !== excludeToken)
    .filter((t) => 
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
    )
    .map((token) => ({
      ...token,
      balance: balances[token.symbol]?.balanceFormatted || "0.00",
    }));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/5"
        style={{ background: "transparent" }}
      >
        <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-700">
          <Image src={getTokenLogoBySymbol(selected)} alt={selected} width={20} height={20} className="w-full h-full object-cover" />
        </div>
        <span className="font-medium text-sm text-white">{selected}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); setSearch(""); }} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-64 rounded-lg overflow-hidden z-50"
              style={{ background: "#1a1a1a" }}
            >
              {/* Search Input */}
              <div className="p-3 border-b border-zinc-900">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search token..."
                  autoFocus
                  className="w-full bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
                />
              </div>
              
              {/* Token List */}
              <div 
                className="max-h-56 overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#374151 transparent",
                }}
              >
                {availableTokens.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No tokens found</div>
                ) : (
                  availableTokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        onChange(token.symbol);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-700">
                          <Image src={getTokenLogoBySymbol(token.symbol)} alt={token.symbol} width={20} height={20} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm text-white">{token.symbol}</span>
                      </div>
                      <span className="text-xs text-gray-500">{token.balance}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Add Liquidity Modal
function AddLiquidityModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { address, isConnected } = useAccount();
  const { addToast } = useToast();
  const { balances } = useAllTokenBalances(HUB_CHAIN_ID);
  const hubTokens = getTokensForChain(HUB_CHAIN_ID);
  
  const [token0Symbol, setToken0Symbol] = useState("sWETH");
  const [token1Symbol, setToken1Symbol] = useState("sUSDC");
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [selectedFee, setSelectedFee] = useState(3000);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  
  const token0 = hubTokens.find(t => t.symbol === token0Symbol);
  const token1 = hubTokens.find(t => t.symbol === token1Symbol);
  
  // Sort tokens by address
  const [sortedToken0, sortedToken1] = useMemo(() => {
    if (!token0?.address || !token1?.address) return [token0, token1];
    return token0.address.toLowerCase() < token1.address.toLowerCase()
      ? [token0, token1]
      : [token1, token0];
  }, [token0, token1]);
  
  // Pool info
  const { poolAddress, exists: poolExists } = usePoolExists(
    (sortedToken0?.address || "0x0") as `0x${string}`,
    (sortedToken1?.address || "0x0") as `0x${string}`,
    selectedFee
  );
  
  const { sqrtPriceX96, liquidity: poolLiquidity } = usePoolInfo(poolAddress as `0x${string}` | undefined);
  
  // Calculate current price from sqrtPriceX96
  const currentPrice = useMemo(() => {
    if (!sqrtPriceX96 || !sortedToken0 || !sortedToken1) return undefined;
    const Q96 = Math.pow(2, 96);
    const price = Math.pow(Number(sqrtPriceX96) / Q96, 2);
    // Adjust for decimals
    const decimalAdjustment = Math.pow(10, (sortedToken0.decimals || 18) - (sortedToken1.decimals || 18));
    return price * decimalAdjustment;
  }, [sqrtPriceX96, sortedToken0, sortedToken1]);
  
  const { addLiquidity, createPool, isLoading } = useLiquidity();
  
  const handleAddLiquidity = async () => {
    if (!sortedToken0?.address || !sortedToken1?.address || !address) return;
    
    try {
      const token0Decimals = sortedToken0.decimals || 18;
      const token1Decimals = sortedToken1.decimals || 18;
      
      // Parse amounts
      const amount0Wei = parseUnits(amount0 || "0", token0Decimals);
      const amount1Wei = parseUnits(amount1 || "0", token1Decimals);
      
      // Get ticks from prices (adjusted for decimals)
      const tickSpacing = getTickSpacing(selectedFee);
      const decimalAdjustment = Math.pow(10, token1Decimals - token0Decimals);
      const minTick = minPrice ? nearestUsableTick(
        priceToTick(parseFloat(minPrice) * decimalAdjustment),
        tickSpacing
      ) : MIN_TICK;
      const maxTick = maxPrice ? nearestUsableTick(
        priceToTick(parseFloat(maxPrice) * decimalAdjustment),
        tickSpacing
      ) : MAX_TICK;
      
      addToast({ title: "Adding Liquidity", message: "Please confirm the transaction...", type: "pending" });
      
      const result = await addLiquidity({
        token0: sortedToken0.address as `0x${string}`,
        token1: sortedToken1.address as `0x${string}`,
        fee: selectedFee,
        tickLower: minTick,
        tickUpper: maxTick,
        amount0Desired: amount0Wei,
        amount1Desired: amount1Wei,
        amount0Min: BigInt(0),
        amount1Min: BigInt(0),
      });
      
      if (result) {
        addToast({ title: "Success!", message: "Liquidity added successfully", type: "success", txHash: result });
        onClose();
      }
    } catch (error: any) {
      addToast({ title: "Failed", message: error.message || "Could not add liquidity", type: "error" });
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-xl p-6"
        style={{ background: "#0f0f0f", border: "1px solid #1f1f1f" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Add Liquidity</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Token Pair Selection */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">Select Pair</div>
          <div className="flex items-center gap-3">
            <TokenSelector selected={token0Symbol} onChange={setToken0Symbol} tokens={hubTokens} excludeToken={token1Symbol} />
            <span className="text-gray-500">/</span>
            <TokenSelector selected={token1Symbol} onChange={setToken1Symbol} tokens={hubTokens} excludeToken={token0Symbol} />
          </div>
        </div>
        
        {/* Fee Tier */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">Fee Tier</div>
          <div className="grid grid-cols-4 gap-2">
            {FEE_TIERS.map((tier) => (
              <button
                key={tier.fee}
                onClick={() => setSelectedFee(tier.fee)}
                className="py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: selectedFee === tier.fee ? "white" : "transparent",
                  color: selectedFee === tier.fee ? "#0f0f0f" : "#6B7280",
                  border: selectedFee === tier.fee ? "none" : "1px solid #374151",
                }}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Amounts */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">Deposit Amounts</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-700">
                  <Image src={getTokenLogoBySymbol(token0Symbol)} alt={token0Symbol} width={20} height={20} />
                </div>
                <span className="text-sm text-white">{token0Symbol}</span>
              </div>
              <input
                type="number"
                value={amount0}
                onChange={(e) => setAmount0(e.target.value)}
                placeholder="0.0"
                className="bg-transparent text-right text-lg text-white focus:outline-none w-32"
              />
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-700">
                  <Image src={getTokenLogoBySymbol(token1Symbol)} alt={token1Symbol} width={20} height={20} />
                </div>
                <span className="text-sm text-white">{token1Symbol}</span>
              </div>
              <input
                type="number"
                value={amount1}
                onChange={(e) => setAmount1(e.target.value)}
                placeholder="0.0"
                className="bg-transparent text-right text-lg text-white focus:outline-none w-32"
              />
            </div>
          </div>
        </div>
        
        {/* Price Range */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">Price Range</div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="∞"
                className="w-full bg-transparent text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>
        </div>
        
        {/* Add Button */}
        <button
          onClick={handleAddLiquidity}
          disabled={isLoading || !amount0 || !amount1}
          className="w-full py-4 rounded-xl font-semibold transition-all disabled:opacity-40"
          style={{
            background: isLoading || !amount0 || !amount1 ? "#374151" : "white",
            color: isLoading || !amount0 || !amount1 ? "#9CA3AF" : "#0f0f0f",
          }}
        >
          {isLoading ? "Adding..." : "Add Liquidity"}
        </button>
      </motion.div>
    </div>
  );
}

// Remove Liquidity Modal
function RemoveLiquidityModal({
  isOpen,
  onClose,
  position,
}: {
  isOpen: boolean;
  onClose: () => void;
  position: DisplayPosition | null;
}) {
  const [percentage, setPercentage] = useState(100);
  const { addToast } = useToast();
  const { removeLiquidity, isLoading } = useLiquidity();

  const handleRemove = async () => {
    if (!position) return;
    
    try {
      const liquidityToRemove = (position.liquidity * BigInt(percentage)) / BigInt(100);
      
      addToast({ title: "Removing Liquidity", message: "Please confirm the transaction...", type: "pending" });
      
      const result = await removeLiquidity(position.tokenId, liquidityToRemove);
      
      if (result) {
        addToast({ title: "Success!", message: "Liquidity removed successfully", type: "success", txHash: result });
        onClose();
      }
    } catch (error: any) {
      addToast({ title: "Failed", message: error.message || "Could not remove liquidity", type: "error" });
    }
  };

  if (!isOpen || !position) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-xl p-6"
        style={{ background: "#0f0f0f", border: "1px solid #1f1f1f" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Remove Liquidity</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-white mb-2">{percentage}%</div>
          <div className="text-sm text-gray-500">{position.token0} / {position.token1}</div>
        </div>
        
        <input
          type="range"
          min="1"
          max="100"
          value={percentage}
          onChange={(e) => setPercentage(parseInt(e.target.value))}
          className="w-full mb-6"
        />
        
        <div className="flex gap-2 mb-6">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => setPercentage(p)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: percentage === p ? "white" : "transparent",
                color: percentage === p ? "#0f0f0f" : "#6B7280",
                border: percentage === p ? "none" : "1px solid #374151",
              }}
            >
              {p}%
            </button>
          ))}
        </div>
        
        <button
          onClick={handleRemove}
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-semibold transition-all disabled:opacity-40"
          style={{
            background: isLoading ? "#374151" : "#EF4444",
            color: "white",
          }}
        >
          {isLoading ? "Removing..." : "Remove Liquidity"}
        </button>
      </motion.div>
    </div>
  );
}

// Main Liquidity Page
export default function LiquidityPage() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"positions" | "pools">("positions");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<DisplayPosition | null>(null);
  
  // Fetch user's positions
  const { positions, fetchPositions, collectFees, isLoading } = useLiquidity();
  
  // Auto-switch to Hub chain
  useEffect(() => {
    if (isConnected && switchChain && chain?.id !== HUB_CHAIN_ID) {
      switchChain({ chainId: HUB_CHAIN_ID });
    }
  }, [isConnected, switchChain, chain?.id]);

  // Transform positions for display
  const displayPositions: DisplayPosition[] = useMemo(() => {
    return positions.map((p, i) => ({
      id: p.tokenId.toString(),
      tokenId: p.tokenId,
      token0: p.token0Symbol || "???",
      token1: p.token1Symbol || "???",
      token0Decimals: p.token0Decimals,
      token1Decimals: p.token1Decimals,
      token0Address: p.token0,
      token1Address: p.token1,
      chain: "Sonic",
      chainId: HUB_CHAIN_ID,
      fee: p.fee,
      liquidity: p.liquidity,
      tickLower: p.tickLower,
      tickUpper: p.tickUpper,
      minPrice: tickToPrice(p.tickLower) / Math.pow(10, (p.token1Decimals || 18) - (p.token0Decimals || 18)),
      maxPrice: tickToPrice(p.tickUpper) / Math.pow(10, (p.token1Decimals || 18) - (p.token0Decimals || 18)),
      currentPrice: 0, // Would need to fetch
      inRange: true, // Would need to calculate
      tokensOwed0: p.tokensOwed0,
      tokensOwed1: p.tokensOwed1,
    }));
  }, [positions]);

  const handleCollectFees = async (position: DisplayPosition) => {
    try {
      addToast({ title: "Collecting Fees", message: "Please confirm the transaction...", type: "pending" });
      const result = await collectFees(position.tokenId);
      if (result) {
        addToast({ title: "Success!", message: "Fees collected successfully", type: "success", txHash: result });
      }
    } catch (error: any) {
      addToast({ title: "Failed", message: error.message || "Could not collect fees", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />

      <main className="pt-32 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-semibold text-white">Liquidity</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: "white", color: "#0f0f0f" }}
            >
              + Add Position
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mb-8 border-b border-gray-800">
            <button
              onClick={() => setActiveTab("positions")}
              className="pb-3 text-sm font-medium transition-all"
              style={{
                color: activeTab === "positions" ? "white" : "#6B7280",
                borderBottom: activeTab === "positions" ? "2px solid white" : "2px solid transparent",
              }}
            >
              Your Positions
            </button>
            <button
              onClick={() => setActiveTab("pools")}
              className="pb-3 text-sm font-medium transition-all"
              style={{
                color: activeTab === "pools" ? "white" : "#6B7280",
                borderBottom: activeTab === "pools" ? "2px solid white" : "2px solid transparent",
              }}
            >
              Top Pools
            </button>
          </div>

          {/* Content */}
          {activeTab === "positions" && (
            <>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">Loading positions...</div>
                </div>
              ) : displayPositions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">No liquidity positions yet</div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 rounded-lg text-sm font-medium transition-all"
                    style={{ background: "white", color: "#0f0f0f" }}
                  >
                    Create Position
                  </button>
                </div>
              ) : (
                displayPositions.map((position) => (
                  <PositionCard
                    key={position.id}
                    position={position}
                    onManage={() => {
                      setSelectedPosition(position);
                      setShowRemoveModal(true);
                    }}
                    onCollect={() => handleCollectFees(position)}
                  />
                ))
              )}
            </>
          )}

          {activeTab === "pools" && (
            <div className="text-center py-12">
              <div className="text-gray-500">Top pools coming soon</div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddLiquidityModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <RemoveLiquidityModal 
        isOpen={showRemoveModal} 
        onClose={() => { setShowRemoveModal(false); setSelectedPosition(null); }} 
        position={selectedPosition} 
      />
    </div>
  );
}

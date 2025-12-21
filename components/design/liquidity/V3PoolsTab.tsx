"use client";

import { useState, useMemo, useEffect } from 'react';
import { Waves, TrendingUp, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { getTokenLogoBySymbol } from '@/lib/tokens/logos';
import { getTokensForChain, type Token } from '@/lib/tokens/tokenList';
import { useAllPools, type PoolData } from '@/lib/contracts/hooks/usePoolData';
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
} from '@/lib/contracts/hooks/useLiquidity';
import { useToast } from '@/components/Toast';
import { useAllTokenBalances } from '@/hooks/useTokenBalances';

const HUB_CHAIN_ID = 146;

// Format large numbers
function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

// Token Selector Modal
function TokenSelectorModal({
  isOpen,
  onClose,
  onSelect,
  tokens,
  excludeToken,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (symbol: string) => void;
  tokens: Token[];
  excludeToken?: string;
}) {
  const [search, setSearch] = useState('');
  const { balances } = useAllTokenBalances(HUB_CHAIN_ID);

  const filteredTokens = tokens
    .filter((t) => t.symbol !== excludeToken)
    .filter((t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
    )
    .map((token) => ({
      ...token,
      balance: balances[token.symbol]?.balanceFormatted || '0.00',
    }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-xl overflow-hidden"
        style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}
      >
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">Select Token</h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or symbol"
            autoFocus
            className="w-full px-3 py-2 bg-zinc-900 text-white text-sm rounded-lg placeholder-zinc-500 focus:outline-none"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredTokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => { onSelect(token.symbol); onClose(); setSearch(''); }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-700">
                  <Image src={getTokenLogoBySymbol(token.symbol)} alt={token.symbol} width={32} height={32} />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm">{token.symbol}</div>
                  <div className="text-zinc-500 text-xs">{token.name}</div>
                </div>
              </div>
              <span className="text-zinc-400 text-sm">{token.balance}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Add Liquidity Modal
function AddLiquidityModal({
  isOpen,
  onClose,
  preselectedPool,
}: {
  isOpen: boolean;
  onClose: () => void;
  preselectedPool?: PoolData;
}) {
  const { address } = useAccount();
  const { addToast } = useToast();
  const { balances } = useAllTokenBalances(HUB_CHAIN_ID);
  const hubTokens = getTokensForChain(HUB_CHAIN_ID);
  
  const [token0Symbol, setToken0Symbol] = useState(preselectedPool?.token0Symbol || 'sWETH');
  const [token1Symbol, setToken1Symbol] = useState(preselectedPool?.token1Symbol || 'sUSDC');
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [selectedFee, setSelectedFee] = useState(preselectedPool?.fee || 3000);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showToken0Selector, setShowToken0Selector] = useState(false);
  const [showToken1Selector, setShowToken1Selector] = useState(false);

  useEffect(() => {
    if (preselectedPool) {
      setToken0Symbol(preselectedPool.token0Symbol);
      setToken1Symbol(preselectedPool.token1Symbol);
      setSelectedFee(preselectedPool.fee);
    }
  }, [preselectedPool]);

  const token0 = hubTokens.find(t => t.symbol === token0Symbol);
  const token1 = hubTokens.find(t => t.symbol === token1Symbol);

  const [sortedToken0, sortedToken1] = useMemo(() => {
    if (!token0?.address || !token1?.address) return [token0, token1];
    return token0.address.toLowerCase() < token1.address.toLowerCase()
      ? [token0, token1]
      : [token1, token0];
  }, [token0, token1]);

  const { poolAddress, exists: poolExists } = usePoolExists(
    (sortedToken0?.address || '0x0') as `0x${string}`,
    (sortedToken1?.address || '0x0') as `0x${string}`,
    selectedFee
  );

  const { sqrtPriceX96 } = usePoolInfo(poolAddress as `0x${string}` | undefined);

  const currentPrice = useMemo(() => {
    if (!sqrtPriceX96 || !sortedToken0 || !sortedToken1) return undefined;
    const Q96 = Math.pow(2, 96);
    const price = Math.pow(Number(sqrtPriceX96) / Q96, 2);
    const decimalAdjustment = Math.pow(10, (sortedToken0.decimals || 18) - (sortedToken1.decimals || 18));
    return price * decimalAdjustment;
  }, [sqrtPriceX96, sortedToken0, sortedToken1]);

  const { addLiquidity, isLoading } = useLiquidity();

  const handleAddLiquidity = async () => {
    if (!sortedToken0?.address || !sortedToken1?.address || !address) return;

    try {
      const token0Decimals = sortedToken0.decimals || 18;
      const token1Decimals = sortedToken1.decimals || 18;

      const amount0Wei = parseUnits(amount0 || '0', token0Decimals);
      const amount1Wei = parseUnits(amount1 || '0', token1Decimals);

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

      addToast({ title: 'Adding Liquidity', message: 'Please confirm the transaction...', type: 'pending' });

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
        addToast({ title: 'Success!', message: 'Liquidity added successfully', type: 'success', txHash: result });
        onClose();
      }
    } catch (error: any) {
      addToast({ title: 'Failed', message: error.message || 'Could not add liquidity', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-xl p-6"
          style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Add Liquidity</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Token Pair */}
          <div className="mb-6">
            <div className="text-sm text-zinc-500 mb-2">Select Pair</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowToken0Selector(true)}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-700">
                  <Image src={getTokenLogoBySymbol(token0Symbol)} alt={token0Symbol} width={20} height={20} />
                </div>
                <span className="text-white">{token0Symbol}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <span className="text-zinc-500">/</span>
              <button
                onClick={() => setShowToken1Selector(true)}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-700">
                  <Image src={getTokenLogoBySymbol(token1Symbol)} alt={token1Symbol} width={20} height={20} />
                </div>
                <span className="text-white">{token1Symbol}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
            </div>
          </div>

          {/* Fee Tier */}
          <div className="mb-6">
            <div className="text-sm text-zinc-500 mb-2">Fee Tier</div>
            <div className="grid grid-cols-4 gap-2">
              {FEE_TIERS.map((tier) => (
                <button
                  key={tier.fee}
                  onClick={() => setSelectedFee(tier.fee)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedFee === tier.fee
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'bg-transparent text-zinc-500 border border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Price */}
          {currentPrice && (
            <div className="mb-6 p-3 bg-zinc-800/30 rounded-lg text-sm">
              <span className="text-zinc-500">Current Price: </span>
              <span className="text-white">{currentPrice.toFixed(4)} {token1Symbol} per {token0Symbol}</span>
            </div>
          )}

          {/* Amounts */}
          <div className="mb-6">
            <div className="text-sm text-zinc-500 mb-2">Deposit Amounts</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-700">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-700">
                    <Image src={getTokenLogoBySymbol(token0Symbol)} alt={token0Symbol} width={20} height={20} />
                  </div>
                  <span className="text-white text-sm">{token0Symbol}</span>
                  <span className="text-xs text-zinc-500">(Bal: {balances[token0Symbol]?.balanceFormatted || '0'})</span>
                </div>
                <input
                  type="number"
                  value={amount0}
                  onChange={(e) => setAmount0(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-right text-lg text-white focus:outline-none w-32"
                />
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-700">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-700">
                    <Image src={getTokenLogoBySymbol(token1Symbol)} alt={token1Symbol} width={20} height={20} />
                  </div>
                  <span className="text-white text-sm">{token1Symbol}</span>
                  <span className="text-xs text-zinc-500">(Bal: {balances[token1Symbol]?.balanceFormatted || '0'})</span>
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
            <div className="text-sm text-zinc-500 mb-2">Price Range (optional)</div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-zinc-500 mb-1 block">Min Price</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0 (Full)"
                  className="w-full bg-transparent text-white px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-zinc-500 mb-1 block">Max Price</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="∞ (Full)"
                  className="w-full bg-transparent text-white px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleAddLiquidity}
            disabled={isLoading || !amount0 || !amount1}
            className={`w-full py-4 rounded-xl font-semibold transition-all ${
              isLoading || !amount0 || !amount1
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-100 hover:bg-white text-zinc-950'
            }`}
          >
            {isLoading ? 'Adding...' : poolExists ? 'Add Liquidity' : 'Create Pool & Add Liquidity'}
          </button>
        </motion.div>
      </div>

      <TokenSelectorModal
        isOpen={showToken0Selector}
        onClose={() => setShowToken0Selector(false)}
        onSelect={setToken0Symbol}
        tokens={hubTokens}
        excludeToken={token1Symbol}
      />
      <TokenSelectorModal
        isOpen={showToken1Selector}
        onClose={() => setShowToken1Selector(false)}
        onSelect={setToken1Symbol}
        tokens={hubTokens}
        excludeToken={token0Symbol}
      />
    </>
  );
}

// Manage Position Modal
function ManagePositionModal({
  isOpen,
  onClose,
  position,
}: {
  isOpen: boolean;
  onClose: () => void;
  position: any;
}) {
  const [percentage, setPercentage] = useState(100);
  const { addToast } = useToast();
  const { removeLiquidity, collectFees, isLoading } = useLiquidity();

  const handleRemove = async () => {
    if (!position) return;

    try {
      const liquidityToRemove = (position.liquidity * BigInt(percentage)) / BigInt(100);
      addToast({ title: 'Removing Liquidity', message: 'Please confirm the transaction...', type: 'pending' });

      const result = await removeLiquidity(position.tokenId, liquidityToRemove);
      if (result) {
        addToast({ title: 'Success!', message: 'Liquidity removed successfully', type: 'success', txHash: result });
        onClose();
      }
    } catch (error: any) {
      addToast({ title: 'Failed', message: error.message || 'Could not remove liquidity', type: 'error' });
    }
  };

  const handleCollect = async () => {
    if (!position) return;

    try {
      addToast({ title: 'Collecting Fees', message: 'Please confirm the transaction...', type: 'pending' });
      const result = await collectFees(position.tokenId);
      if (result) {
        addToast({ title: 'Success!', message: 'Fees collected successfully', type: 'success', txHash: result });
      }
    } catch (error: any) {
      addToast({ title: 'Failed', message: error.message || 'Could not collect fees', type: 'error' });
    }
  };

  if (!isOpen || !position) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-xl p-6"
        style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Manage Position</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-white mb-2">{percentage}%</div>
          <div className="text-sm text-zinc-500">{position.token0Symbol} / {position.token1Symbol}</div>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          value={percentage}
          onChange={(e) => setPercentage(parseInt(e.target.value))}
          className="w-full mb-6 accent-white"
        />

        <div className="flex gap-2 mb-6">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => setPercentage(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                percentage === p
                  ? 'bg-zinc-100 text-zinc-950'
                  : 'bg-transparent text-zinc-500 border border-zinc-700'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCollect}
            disabled={isLoading}
            className="flex-1 py-4 rounded-xl font-semibold transition-all bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40"
          >
            Collect Fees
          </button>
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="flex-1 py-4 rounded-xl font-semibold transition-all bg-red-500 hover:bg-red-400 text-white disabled:opacity-40"
          >
            {isLoading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function V3PoolsTab() {
  const { address, isConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'positions'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<PoolData | undefined>(undefined);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);

  // Fetch real pool data from V3 contracts
  const { pools, stats, isLoading: poolsLoading } = useAllPools();
  
  // Fetch user's positions
  const { positions, isLoading: positionsLoading } = useLiquidity();

  // Filter pools by search
  const filteredPools = useMemo(() => {
    if (!searchQuery) return pools;
    const query = searchQuery.toLowerCase();
    return pools.filter(p =>
      p.token0Symbol.toLowerCase().includes(query) ||
      p.token1Symbol.toLowerCase().includes(query)
    );
  }, [pools, searchQuery]);

  // Map positions to pools for "My Liquidity" display
  const poolPositions = useMemo(() => {
    const map: Record<string, any> = {};
    for (const pos of positions) {
      const key = `${pos.token0.toLowerCase()}-${pos.token1.toLowerCase()}-${pos.fee}`;
      if (!map[key]) {
        map[key] = pos;
      }
    }
    return map;
  }, [positions]);

  const hasPositionInPool = (pool: PoolData) => {
    const key = `${pool.token0Address.toLowerCase()}-${pool.token1Address.toLowerCase()}-${pool.fee}`;
    return !!poolPositions[key];
  };

  const getPositionForPool = (pool: PoolData) => {
    const key = `${pool.token0Address.toLowerCase()}-${pool.token1Address.toLowerCase()}-${pool.fee}`;
    return poolPositions[key];
  };

  // Calculate user's total liquidity
  const userTotalLiquidity = useMemo(() => {
    // Simple estimate based on number of positions
    return positions.length > 0 ? stats.totalTvlUsd * 0.05 : 0; // Mock: 5% of TVL if has positions
  }, [positions, stats.totalTvlUsd]);

  const isLoading = poolsLoading || positionsLoading;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-zinc-900/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Waves className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500">Total Value Locked</span>
          </div>
          <div className="text-zinc-100 text-2xl">
            {isLoading ? '...' : formatUsd(stats.totalTvlUsd)}
          </div>
        </div>
        <div className="p-6 bg-zinc-900/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500">24h Volume</span>
          </div>
          <div className="text-zinc-100 text-2xl">
            {isLoading ? '...' : formatUsd(stats.totalVolume24h)}
          </div>
        </div>
        <div className="p-6 bg-zinc-900/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500">Your Liquidity</span>
          </div>
          <div className="text-zinc-100 text-2xl">
            {isLoading ? '...' : formatUsd(userTotalLiquidity)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'all'
                ? 'bg-zinc-100 text-zinc-950'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            All Pools
          </button>
          <button
            onClick={() => setViewMode('positions')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'positions'
                ? 'bg-zinc-100 text-zinc-950'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            My Positions {positions.length > 0 && `(${positions.length})`}
          </button>
        </div>

        <input
          type="text"
          placeholder="Search pools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 bg-zinc-900/30 text-zinc-100 placeholder:text-zinc-600 rounded-lg outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
        />
      </div>

      {/* Pools List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-zinc-500">Loading pools...</div>
        ) : filteredPools.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            {searchQuery ? 'No pools found matching your search' : 'No pools available yet'}
          </div>
        ) : (
          filteredPools
            .filter(pool => viewMode === 'all' || hasPositionInPool(pool))
            .map((pool, index) => {
              const hasPosition = hasPositionInPool(pool);
              return (
                <motion.div
                  key={pool.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 bg-zinc-900/30 rounded-xl hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-950 bg-zinc-700">
                            <Image src={getTokenLogoBySymbol(pool.token0Symbol)} alt={pool.token0Symbol} width={32} height={32} />
                          </div>
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-950 bg-zinc-700">
                            <Image src={getTokenLogoBySymbol(pool.token1Symbol)} alt={pool.token1Symbol} width={32} height={32} />
                          </div>
                        </div>
                        <h3 className="text-zinc-100">{pool.token0Symbol} / {pool.token1Symbol}</h3>
                        <span className="text-xs text-zinc-500 px-2 py-1 bg-zinc-800/50 rounded">
                          {pool.fee / 10000}%
                        </span>
                        {hasPosition && (
                          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-zinc-500 mb-1">TVL</div>
                        <div className="text-zinc-100">{formatUsd(pool.tvlUsd)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-zinc-500 mb-1">24h Volume</div>
                        <div className="text-zinc-100">{formatUsd(pool.volume24h)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-zinc-500 mb-1">APY</div>
                        <div className="text-zinc-100 text-xl">{pool.apy.toFixed(1)}%</div>
                      </div>
                      {hasPosition ? (
                        <div className="w-32" />
                      ) : (
                        <div className="w-32" />
                      )}
                      <button
                        onClick={() => {
                          if (hasPosition) {
                            const pos = getPositionForPool(pool);
                            setSelectedPosition(pos);
                            setShowManageModal(true);
                          } else {
                            setSelectedPool(pool);
                            setShowAddModal(true);
                          }
                        }}
                        className={`px-6 py-3 rounded-lg transition-all ${
                          hasPosition
                            ? 'bg-zinc-100 hover:bg-white text-zinc-950'
                            : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {hasPosition ? 'Manage' : 'Add Liquidity'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
        )}
      </div>

      {/* Create Pool Button */}
      <div className="mt-8 p-6 bg-zinc-900/30 rounded-xl text-center">
        <p className="text-zinc-400 mb-4">Don't see a pool you're looking for?</p>
        <button
          onClick={() => { setSelectedPool(undefined); setShowAddModal(true); }}
          className="px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg transition-all"
        >
          Create New Pool
        </button>
      </div>

      {/* Modals */}
      <AddLiquidityModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setSelectedPool(undefined); }}
        preselectedPool={selectedPool}
      />
      <ManagePositionModal
        isOpen={showManageModal}
        onClose={() => { setShowManageModal(false); setSelectedPosition(null); }}
        position={selectedPosition}
      />
    </div>
  );
}

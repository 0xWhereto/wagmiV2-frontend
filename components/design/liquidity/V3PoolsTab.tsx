"use client";

import { Waves, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const POOLS = [
  {
    id: 1,
    pair: 'ETH / USDC',
    fee: '0.3%',
    tvl: '$45.2M',
    volume24h: '$12.8M',
    apy: '28.5%',
    myLiquidity: '$5,420.00',
  },
  {
    id: 2,
    pair: 'WBTC / ETH',
    fee: '0.3%',
    tvl: '$32.4M',
    volume24h: '$8.4M',
    apy: '22.1%',
    myLiquidity: '$0.00',
  },
  {
    id: 3,
    pair: 'USDC / USDT',
    fee: '0.01%',
    tvl: '$89.7M',
    volume24h: '$24.5M',
    apy: '8.2%',
    myLiquidity: '$0.00',
  },
  {
    id: 4,
    pair: 'ETH / DAI',
    fee: '0.3%',
    tvl: '$18.3M',
    volume24h: '$4.2M',
    apy: '18.7%',
    myLiquidity: '$2,150.00',
  },
  {
    id: 5,
    pair: 'MATIC / USDC',
    fee: '0.3%',
    tvl: '$12.8M',
    volume24h: '$3.1M',
    apy: '15.4%',
    myLiquidity: '$0.00',
  },
];

export function V3PoolsTab() {
  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-zinc-900/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Waves className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500">Total Value Locked</span>
          </div>
          <div className="text-zinc-100 text-2xl">$198.4M</div>
        </div>
        <div className="p-6 bg-zinc-900/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500">24h Volume</span>
          </div>
          <div className="text-zinc-100 text-2xl">$53.0M</div>
        </div>
        <div className="p-6 bg-zinc-900/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500">Your Liquidity</span>
          </div>
          <div className="text-zinc-100 text-2xl">$7,570.00</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-zinc-100 text-zinc-950 rounded-lg">
            All Pools
          </button>
          <button className="px-4 py-2 text-zinc-400 hover:text-zinc-100 transition-colors">
            My Positions
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Search pools..."
          className="px-4 py-2 bg-zinc-900/30 text-zinc-100 placeholder:text-zinc-600 rounded-lg outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
        />
      </div>

      {/* Pools List */}
      <div className="space-y-4">
        {POOLS.map((pool, index) => (
          <motion.div
            key={pool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-6 bg-zinc-900/30 rounded-xl hover:bg-zinc-900/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-zinc-100">{pool.pair}</h3>
                  <span className="text-xs text-zinc-500 px-2 py-1 bg-zinc-800/50 rounded">
                    {pool.fee}
                  </span>
                  {pool.myLiquidity !== '$0.00' && (
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="text-zinc-500 mb-1">TVL</div>
                  <div className="text-zinc-100">{pool.tvl}</div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-500 mb-1">24h Volume</div>
                  <div className="text-zinc-100">{pool.volume24h}</div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-500 mb-1">APY</div>
                  <div className="text-zinc-100 text-xl">{pool.apy}</div>
                </div>
                {pool.myLiquidity !== '$0.00' ? (
                  <div className="text-right">
                    <div className="text-zinc-500 mb-1">My Liquidity</div>
                    <div className="text-zinc-100">{pool.myLiquidity}</div>
                  </div>
                ) : (
                  <div className="w-32" />
                )}
                <button
                  className={`px-6 py-3 rounded-lg transition-all ${
                    pool.myLiquidity !== '$0.00'
                      ? 'bg-zinc-100 hover:bg-white text-zinc-950'
                      : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {pool.myLiquidity !== '$0.00' ? 'Manage' : 'Add Liquidity'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Pool Button */}
      <div className="mt-8 p-6 bg-zinc-900/30 rounded-xl text-center">
        <p className="text-zinc-400 mb-4">Don't see a pool you're looking for?</p>
        <button className="px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg transition-all">
          Create New Pool
        </button>
      </div>
    </div>
  );
}


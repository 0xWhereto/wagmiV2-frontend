"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  TrendingUp, 
  Wallet, 
  Info, 
  ExternalLink,
  ArrowDown,
  ArrowUpRight,
  Lock,
  Unlock,
  ChevronDown
} from 'lucide-react';
import { useAccount } from 'wagmi';

// Vault data for wETH and wBTC
const VAULTS = [
  {
    id: 'weth',
    name: 'wETH Vault',
    asset: 'ETH',
    wToken: 'wETH',
    icon: '⟠',
    iconBg: 'from-blue-400 to-blue-600',
    description: 'Zero IL ETH exposure with 2x leveraged LP',
    tvl: '$12,450,000',
    totalDeposits: '3,720 ETH',
    apr: '18.5%',
    avgApr7d: '17.2%',
    utilization: '72.5%',
    userDeposit: '2.5 ETH',
    userValue: '$8,425.00',
    userEarned: '$342.50',
    dtv: '50%',
    leverage: '2x',
  },
  {
    id: 'wbtc',
    name: 'wBTC Vault',
    asset: 'BTC',
    wToken: 'wBTC',
    icon: '₿',
    iconBg: 'from-orange-400 to-orange-600',
    description: 'Zero IL BTC exposure with 2x leveraged LP',
    tvl: '$28,900,000',
    totalDeposits: '304 BTC',
    apr: '15.2%',
    avgApr7d: '14.8%',
    utilization: '68.3%',
    userDeposit: '0.15 BTC',
    userValue: '$14,250.00',
    userEarned: '$523.80',
    dtv: '50%',
    leverage: '2x',
  },
];

const USER_POSITIONS = [
  {
    id: 1,
    vault: 'wETH',
    asset: 'ETH',
    deposited: '2.5 ETH',
    value: '$8,425.00',
    earned: '+$342.50',
    apr: '18.5%',
    timestamp: '2024-01-15',
  },
  {
    id: 2,
    vault: 'wBTC',
    asset: 'BTC',
    deposited: '0.15 BTC',
    value: '$14,250.00',
    earned: '+$523.80',
    apr: '15.2%',
    timestamp: '2024-01-10',
  },
];

export function VaultsTab() {
  const { isConnected } = useAccount();
  const [selectedVault, setSelectedVault] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [actionMode, setActionMode] = useState<'deposit' | 'withdraw'>('deposit');

  const handleDeposit = async () => {
    // Mock deposit action
    console.log('Depositing', depositAmount, 'to vault', selectedVault);
    setDepositAmount('');
    setSelectedVault(null);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl text-zinc-100">Zero IL Vaults</h1>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Zero Impermanent Loss
              </span>
            </div>
            <p className="text-zinc-400 mb-3 max-w-2xl">
              Deposit ETH or BTC to earn yield without impermanent loss. Our 2x leverage mechanism 
              mathematically eliminates IL by transforming √p growth to linear p growth. Your deposit 
              tracks the asset price 1:1 while earning trading fees from Uniswap V3 concentrated liquidity.
            </p>
            <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1 mb-4">
              Learn how Zero IL works <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-900/30 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
              <Lock className="w-4 h-4" />
              Total Value Locked
            </div>
            <div className="text-zinc-100 text-2xl">$41.35M</div>
          </div>
          <div className="p-4 bg-zinc-900/30 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              Avg APR
            </div>
            <div className="text-emerald-400 text-2xl">16.8%</div>
          </div>
          <div className="p-4 bg-zinc-900/30 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
              <Shield className="w-4 h-4" />
              Leverage
            </div>
            <div className="text-zinc-100 text-2xl">2x (50% DTV)</div>
          </div>
          <div className="p-4 bg-zinc-900/30 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
              <Wallet className="w-4 h-4" />
              Your Deposits
            </div>
            <div className="text-zinc-100 text-2xl">$22,675.00</div>
          </div>
        </div>
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {VAULTS.map((vault, index) => (
          <motion.div
            key={vault.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-6 bg-zinc-900/30 rounded-xl hover:bg-zinc-900/40 transition-colors"
          >
            {/* Vault Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${vault.iconBg} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                  {vault.icon}
                </div>
                <div>
                  <h3 className="text-zinc-100 text-xl">{vault.name}</h3>
                  <p className="text-zinc-500 text-sm">{vault.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 text-2xl font-medium">{vault.apr}</div>
                <div className="text-zinc-500 text-sm">APR</div>
              </div>
            </div>

            {/* Vault Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-zinc-500 text-sm mb-1">TVL</div>
                <div className="text-zinc-100">{vault.tvl}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-sm mb-1">Total Deposits</div>
                <div className="text-zinc-100">{vault.totalDeposits}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-sm mb-1">Utilization</div>
                <div className="text-zinc-100">{vault.utilization}</div>
              </div>
            </div>

            {/* Zero IL Badge */}
            <div className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-lg mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-400">Zero IL</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-zinc-400">{vault.leverage} Leverage</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-yellow-400" />
                <span className="text-zinc-400">{vault.dtv} DTV</span>
              </div>
            </div>

            {/* User Position (if any) */}
            {isConnected && vault.userDeposit !== '0' && (
              <div className="p-4 bg-zinc-800/30 rounded-lg mb-6 border border-zinc-700/50">
                <div className="text-zinc-500 text-sm mb-3">Your Position</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-zinc-400 text-xs mb-1">Deposited</div>
                    <div className="text-zinc-100">{vault.userDeposit}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-xs mb-1">Value</div>
                    <div className="text-zinc-100">{vault.userValue}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-xs mb-1">Earned</div>
                    <div className="text-emerald-400">{vault.userEarned}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedVault(vault.id);
                  setActionMode('deposit');
                }}
                className="flex-1 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg transition-all font-medium"
              >
                Deposit {vault.asset}
              </button>
              {isConnected && vault.userDeposit !== '0' && (
                <button
                  onClick={() => {
                    setSelectedVault(vault.id);
                    setActionMode('withdraw');
                  }}
                  className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 rounded-lg transition-all"
                >
                  Withdraw
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* User Positions Table */}
      {isConnected && (
        <div className="mb-8">
          <h2 className="text-zinc-100 text-xl mb-4">Your Positions</h2>
          
          <div className="space-y-3">
            {USER_POSITIONS.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-zinc-900/30 rounded-xl hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                      position.asset === 'ETH' 
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
                        : 'bg-gradient-to-br from-orange-400 to-orange-600'
                    }`}>
                      {position.asset === 'ETH' ? '⟠' : '₿'}
                    </div>
                    <div>
                      <div className="text-zinc-100 font-medium">{position.vault} Vault</div>
                      <div className="text-zinc-500 text-sm">Deposited: {position.deposited}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-zinc-500 text-sm">Value</div>
                      <div className="text-zinc-100">{position.value}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-zinc-500 text-sm">Earned</div>
                      <div className="text-emerald-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        {position.earned}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-zinc-500 text-sm">APR</div>
                      <div className="text-zinc-100">{position.apr}</div>
                    </div>
                    <button className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 rounded-lg transition-all">
                      Manage
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* How Zero IL Works */}
      <div className="p-6 bg-zinc-900/30 rounded-xl">
        <h3 className="text-zinc-100 mb-4 flex items-center gap-2">
          How Zero IL Works
          <Info className="w-4 h-4 text-zinc-500" />
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 text-sm text-zinc-400">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 text-xs flex-shrink-0">
                1
              </div>
              <p>Deposit ETH or BTC to receive wETH or wBTC tokens</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 text-xs flex-shrink-0">
                2
              </div>
              <p>Protocol borrows USDW at 50% DTV ratio (2x leverage)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 text-xs flex-shrink-0">
                3
              </div>
              <p>Assets + USDW deployed to Uniswap V3 concentrated LP</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 text-xs flex-shrink-0">
                4
              </div>
              <p>2x leverage transforms √p growth → linear p = Zero IL</p>
            </div>
          </div>

          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="text-zinc-300 mb-3 font-medium">The Math</div>
            <div className="font-mono text-xs text-zinc-400 space-y-2">
              <div>Traditional LP: Value = √(p_new/p_old) × Initial</div>
              <div className="text-emerald-400">With 2x Leverage: Value ≈ (p_new/p_old) × Initial</div>
              <div className="pt-2 border-t border-zinc-700 mt-2 text-zinc-300">
                Result: Your position tracks asset price 1:1
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit/Withdraw Modal */}
      <AnimatePresence>
        {selectedVault && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVault(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md"
            >
              {(() => {
                const vault = VAULTS.find(v => v.id === selectedVault);
                if (!vault) return null;

                return (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${vault.iconBg} flex items-center justify-center text-white text-xl font-bold`}>
                          {vault.icon}
                        </div>
                        <div>
                          <h3 className="text-zinc-100">{actionMode === 'deposit' ? 'Deposit' : 'Withdraw'}</h3>
                          <p className="text-zinc-500 text-sm">{vault.name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedVault(null)}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center gap-2 mb-6">
                      <button
                        onClick={() => setActionMode('deposit')}
                        className={`flex-1 py-2 rounded-lg transition-colors ${
                          actionMode === 'deposit'
                            ? 'bg-zinc-100 text-zinc-950'
                            : 'bg-zinc-800/50 text-zinc-400'
                        }`}
                      >
                        Deposit
                      </button>
                      <button
                        onClick={() => setActionMode('withdraw')}
                        className={`flex-1 py-2 rounded-lg transition-colors ${
                          actionMode === 'withdraw'
                            ? 'bg-zinc-100 text-zinc-950'
                            : 'bg-zinc-800/50 text-zinc-400'
                        }`}
                      >
                        Withdraw
                      </button>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-500 text-sm">Amount</span>
                        <span className="text-zinc-500 text-sm">
                          Balance: {actionMode === 'deposit' ? '5.2 ' + vault.asset : vault.userDeposit}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                        <input
                          type="text"
                          value={depositAmount}
                          onChange={(e) => {
                            if (/^\d*\.?\d*$/.test(e.target.value)) {
                              setDepositAmount(e.target.value);
                            }
                          }}
                          placeholder="0.0"
                          className="flex-1 bg-transparent text-zinc-100 text-xl outline-none placeholder:text-zinc-600"
                        />
                        <button
                          onClick={() => setDepositAmount(actionMode === 'deposit' ? '5.2' : vault.userDeposit.split(' ')[0])}
                          className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300 text-sm"
                        >
                          MAX
                        </button>
                        <span className="text-zinc-400">{vault.asset}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-zinc-800/30 rounded-lg mb-6 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">You receive</span>
                        <span className="text-zinc-100">
                          {depositAmount || '0'} {actionMode === 'deposit' ? vault.wToken : vault.asset}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Current APR</span>
                        <span className="text-emerald-400">{vault.apr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Zero IL Protection</span>
                        <span className="text-zinc-100 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-emerald-400" />
                          Active
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleDeposit}
                      disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                      className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                    >
                      {actionMode === 'deposit' ? `Deposit ${vault.asset}` : `Withdraw ${vault.asset}`}
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


"use client";

import { Wallet, Settings, ChevronDown, Moon, Filter } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import WagmiLogo from '../icons/WagmiLogo';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useSettings } from '@/contexts/SettingsContext';

// Portal component for rendering content at document body level
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}

interface HeaderProps {
  onNavigate: (page: 'swap' | 'liquidity' | 'dashboard' | 'gmi' | 'transfer' | 'usdw') => void;
  currentPage: 'swap' | 'liquidity' | 'dashboard' | 'gmi' | 'transfer' | 'usdw';
}

// Toggle Switch Component
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-zinc-100' : 'bg-zinc-700'
      }`}
    >
      <motion.div
        initial={false}
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-4 h-4 rounded-full ${
          enabled ? 'bg-zinc-900' : 'bg-zinc-400'
        }`}
      />
    </button>
  );
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tradeButtonRect, setTradeButtonRect] = useState<DOMRect | null>(null);
  const [settingsButtonRect, setSettingsButtonRect] = useState<DOMRect | null>(null);
  const tradeButtonRef = useRef<HTMLButtonElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const { darkTheme, setDarkTheme, iconsFilter, setIconsFilter } = useSettings();
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleTradeClick = () => {
    if (tradeButtonRef.current) {
      setTradeButtonRect(tradeButtonRef.current.getBoundingClientRect());
    }
    setIsTradeOpen(!isTradeOpen);
  };

  const handleSettingsClick = () => {
    if (settingsButtonRef.current) {
      setSettingsButtonRect(settingsButtonRef.current.getBoundingClientRect());
    }
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleConnect = () => {
    const injectedConnector = connectors.find(c => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  return (
    <header className="relative z-[100] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="w-8 h-8">
            <WagmiLogo />
          </div>

          <nav className="flex items-center gap-6">
            <div className="relative">
              <button
                ref={tradeButtonRef}
                onClick={handleTradeClick}
                className="flex items-center gap-2 text-zinc-100 hover:text-white transition-colors"
              >
                Trade
                <ChevronDown className={`w-4 h-4 transition-transform ${isTradeOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isTradeOpen && tradeButtonRect && (
                  <Portal>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-[9998]" 
                      onClick={() => setIsTradeOpen(false)}
                    />
                    {/* Dropdown */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        position: 'fixed',
                        top: tradeButtonRect.bottom + 8,
                        left: tradeButtonRect.left,
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl z-[9999] min-w-[160px]"
                    >
                      <button
                        onClick={() => {
                          setIsTradeOpen(false);
                          onNavigate('swap');
                        }}
                        className="w-full px-4 py-3 text-left text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        Swap
                      </button>
                      <button
                        onClick={() => {
                          setIsTradeOpen(false);
                          onNavigate('liquidity');
                        }}
                        className="w-full px-4 py-3 text-left text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        Leverage
                      </button>
                      <button
                        onClick={() => {
                          setIsTradeOpen(false);
                          onNavigate('transfer');
                        }}
                        className="w-full px-4 py-3 text-left text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        Transfer
                      </button>
                    </motion.div>
                  </Portal>
                )}
              </AnimatePresence>
            </div>

            <button
              className={`transition-colors ${currentPage === 'usdw' ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
              onClick={() => onNavigate('usdw')}
            >
              MagicPool
            </button>
            <button
              className={`transition-colors ${currentPage === 'gmi' ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
              onClick={() => onNavigate('gmi')}
            >
              GMI
            </button>
            <button
              className={`transition-colors ${currentPage === 'liquidity' ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
              onClick={() => onNavigate('liquidity')}
            >
              Liquidity
            </button>
            <button
              className={`transition-colors ${currentPage === 'dashboard' ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Settings Dropdown */}
          <div className="relative">
            <button 
              ref={settingsButtonRef}
              onClick={handleSettingsClick}
              className={`p-2 rounded-lg transition-colors ${isSettingsOpen ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
            >
              <Settings className={`w-5 h-5 transition-colors ${isSettingsOpen ? 'text-zinc-100' : 'text-zinc-400'}`} />
            </button>

            <AnimatePresence>
              {isSettingsOpen && settingsButtonRect && (
                <Portal>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-[9998]" 
                    onClick={() => setIsSettingsOpen(false)}
                  />
                  {/* Dropdown */}
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'fixed',
                      top: settingsButtonRect.bottom + 8,
                      right: window.innerWidth - settingsButtonRect.right,
                    }}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-[9999] min-w-[200px]"
                  >
                    <div className="p-2">
                      <div className="px-3 py-1 mb-2">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Settings</span>
                      </div>
                      
                      {/* Dark Theme Toggle */}
                      <div className="flex items-center justify-between px-3 py-2.5 hover:bg-zinc-800/50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <Moon className="w-4 h-4 text-zinc-400" />
                          <span className="text-zinc-300">Dark Theme</span>
                        </div>
                        <Toggle enabled={darkTheme} onChange={setDarkTheme} />
                      </div>

                      {/* Icons Filter Toggle */}
                      <div className="flex items-center justify-between px-3 py-2.5 hover:bg-zinc-800/50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <Filter className="w-4 h-4 text-zinc-400" />
                          <span className="text-zinc-300">Icons filter</span>
                        </div>
                        <Toggle enabled={iconsFilter} onChange={setIconsFilter} />
                      </div>
                    </div>
                  </motion.div>
                </Portal>
              )}
            </AnimatePresence>
          </div>
          {isConnected ? (
            <button 
              onClick={() => disconnect()}
              className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 transition-all flex items-center gap-2 rounded-lg"
            >
              <Wallet className="w-4 h-4" />
              <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </button>
          ) : (
            <button 
              onClick={handleConnect}
              className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 transition-all flex items-center gap-2 rounded-lg"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}


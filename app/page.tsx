"use client";

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Header, 
  SwapCard, 
  PriceChart, 
  LiquidityPage, 
  GMIPage, 
  DashboardPage,
  TransferPage,
  USDWPage,
  DustTransition
} from '@/components/design';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'swap' | 'liquidity' | 'dashboard' | 'gmi' | 'transfer' | 'usdw'>('swap');
  const [showDust, setShowDust] = useState(false);
  const isFirstRender = useRef(true);
  
  // Track selected tokens for the price chart
  const [chartTokens, setChartTokens] = useState({ from: 'WETH', to: 'USDC' });
  
  // Memoize the callback to prevent infinite loops
  const handleTokensChange = useCallback((from: string, to: string) => {
    setChartTokens({ from, to });
  }, []);

  const handleNavigate = (page: typeof currentPage) => {
    if (page === currentPage) return;
    
    // Skip animation on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setCurrentPage(page);
      return;
    }
    
    // Switch to new page immediately, then show dust dissolve to reveal it
    setCurrentPage(page);
    setShowDust(true);
  };

  const handleDustComplete = () => {
    setShowDust(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* Dust transition overlay */}
      <DustTransition 
        isActive={showDust} 
        onComplete={handleDustComplete}
        duration={400}
      />
      
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      
      <main className="flex-1 px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {currentPage === 'swap' ? (
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 items-start">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <SwapCard 
                      onTokensChange={handleTokensChange}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <PriceChart 
                      token0Symbol={chartTokens.from}
                      token1Symbol={chartTokens.to}
                      chainId={146}
                    />
                  </motion.div>
                </div>
              </div>
            ) : currentPage === 'liquidity' ? (
              <LiquidityPage />
            ) : currentPage === 'dashboard' ? (
              <DashboardPage />
            ) : currentPage === 'transfer' ? (
              <TransferPage />
            ) : currentPage === 'usdw' ? (
              <USDWPage />
            ) : (
              <GMIPage />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

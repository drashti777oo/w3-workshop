'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { arbitrumSepolia } from 'viem/chains';
import { AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const ARBITRUM_SEPOLIA_ID = 421614; // Arbitrum Sepolia chain ID

export function WalletStatus() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const [isAutoSwitchActive, setIsAutoSwitchActive] = useState(false);

  if (!isConnected || !address) {
    return (
      <div className="text-xs text-forge-muted">
        Connect wallet to view status and balance
      </div>
    );
  }

  const isArbitrumSepolia = chain?.id === ARBITRUM_SEPOLIA_ID;
  const showNetworkWarning = !isArbitrumSepolia;

  const handleAutoSwitch = async () => {
    setIsAutoSwitchActive(true);
    try {
      switchChain({ chainId: ARBITRUM_SEPOLIA_ID });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
    setIsAutoSwitchActive(false);
  };

  return (
    <div className="space-y-2">
      {/* Wallet Address & Network Status */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
        isArbitrumSepolia
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-amber-500/40 bg-amber-500/5'
      }`}>
        <div className="flex items-center gap-2">
          {isArbitrumSepolia ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          )}
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] text-forge-muted">
              {isArbitrumSepolia ? 'Connected' : 'Wrong Network'}
            </p>
            <div className="flex items-center gap-2">
              <code className={`text-[9px] font-mono font-semibold ${
                isArbitrumSepolia ? 'text-emerald-300' : 'text-amber-300'
              }`}>
                {address.slice(0, 6)}...{address.slice(-4)}
              </code>
              <span className={`text-[8px] px-2 py-0.5 rounded-full ${
                isArbitrumSepolia
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {chain?.name || 'Unknown Network'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Mismatch Warning & Auto-Switch */}
      {showNetworkWarning && (
        <div className="p-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[10px] font-medium text-amber-300">Wrong Network Detected</p>
              <p className="text-[9px] text-amber-200/80 mt-0.5">
                This app works on Arbitrum Sepolia. Switch to continue with contract operations.
              </p>
            </div>
          </div>
          <button
            onClick={handleAutoSwitch}
            disabled={isPending || isAutoSwitchActive}
            className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-[10px] font-medium transition-colors"
          >
            {isPending || isAutoSwitchActive ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Switching...
              </>
            ) : (
              <>
                <ArrowRight className="w-3 h-3" />
                Switch to Arbitrum Sepolia
              </>
            )}
          </button>
        </div>
      )}

      {/* Success State */}
      {isArbitrumSepolia && (
        <div className="text-[10px] text-emerald-300/70 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Ready for NFT operations
        </div>
      )}
    </div>
  );
}

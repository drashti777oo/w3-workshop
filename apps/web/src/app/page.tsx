"use client";

import { Suspense } from 'react';
import { WalletButton } from '@/components/wallet-button';
import { WalletStatus } from '@/components/wallet-status';
import dynamic from 'next/dynamic';
import { Blocks, ShieldCheck, Sparkles, Rocket, AlertCircle } from 'lucide-react';

// Lazy load the heavy ERC721 component
const ERC721InteractionPanel = dynamic(
  () => import('@/lib/erc721-stylus/src/ERC721InteractionPanel').then(mod => ({ default: mod.ERC721InteractionPanel })),
  {
    loading: () => (
      <div className="w-full rounded-2xl border border-forge-border/60 bg-forge-surface/60 p-8">
        <div className="h-4 w-36 rounded bg-forge-border/60 animate-pulse mb-4" />
        <div className="space-y-3">
          <div className="h-10 rounded bg-forge-border/40 animate-pulse" />
          <div className="h-10 rounded bg-forge-border/40 animate-pulse" />
          <div className="h-24 rounded bg-forge-border/30 animate-pulse" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function Home() {
  const featureCards = [
    {
      icon: Blocks,
      title: 'Stylus Ready',
      description: 'Interact with your Rust-powered ERC-721 contract from a single control surface.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Workflow',
      description: 'Wallet-driven writes, explicit network switching, and clear transaction state handling.',
    },
    {
      icon: Rocket,
      title: 'Ship Faster',
      description: 'From mint to transfer to approvals, every core NFT action is productized and testable.',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-forge-bg text-forge-text">
      <div className="pointer-events-none absolute -top-40 -left-24 h-96 w-96 rounded-full bg-accent-cyan/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent-magenta/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.08),transparent_45%),radial-gradient(circle_at_bottom,_rgba(0,212,255,0.06),transparent_45%)]" />

      {/* MetaMask Not Installed Banner */}
      {typeof window !== 'undefined' && !window.ethereum && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/20 border-b border-amber-500/40 p-3">
          <div className="mx-auto max-w-7xl px-5 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-amber-300 flex-shrink-0" />
            <p className="text-sm text-amber-200">
              MetaMask not detected. Please <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-amber-100">install MetaMask</a> to use this app.
            </p>
          </div>
        </div>
      )}

      <div className="relative mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-violet-300" />
              <span className="text-xs font-medium text-violet-200">Arbitrum Stylus NFT Console</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Professional NFT Operations
                <span className="block bg-gradient-to-r from-accent-cyan via-violet-300 to-accent-magenta bg-clip-text text-transparent">
                  Without Leaving Your App
                </span>
              </h1>
              <p className="max-w-2xl text-sm sm:text-base text-forge-muted leading-relaxed">
                Connect your wallet, manage your Stylus ERC-721 collection, and run mint/transfer/approval flows in a polished production-style interface designed for workshops and real demos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-2 flex-1 min-w-fit">
                <WalletButton />
                <WalletStatus />
              </div>
              <span className="text-xs text-forge-muted">Supports Arbitrum, Sepolia, and custom networks</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-forge-border/60 bg-forge-surface/70 p-3">
                <p className="text-lg font-semibold text-white">Live</p>
                <p className="text-[11px] text-forge-muted">Wallet and chain status</p>
              </div>
              <div className="rounded-xl border border-forge-border/60 bg-forge-surface/70 p-3">
                <p className="text-lg font-semibold text-white">ERC-721</p>
                <p className="text-[11px] text-forge-muted">Mint, transfer, approve, burn</p>
              </div>
              <div className="rounded-xl border border-forge-border/60 bg-forge-surface/70 p-3">
                <p className="text-lg font-semibold text-white">UI Pro</p>
                <p className="text-[11px] text-forge-muted">Gallery, motion, and feedback states</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-forge-border/60 bg-forge-surface/80 p-3 shadow-[0_20px_80px_-30px_rgba(0,212,255,0.25)] backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between rounded-xl border border-forge-border/50 bg-forge-bg/70 px-3 py-2">
                <p className="text-xs text-forge-muted">Live Contract Console</p>
                <p className="text-[10px] text-violet-300">W3 APP</p>
              </div>
              <Suspense fallback={<div className="w-full p-8 text-center text-forge-muted text-sm">Loading NFT panel...</div>}>
                <ERC721InteractionPanel />
              </Suspense>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="group rounded-2xl border border-forge-border/50 bg-forge-surface/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-[0_18px_45px_-30px_rgba(139,92,246,0.75)]"
              >
                <div className="mb-3 inline-flex rounded-lg border border-violet-400/30 bg-violet-400/10 p-2">
                  <Icon className="h-4 w-4 text-violet-300" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{card.title}</h3>
                <p className="text-sm text-forge-muted leading-relaxed">{card.description}</p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

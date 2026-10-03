'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Globe2,
  LineChart,
  Sparkles,
  BarChart3,
  Search,
  Zap,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
} from 'lucide-react';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  // Target URL for primary dashboard action buttons
  const authTargetUrl = isSignedIn ? '/dashboard' : '/sign-up';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-300">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[140px] transition-all duration-700" />
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] transition-all duration-700" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between px-6 lg:px-12 border-b border-slate-200/80 dark:border-slate-800/60 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <Globe2 className="h-5 w-5 animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Verdantos</span>
            <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              ESG Engine
            </span>
          </div>
        </div>

        {/* Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a href="#about" className="hover:text-emerald-500 transition-colors">About</a>
          <a href="#problem" className="hover:text-emerald-500 transition-colors">Problem & Solution</a>
          <a href="#how-it-works" className="hover:text-emerald-500 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-emerald-500 transition-colors">Features</a>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 px-4 py-2 rounded-lg transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30"
            >
              Dashboard 
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center flex-1 flex flex-col items-center justify-center">
        
        {/* Animated Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-8 shadow-sm hover:scale-105 transition-all duration-300 cursor-default">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
          <span>Next-Gen Enterprise ESG & Carbon Mitigation Platform</span>
        </div>

        {/* Hero Title (Original size maintained: text-4xl sm:text-6xl) */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl transition-colors duration-300">
          Automate Scope 3 Compliance with{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
            AI-Driven Telemetry
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed transition-colors duration-300">
          Real-time supply chain monitoring, automated risk auditing, and instant AI mitigation advice—built for enterprise sustainability leaders.
        </p>

        {/* Action Buttons: Routes directly to /sign-up when unauthenticated */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
          <Link
            href={authTargetUrl}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-slate-950 bg-emerald-400 hover:bg-emerald-300 font-semibold text-base transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95"
          >
            {isSignedIn ? 'Open Control Dashboard' : 'Launch Platform Demo'}
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
          <a
            href="#about"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 font-semibold text-base transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
          >
            Explore Features
          </a>
        </div>

        {/* ================= ABOUT SECTION ================= */}
        <section id="about" className="mt-32 pt-12 text-left w-full border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              About Verdantos Engine
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Smarter Carbon Auditing for Global Logistics
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              Verdantos is an AI-powered Enterprise ESG (Environmental, Social, and Governance) intelligence engine designed to give sustainability officers and supply chain managers full visibility over Scope 3 emissions.
            </p>
          </div>
        </section>

        {/* ================= THE PROBLEM & SOLUTION ================= */}
        <section id="problem" className="mt-20 text-left w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* The Problem Card */}
            <div className="p-8 rounded-3xl bg-rose-500/5 border border-rose-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4 text-rose-600 dark:text-rose-400 font-bold text-lg">
                <TrendingDown className="h-6 w-6" />
                <h3>The Challenge</h3>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Scope 3 Blindspots:</strong> Over 80% of supply chain carbon emissions occur deep within multi-tier logistics suppliers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Manual Spreadsheet Auditing:</strong> Legacy ESG tracking relies on stale quarter-end Excel reports instead of real-time telemetry.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Regulatory Fines:</strong> Strict global standards (e.g., EU CSRD) penalize inaccurate ESG disclosures.</span>
                </li>
              </ul>
            </div>

            {/* The Solution Card */}
            <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                <CheckCircle2 className="h-6 w-6" />
                <h3>The Verdantos Solution</h3>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Automated Telemetry:</strong> Live tracking of shipments across Air, Ocean, Rail, and Trucking routes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Google Gemini AI:</strong> Instant automated suggestions to reroute or re-mode shipments to lower carbon impact.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Audit Trail Compliance:</strong> Continuous ledger of all ESG risk alerts, variances, and operational interventions.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ================= HOW TO USE IT ================= */}
        <section id="how-it-works" className="mt-24 text-left w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How It Works in 3 Simple Steps</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">Get real-time carbon intelligence in under 2 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-lg mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Connect Telemetry</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Log into the Control Dashboard to view active global shipment telemetry across your entire logistics grid.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-bold text-lg mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Generate AI Advice</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Click on any high-risk shipment route to trigger Gemini AI analysis for instant carbon reduction suggestions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500 font-bold text-lg mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Export Audit Logs</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Log interventions, approve recommendations, and export compliance audit reports directly for executive review.
              </p>
            </div>

          </div>
        </section>

        {/* ================= FEATURES GRID ================= */}
        <section id="features" className="mt-28 text-left w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-6 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 border border-emerald-500/20">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Mitigation Engine</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Powered by Google Gemini to analyze route anomalies, predict emission spikes, and suggest green logistics options.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-11 w-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4 border border-cyan-500/20">
                <LineChart className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Telemetry & Auditing</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Track global shipments, cold-chain sensor status, and supplier risk scores in a centralized control room.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-11 w-11 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 border border-teal-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Audit Trail Logging</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Immutable logging for compliance variances, manual escalations, and automated verification events.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <div className="mt-28 w-full p-10 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 text-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Ready to automate your ESG compliance?</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">Join enterprise leaders deploying next-gen carbon mitigation today.</p>
          <div className="mt-6">
            <Link
              href={authTargetUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold transition-all shadow-md active:scale-95"
            >
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-900 py-8 text-center text-xs text-slate-500 transition-colors duration-300">
        <p>© {new Date().getFullYear()} VerdantOS ESG Engine. An Enterprise SaaS Platform.</p>
      </footer>
    </div>
  );
}
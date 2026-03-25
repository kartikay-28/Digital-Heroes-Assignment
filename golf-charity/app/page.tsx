import Link from "next/link";
import { ArrowRight, Gift, Trophy, Heart, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-lime-400 selection:text-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-cabinet font-bold text-xl tracking-tight">
            Golf<span className="text-lime-400">Gives</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="/charities" className="hover:text-white transition-colors">Charities</Link>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white flex items-center px-4">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-bold bg-white text-zinc-950 px-5 py-2 rounded-full hover:bg-zinc-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            Monthly draws are live
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-cabinet tracking-tight text-white leading-[1.1]">
            Play with purpose.<br />
            <span className="text-zinc-500">Win with impact.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Transform your golf scores into charitable donations and monthly prize draws. The modern platform for purpose-driven players.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              href="/signup" 
              className="group px-8 py-4 bg-lime-400 text-zinc-950 font-bold rounded-2xl hover:bg-lime-500 transition-all flex items-center gap-2 text-lg w-full sm:w-auto"
            >
              Start Playing
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link 
              href="#how-it-works" 
              className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-colors w-full sm:w-auto text-lg"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="border-y border-zinc-800/50 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-zinc-800/50">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">£45k+</div>
            <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Prizes Won</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">£12k+</div>
            <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Charity Impact</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">2.4k</div>
            <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">100%</div>
            <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Verified Draws</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-cabinet mb-4">The Mechanics</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">A seamless blend of performance tracking, prize draws, and charitable giving.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
              <div className="w-12 h-12 bg-lime-400/10 text-lime-400 rounded-xl flex items-center justify-center mb-6">
                <Trophy size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. Track Your Scores</h3>
              <p className="text-zinc-400 leading-relaxed">
                Log your Stableford scores directly in our modern dashboard. We keep your last 5 rolling scores to generate your unique monthly draw numbers.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 translate-y-0 md:translate-y-8">
              <div className="w-12 h-12 bg-lime-400/10 text-lime-400 rounded-xl flex items-center justify-center mb-6">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. Back a Cause</h3>
              <p className="text-zinc-400 leading-relaxed">
                Choose a charity to support. A minimum of 10% of your subscription goes directly to them. Want to give more? You control your impact slider.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
              <div className="w-12 h-12 bg-lime-400/10 text-lime-400 rounded-xl flex items-center justify-center mb-6">
                <Gift size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Win Monthy Pools</h3>
              <p className="text-zinc-400 leading-relaxed">
                Your scores convert to tickets for our monthly draw. Match 3, 4, or 5 numbers to win cash prizes. The 5-number jackpot rolls over if untouched.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription CTA */}
      <section className="py-24 px-4 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[200px] bg-lime-400/20 blur-[100px] rounded-full pointer-events-none"></div>
          <Shield className="mx-auto text-lime-400 mb-6" size={48} />
          <h2 className="text-3xl md:text-5xl font-bold font-cabinet mb-6 text-white relative z-10">
            Ready to make your rounds count?
          </h2>
          <p className="text-xl text-zinc-400 mb-10 relative z-10">
            Join the platform where every game played is a step towards positive change. Subscriptions start at £9.99/mo.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-950 font-bold rounded-2xl hover:bg-zinc-200 transition-all text-lg relative z-10"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-800/50 text-center text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-cabinet font-bold text-lg text-white">
            Golf<span className="text-lime-400">Gives</span>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} GolfGives Platform. For selection process only.
          </div>
        </div>
      </footer>
    </div>
  );
}

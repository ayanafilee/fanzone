import Link from 'next/link';
import { ArrowRight, Smartphone, Globe, Bell, Heart, TrendingUp, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
              <span className="text-2xl font-bold text-white">FanZone</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
              <a href="#download" className="text-slate-300 hover:text-white transition">Download</a>
              <a href="#about" className="text-slate-300 hover:text-white transition">About</a>
            </div>
            <Link href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Your Ultimate
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"> Football </span>
            Companion
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Stay connected with your favorite clubs, leagues, and matches. Get real-time updates, highlights, and news in your language.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#download" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
              Download App <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#features" className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-semibold transition">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Everything You Need to Stay in the Game
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="Multi-Language Support"
              description="Access content in English, Amharic, and Oromo. Your language, your choice."
            />
            <FeatureCard
              icon={<Bell className="w-8 h-8" />}
              title="Real-Time Notifications"
              description="Never miss a moment with instant push notifications for your favorite clubs."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Live Highlights"
              description="Watch match highlights and key moments from all major leagues."
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="React & Engage"
              description="Express your emotions with reactions - like, love, wow, sad, or angry."
            />
            <FeatureCard
              icon={<Smartphone className="w-8 h-8" />}
              title="Mobile First"
              description="Beautiful, fast, and intuitive mobile experience built with Flutter."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Anonymous Reactions"
              description="Engage with content freely without authentication requirements."
            />
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Get Started Today
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Download FanZone and join thousands of fans staying connected to the beautiful game.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="#" className="bg-black hover:bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              App Store
            </a>
            <a href="#" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              Google Play
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Built for Fans, By Fans
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            FanZone brings together football enthusiasts from across the globe. Follow your favorite clubs, 
            stay updated with the latest news, watch highlights, and engage with a passionate community.
          </p>
          <p className="text-lg text-slate-300">
            With support for multiple languages and leagues, FanZone ensures you never miss a beat 
            in the world of football.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                <span className="text-xl font-bold text-white">FanZone</span>
              </div>
              <p className="text-slate-400">Your ultimate football companion</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#download" className="hover:text-white transition">Download</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#about" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>&copy; 2026 FanZone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition">
      <div className="text-blue-500 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

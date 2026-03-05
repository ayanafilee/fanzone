'use client';

import { motion } from 'framer-motion';
import { 
  ArrowRight, Smartphone, Globe, Bell, Heart, TrendingUp, Shield,
  Users, Zap, Star, Trophy, Play, ChevronRight, Check, 
  MessageSquare, Video, Newspaper, Calendar, Target,
  Sparkles, Rocket, Lock, Clock, Download, Menu, X,
  Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone
} from 'lucide-react';
import { useState } from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import StatsCounter from '@/components/StatsCounter';
import { colors, gradients, styles, getGradientTextStyle } from '@/lib/styles';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: gradients.background }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-float" style={styles.floatingOrb(0.1)}></div>
        <div className="absolute top-40 right-20 w-96 h-96 rounded-full blur-3xl animate-float-delayed" style={{ backgroundColor: `rgba(74, 139, 111, 0.1)` }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl animate-float" style={{ backgroundColor: `rgba(184, 217, 110, 0.1)` }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full glass-effect z-50" style={{ borderBottom: `1px solid ${colors.accentGreen}80` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 rounded-xl animate-gradient" style={{ background: gradients.card }}></div>
              <span className="text-2xl font-bold" style={getGradientTextStyle()}>FanZone</span>
            </motion.div>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How It Works</a>
              <a href="#leagues" className="text-slate-300 hover:text-white transition-colors">Leagues</a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">Testimonials</a>
              <a href="#faq" className="text-slate-300 hover:text-white transition-colors">FAQ</a>
            </div>

            <div className="flex items-center gap-4">
              <a href="#download" className="hidden sm:block text-white px-6 py-2.5 rounded-lg font-semibold transition-all hover:scale-105" style={{ background: gradients.button }}>
                Get Started
              </a>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-white p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="lg:hidden py-4 space-y-4"
            >
              <a href="#features" className="block text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="block text-slate-300 hover:text-white transition-colors">How It Works</a>
              <a href="#leagues" className="block text-slate-300 hover:text-white transition-colors">Leagues</a>
              <a href="#testimonials" className="block text-slate-300 hover:text-white transition-colors">Testimonials</a>
              <a href="#faq" className="block text-slate-300 hover:text-white transition-colors">FAQ</a>
              <a href="#download" className="block text-white px-6 py-2.5 rounded-lg font-semibold text-center" style={{ background: gradients.button }}>
                Get Started
              </a>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6" style={styles.badge}>
                  <Sparkles className="w-4 h-4" style={{ color: colors.limeGreen }} />
                  <span className="text-sm" style={{ color: colors.limeGreen }}>The Future of Football Engagement</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Your Ultimate
                  <span className="block animate-gradient" style={getGradientTextStyle(gradients.textLong)}> Football Companion</span>
                </h1>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  Stay connected with your favorite clubs, leagues, and matches. Get real-time updates, 
                  highlights, and news in your language. Join millions of passionate fans worldwide.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#download" className="group text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg" style={{ background: gradients.button, boxShadow: `0 10px 25px ${colors.accentGreen}40` }}>
                    Download Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="#features" className="group glass-effect text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2">
                    Explore Features <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Hero Image/Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative w-full h-[600px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-[#2D5F4C]/20 to-[#B8D96E]/20 rounded-3xl blur-3xl"></div>
                <div className="relative grid grid-cols-2 gap-4 p-8">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="glass-effect p-6 rounded-2xl"
                  >
                    <Trophy className="w-12 h-12 text-yellow-400 mb-3" />
                    <h3 className="text-white font-bold mb-1">Live Scores</h3>
                    <p className="text-slate-400 text-sm">Real-time updates</p>
                  </motion.div>
                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    className="glass-effect p-6 rounded-2xl"
                  >
                    <Video className="w-12 h-12 text-red-400 mb-3" />
                    <h3 className="text-white font-bold mb-1">Highlights</h3>
                    <p className="text-slate-400 text-sm">Best moments</p>
                  </motion.div>
                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="glass-effect p-6 rounded-2xl"
                  >
                    <Newspaper className="w-12 h-12 text-blue-400 mb-3" />
                    <h3 className="text-white font-bold mb-1">News</h3>
                    <p className="text-slate-400 text-sm">Latest updates</p>
                  </motion.div>
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                    className="glass-effect p-6 rounded-2xl"
                  >
                    <Bell className="w-12 h-12 text-green-400 mb-3" />
                    <h3 className="text-white font-bold mb-1">Alerts</h3>
                    <p className="text-slate-400 text-sm">Never miss out</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedSection className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-[#4A8B6F] to-[#B8D96E] bg-clip-text text-transparent mb-2">
                <StatsCounter end={500} suffix="K+" />
              </div>
              <p className="text-slate-400">Active Users</p>
            </AnimatedSection>
            <AnimatedSection delay={0.1} className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-[#B8D96E] to-[#4A8B6F] bg-clip-text text-transparent mb-2">
                <StatsCounter end={150} suffix="+" />
              </div>
              <p className="text-slate-400">Football Clubs</p>
            </AnimatedSection>
            <AnimatedSection delay={0.2} className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-[#2D5F4C] to-[#B8D96E] bg-clip-text text-transparent mb-2">
                <StatsCounter end={25} suffix="+" />
              </div>
              <p className="text-slate-400">Leagues Covered</p>
            </AnimatedSection>
            <AnimatedSection delay={0.3} className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-[#B8D96E] to-[#2D5F4C] bg-clip-text text-transparent mb-2">
                <StatsCounter end={1000} suffix="+" />
              </div>
              <p className="text-slate-400">Daily Updates</p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-[#2D5F4C]/20 border border-[#4A8B6F]/30 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-[#B8D96E]" />
              <span className="text-sm text-[#B8D96E]">Powerful Features</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Everything You Need to Stay in the Game
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Comprehensive features designed to enhance your football experience and keep you connected with the sport you love.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="w-10 h-10" />}
              title="Multi-Language Support"
              description="Access content in English, Amharic, and Oromo. Your language, your choice. Breaking language barriers for all fans."
              gradient="from-[#2D5F4C] to-[#4A8B6F]"
            />
            <FeatureCard
              icon={<Bell className="w-10 h-10" />}
              title="Real-Time Notifications"
              description="Never miss a moment with instant push notifications for your favorite clubs, matches, and breaking news."
              gradient="from-[#4A8B6F] to-[#B8D96E]"
            />
            <FeatureCard
              icon={<Video className="w-10 h-10" />}
              title="Match Highlights"
              description="Watch match highlights and key moments from all major leagues. Relive the best goals and saves."
              gradient="from-[#B8D96E] to-[#4A8B6F]"
            />
            <FeatureCard
              icon={<Heart className="w-10 h-10" />}
              title="React & Engage"
              description="Express your emotions with reactions - like, love, wow, sad, or angry. Join the conversation."
              gradient="from-[#2D5F4C] to-[#B8D96E]"
            />
            <FeatureCard
              icon={<Smartphone className="w-10 h-10" />}
              title="Mobile First Design"
              description="Beautiful, fast, and intuitive mobile experience built with Flutter. Optimized for all devices."
              gradient="from-[#4A8B6F] to-[#2D5F4C]"
            />
            <FeatureCard
              icon={<Shield className="w-10 h-10" />}
              title="Privacy Focused"
              description="Engage with content freely with anonymous reactions. Your privacy is our priority."
              gradient="from-[#B8D96E] to-[#2D5F4C]"
            />
            <FeatureCard
              icon={<Newspaper className="w-10 h-10" />}
              title="Latest News"
              description="Stay updated with breaking news, transfer rumors, and exclusive interviews from the football world."
              gradient="from-[#2D5F4C] to-[#4A8B6F]"
            />
            <FeatureCard
              icon={<Trophy className="w-10 h-10" />}
              title="League Tables"
              description="Track standings, fixtures, and results from your favorite leagues in real-time."
              gradient="from-[#4A8B6F] to-[#B8D96E]"
            />
            <FeatureCard
              icon={<Users className="w-10 h-10" />}
              title="Community Driven"
              description="Join a passionate community of football fans from around the world. Share your passion."
              gradient="from-[#B8D96E] to-[#4A8B6F]"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-4 relative bg-[#1A3A2E]/30">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-[#2D5F4C]/20 border border-[#4A8B6F]/30 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-[#B8D96E]" />
              <span className="text-sm text-[#B8D96E]">Simple Process</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Follow these simple steps to join the ultimate football community
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#2D5F4C] via-[#4A8B6F] to-[#B8D96E] -translate-y-1/2"></div>
            
            <StepCard
              number="01"
              title="Download the App"
              description="Get FanZone from App Store or Google Play. Quick and easy installation on any device."
              icon={<Download className="w-8 h-8" />}
            />
            <StepCard
              number="02"
              title="Choose Your Clubs"
              description="Select your favorite teams and leagues. Customize your feed to match your interests."
              icon={<Target className="w-8 h-8" />}
            />
            <StepCard
              number="03"
              title="Stay Connected"
              description="Receive updates, watch highlights, and engage with content. Never miss a moment."
              icon={<Rocket className="w-8 h-8" />}
            />
          </div>
        </div>
      </section>

      {/* Leagues Section */}
      <section id="leagues" className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-[#2D5F4C]/20 border border-[#4A8B6F]/30 rounded-full px-4 py-2 mb-6">
              <Trophy className="w-4 h-4 text-[#B8D96E]" />
              <span className="text-sm text-[#B8D96E]">Global Coverage</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Follow Your Favorite Leagues
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Comprehensive coverage of major football leagues from around the world
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <LeagueCard name="Premier League" country="England" />
            <LeagueCard name="La Liga" country="Spain" />
            <LeagueCard name="Serie A" country="Italy" />
            <LeagueCard name="Bundesliga" country="Germany" />
            <LeagueCard name="Ligue 1" country="France" />
            <LeagueCard name="Champions League" country="Europe" />
            <LeagueCard name="Europa League" country="Europe" />
            <LeagueCard name="MLS" country="USA" />
            <LeagueCard name="Saudi Pro League" country="Saudi Arabia" />
            <LeagueCard name="Ethiopian Premier" country="Ethiopia" />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 px-4 relative bg-[#1A3A2E]/30">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-[#2D5F4C]/20 border border-[#4A8B6F]/30 rounded-full px-4 py-2 mb-6">
              <MessageSquare className="w-4 h-4 text-[#B8D96E]" />
              <span className="text-sm text-[#B8D96E]">User Reviews</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Loved by Football Fans Worldwide
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              See what our community has to say about FanZone
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Ahmed Hassan"
              role="Manchester United Fan"
              content="FanZone has completely changed how I follow football. The multi-language support is perfect for me, and I never miss any updates about my favorite team!"
              rating={5}
            />
            <TestimonialCard
              name="Sarah Johnson"
              role="Barcelona Supporter"
              content="The highlights feature is amazing! I can catch up on all the action even when I miss the live matches. The app is fast and beautifully designed."
              rating={5}
            />
            <TestimonialCard
              name="Dawit Tesfaye"
              role="Football Enthusiast"
              content="Finally, an app that supports Amharic! I can read all the news in my language. The notifications keep me updated on everything happening in football."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-4 relative bg-[#1A3A2E]/30">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-[#2D5F4C]/20 border border-[#4A8B6F]/30 rounded-full px-4 py-2 mb-6">
              <MessageSquare className="w-4 h-4 text-[#B8D96E]" />
              <span className="text-sm text-[#B8D96E]">Got Questions?</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-400">
              Everything you need to know about FanZone
            </p>
          </AnimatedSection>

          <div className="space-y-6">
            <FAQItem
              question="Is FanZone really free?"
              answer="Yes! FanZone offers a completely free tier with access to all major features including news, highlights, and reactions. Premium plans are available for users who want an ad-free experience and additional features."
            />
            <FAQItem
              question="Which languages are supported?"
              answer="FanZone currently supports English, Amharic, and Oromo. We're constantly working to add more languages to serve our global community better."
            />
            <FAQItem
              question="Do I need to create an account?"
              answer="No account is required to browse content and react to posts. However, creating an account allows you to personalize your feed, save favorite clubs, and receive customized notifications."
            />
            <FAQItem
              question="Which leagues and clubs are covered?"
              answer="We cover all major leagues including Premier League, La Liga, Serie A, Bundesliga, Champions League, and many more. We also feature clubs from the Ethiopian Premier League and other regional competitions."
            />
            <FAQItem
              question="How often is content updated?"
              answer="Our content is updated in real-time. You'll receive instant notifications for breaking news, match results, and highlights as they happen."
            />
            <FAQItem
              question="Can I watch full matches?"
              answer="Currently, we provide match highlights and key moments. Full match streaming is available for Premium subscribers in select regions."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="relative gradient-border rounded-3xl p-12 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2D5F4C]/20 via-[#4A8B6F]/20 to-[#B8D96E]/20"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  Ready to Join the Action?
                </h2>
                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                  Download FanZone today and experience football like never before. Join millions of fans worldwide.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <a href="#" className="group bg-white hover:bg-slate-100 text-slate-900 px-10 py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-2xl">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-lg font-bold">App Store</div>
                    </div>
                  </a>
                  <a href="#" className="group bg-white hover:bg-slate-100 text-slate-900 px-10 py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-2xl">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-lg font-bold">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 relative bg-[#1A3A2E]/30">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center">
            <Mail className="w-16 h-16 text-[#B8D96E] mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Subscribe to our newsletter for the latest updates, features, and football news
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl bg-[#1A3A2E] border border-[#2D5F4C] text-white placeholder-slate-500 focus:outline-none focus:border-[#B8D96E] transition"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#2D5F4C] via-[#4A8B6F] to-[#B8D96E] hover:from-[#4A8B6F] hover:to-[#B8D96E] text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 border-t border-[#2D5F4C]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2D5F4C] via-[#4A8B6F] to-[#B8D96E] rounded-xl animate-gradient"></div>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#4A8B6F] to-[#B8D96E] bg-clip-text text-transparent">FanZone</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Your ultimate football companion. Stay connected with your favorite clubs, leagues, and matches. Join millions of passionate fans worldwide.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-[#1A3A2E] hover:bg-[#2D5F4C] flex items-center justify-center text-slate-400 hover:text-white transition">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-[#1A3A2E] hover:bg-[#2D5F4C] flex items-center justify-center text-slate-400 hover:text-white transition">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-[#1A3A2E] hover:bg-[#2D5F4C] flex items-center justify-center text-slate-400 hover:text-white transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-[#1A3A2E] hover:bg-[#2D5F4C] flex items-center justify-center text-slate-400 hover:text-white transition">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-400 hover:text-white transition">Features</a></li>
                <li><a href="#download" className="text-slate-400 hover:text-white transition">Download</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition">Updates</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Company</h3>
              <ul className="space-y-3">
                <li><a href="#about" className="text-slate-400 hover:text-white transition">About Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition">Press Kit</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Support</h3>
              <ul className="space-y-3">
                <li><a href="#faq" className="text-slate-400 hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition">Contact</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#2D5F4C]/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-center md:text-left">
                &copy; 2026 FanZone. All rights reserved. Made with ❤️ for football fans.
              </p>
              <div className="flex items-center gap-6 text-slate-400 text-sm">
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                <a href="#" className="hover:text-white transition">Terms of Service</a>
                <a href="#" className="hover:text-white transition">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-[#2D5F4C] via-[#4A8B6F] to-[#B8D96E] hover:from-[#4A8B6F] hover:to-[#B8D96E] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all z-40"
      >
        <ChevronRight className="w-6 h-6 -rotate-90" />
      </motion.button>
    </div>
  );
}

// Component Definitions

function FeatureCard({ icon, title, description, gradient }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}) {
  return (
    <AnimatedSection>
      <motion.div 
        whileHover={{ scale: 1.05, y: -5 }}
        className="glass-effect p-8 rounded-2xl h-full group cursor-pointer"
      >
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
          <div className="text-white">{icon}</div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </motion.div>
    </AnimatedSection>
  );
}

function StepCard({ number, title, description, icon }: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <AnimatedSection className="relative">
      <div className="glass-effect p-8 rounded-2xl text-center relative z-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2D5F4C] via-[#4A8B6F] to-[#B8D96E] flex items-center justify-center mx-auto mb-6 text-white">
          {icon}
        </div>
        <div className="text-6xl font-bold bg-gradient-to-r from-[#4A8B6F] to-[#B8D96E] bg-clip-text text-transparent mb-4">
          {number}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </AnimatedSection>
  );
}

function LeagueCard({ name, country }: { name: string; country: string }) {
  return (
    <AnimatedSection>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="glass-effect p-6 rounded-xl text-center cursor-pointer group"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2D5F4C] via-[#4A8B6F] to-[#B8D96E] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-white font-bold mb-1">{name}</h3>
        <p className="text-slate-400 text-sm">{country}</p>
      </motion.div>
    </AnimatedSection>
  );
}

function TestimonialCard({ name, role, content, rating }: {
  name: string;
  role: string;
  content: string;
  rating: number;
}) {
  return (
    <AnimatedSection>
      <div className="glass-effect p-8 rounded-2xl h-full">
        <div className="flex gap-1 mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-slate-300 mb-6 leading-relaxed italic">&quot;{content}&quot;</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D5F4C] via-[#4A8B6F] to-[#B8D96E] flex items-center justify-center text-white font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <h4 className="text-white font-bold">{name}</h4>
            <p className="text-slate-400 text-sm">{role}</p>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AnimatedSection>
      <div className="glass-effect rounded-xl overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-6 text-left flex justify-between items-center hover:bg-[#1A3A2E]/50 transition"
        >
          <span className="text-lg font-semibold text-white pr-8">{question}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight className="w-6 h-6 text-slate-400 rotate-90" />
          </motion.div>
        </button>
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <p className="px-6 pb-6 text-slate-400 leading-relaxed">{answer}</p>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}

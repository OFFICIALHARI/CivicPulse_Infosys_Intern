import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Zap, 
  Users, 
  BarChart3, 
  Shield,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Easy Issue Reporting",
      description: "Report grievances in seconds with photo evidence and location details"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Updates",
      description: "Track your complaint status in real-time from submission to resolution"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Transparent Process",
      description: "See which officer is handling your case and their professional actions"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Performance Tracking",
      description: "Rate officers and provide feedback to improve civic services"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI-Powered Support",
      description: "Smart categorization and auto-completion help you describe issues clearly"
    }
  ];

  const useCases = [
    {
      category: "Sanitation",
      issues: ["Garbage pile-up", "Drain blockage", "Waste collection delays"],
      emoji: "🗑️"
    },
    {
      category: "Infrastructure",
      issues: ["Pothole in roads", "Street light malfunction", "Water supply issues"],
      emoji: "🏗️"
    },
    {
      category: "Public Health",
      issues: ["Stray animals", "Pest control", "Unhygienic conditions"],
      emoji: "🏥"
    },
    {
      category: "Traffic",
      issues: ["Broken signals", "Parking violations", "Road congestion"],
      emoji: "🚦"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] via-[#1a1f3a] to-[#0a0f1e] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f1e]/90 backdrop-blur-md border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold">
              CP
            </div>
            <span className="font-bold text-lg">CivicPulse</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
            Empowering Citizens, Building Better Cities
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            CivicPulse bridges the gap between citizens and city administration. Report issues, track progress, and help shape your community in real-time.
          </p>
          
          <div className="flex gap-4 justify-center pt-8">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold flex items-center gap-2 transition transform hover:scale-105"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.scrollTo({ top: document.getElementById('features')?.offsetTop || 0, behavior: 'smooth' })}
              className="px-8 py-3 border border-blue-500 hover:bg-blue-500/10 rounded-lg font-semibold transition"
            >
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-12 max-w-2xl mx-auto">
            <div className="bg-blue-500/10 backdrop-blur border border-blue-500/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-cyan-400">10K+</div>
              <div className="text-gray-400">Issues Resolved</div>
            </div>
            <div className="bg-blue-500/10 backdrop-blur border border-blue-500/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-cyan-400">500+</div>
              <div className="text-gray-400">Active Officers</div>
            </div>
            <div className="bg-blue-500/10 backdrop-blur border border-blue-500/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-cyan-400">98%</div>
              <div className="text-gray-400">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-blue-500/20">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose CivicPulse?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-blue-500/5 backdrop-blur border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition"
            >
              <div className="text-cyan-400 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-blue-500/20">
        <h2 className="text-4xl font-bold text-center mb-16">What Can You Report?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur border border-blue-500/20 rounded-xl p-6"
            >
              <div className="text-5xl mb-4">{useCase.emoji}</div>
              <h3 className="text-xl font-semibold mb-4">{useCase.category}</h3>
              <ul className="space-y-2">
                {useCase.issues.map((issue, i) => (
                  <li key={i} className="text-gray-300 flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-blue-500/20">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: 1, title: "Report", desc: "Submit your issue with details and photos" },
            { step: 2, title: "Track", desc: "Monitor progress in real-time" },
            { step: 3, title: "Engage", desc: "Communicate with assigned officer" },
            { step: 4, title: "Rate", desc: "Share feedback and help improve service" }
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="bg-gradient-to-b from-blue-500/10 to-cyan-500/10 backdrop-blur border border-blue-500/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
              {index < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 text-cyan-400 transform -translate-y-1/2">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-blue-500/20">
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur border border-blue-500/40 rounded-xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens and officers already using CivicPulse to build better, cleaner, more responsive cities.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold flex items-center gap-2 transition transform hover:scale-105 mx-auto"
          >
            Get Started Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-500/20 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-gray-400 text-sm">
            <div>© 2024 CivicPulse. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-cyan-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-cyan-400 transition">Terms of Service</a>
              <a href="#" className="hover:text-cyan-400 transition">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

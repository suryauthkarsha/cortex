import { ArrowRight, CheckCircle2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    {
      title: "Voice Grading",
      description: "Speak. Get brutal feedback. Improve.",
    },
    {
      title: "Two Modes",
      description: "Check Me for accountability. Gen Z Tutor for chill learning.",
    },
    {
      title: "Pomodoro Timer",
      description: "Focus intervals. Discipline. Results.",
    },
    {
      title: "Real-Time Waveforms",
      description: "Watch your voice. See your progress.",
    },
  ];

  const comparisonData = [
    {
      name: "StudyTutor",
      enabled: [true, true, true, true, true, true, true, true],
    },
    {
      name: "ChatGPT",
      enabled: [true, false, false, true, false, true, false, false],
    },
    {
      name: "Quizlet",
      enabled: [false, true, false, false, true, false, true, false],
    },
    {
      name: "Tutors",
      enabled: [false, true, true, false, false, true, true, true],
    },
  ];

  const features_comparison = [
    "Voice Grading",
    "Real-time Feedback",
    "Glassmorphism UI",
    "Custom Timers",
    "Quiz Generation",
    "Motivational Quotes",
    "Audio Waveforms",
    "Camera Integration",
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Pre-Med",
      quote: "Finally a tool that doesn't coddle me. Actually made me better.",
    },
    {
      name: "James K.",
      role: "CS Major",
      quote: "Gen Z Tutor is the real deal. Learning actually feels natural.",
    },
    {
      name: "Alex P.",
      role: "Law School",
      quote: "My grades went up. My discipline went up. Everything changed.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black border-b border-yellow-600/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-3xl font-black text-yellow-500 uppercase tracking-widest" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', fontWeight: 700 }}>CORTEX</div>
          <div className="flex items-center gap-8">
            <Link href="/app">
              <button className="px-6 py-2 rounded-lg border border-yellow-600/40 hover:border-yellow-500 transition text-sm font-medium text-yellow-600 hover:text-yellow-500">
                App
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(https://i.ibb.co/M5ST5KP7/Gemini-Generated-Image-m5n9jhm5n9jhm5n9.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Top Fade Overlay - Stronger */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black via-black/80 to-transparent z-0" />
        
        {/* Bottom Fade Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-0" />
        
        {/* Main Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 z-0" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Badge with Animation - Frosted Glass */}
          <motion.div 
            className="text-center mb-8"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="inline-block px-5 py-3 rounded-full border border-yellow-300/80 text-yellow-300 text-sm font-bold" style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 8px 24px rgba(251, 191, 36, 0.15)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}>
              NOW LIVE
            </div>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-7xl md:text-8xl text-center leading-tight mb-6" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 500 }}>
            <span style={{
              color: '#e5e7eb',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              letterSpacing: '0.02em',
            }}>
              F*ck Bad
            </span>{" "}
            <span style={{
              color: '#fbbf24',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              letterSpacing: '0.02em',
            }}>
              Grades
            </span>
          </h1>

          {/* Subheading in Frosted Glass Box */}
          <div className="px-4 py-3 rounded-lg border border-white/20 max-w-xl mx-auto mb-12" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)',
          }}>
            <p className="text-base text-white text-center" style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '0.3px' }}>
              Voice-based learning. No excuses. No coddling. Just results.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Link href="/app">
              <button className="px-8 py-4 rounded-lg bg-yellow-500 text-black font-bold text-lg hover:bg-yellow-400 transition flex items-center gap-2 group cursor-pointer">
                Start Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
            </Link>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-16 border-t border-yellow-600/20">
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-bold text-yellow-400">500+</div>
              <p className="text-neutral-400 text-lg mt-3">Students</p>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-bold text-yellow-400">98%</div>
              <p className="text-neutral-400 text-lg mt-3">Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-bold text-yellow-400">2000+</div>
              <p className="text-neutral-400 text-lg mt-3">Hours Studied</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Carousel Section */}
      <section className="py-20 px-6 border-t border-yellow-600/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">What You Get</h2>

          <div className="flex items-center justify-center gap-8">
            {/* Left Arrow */}
            <button
              onClick={() => setCurrentFeature((prev) => (prev === 0 ? features.length - 1 : prev - 1))}
              className="p-3 rounded-full border border-yellow-600/40 hover:border-yellow-500 hover:bg-yellow-500/10 transition"
            >
              <ChevronLeft className="w-6 h-6 text-yellow-500" />
            </button>

            {/* Carousel Container */}
            <div className="flex-1 max-w-2xl">
              <div className="p-8 rounded-lg border border-yellow-600/20 bg-yellow-500/5 min-h-48 flex flex-col justify-center">
                <h3 className="text-3xl font-bold mb-4 text-yellow-500">{features[currentFeature].title}</h3>
                <p className="text-xl text-neutral-300">{features[currentFeature].description}</p>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {features.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentFeature(idx)}
                    className={`w-2 h-2 rounded-full transition ${
                      idx === currentFeature ? 'bg-yellow-500 w-8' : 'bg-yellow-600/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => setCurrentFeature((prev) => (prev === features.length - 1 ? 0 : prev + 1))}
              className="p-3 rounded-full border border-yellow-600/40 hover:border-yellow-500 hover:bg-yellow-500/10 transition"
            >
              <ChevronRight className="w-6 h-6 text-yellow-500" />
            </button>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-6 border-t border-yellow-600/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">Why We Win</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-yellow-600/20">
                  <th className="text-left py-4 px-6 font-bold">Feature</th>
                  {comparisonData.map((tool) => (
                    <th
                      key={tool.name}
                      className="text-center py-4 px-6 font-bold text-sm"
                    >
                      {tool.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features_comparison.map((feature, idx) => (
                  <tr
                    key={feature}
                    className="border-b border-yellow-600/10 hover:bg-yellow-500/5 transition"
                  >
                    <td className="py-4 px-6 font-medium">{feature}</td>
                    {comparisonData.map((tool, toolIdx) => (
                      <td key={toolIdx} className="text-center py-4 px-6">
                        {tool.enabled[idx] ? (
                          <CheckCircle2 className="w-6 h-6 text-yellow-500 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-neutral-700 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 border-t border-yellow-600/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4">Real Students</h2>
          <p className="text-neutral-400 text-center mb-16 max-w-2xl mx-auto">
            People who actually use StudyTutor.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="p-6 rounded-lg border border-yellow-600/20"
              >
                <p className="text-neutral-300 mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-yellow-500">{testimonial.name}</p>
                  <p className="text-sm text-neutral-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 border-t border-yellow-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Stop Settling</h2>
          <p className="text-xl text-neutral-400 mb-12">
            Your grades. Your future. Your responsibility.
          </p>
          <Link href="/app">
            <button className="px-8 py-4 rounded-lg bg-yellow-500 text-black font-bold text-lg hover:bg-yellow-400 transition flex items-center gap-2 group cursor-pointer mx-auto">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-yellow-600/20 py-12 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-neutral-500 text-sm">
          <p>© 2025 Cortex. No excuses.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-yellow-500 transition">
              Privacy
            </a>
            <a href="#" className="hover:text-yellow-500 transition">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

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
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Bottom Blur Overlay */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40vh',
        background: 'linear-gradient(to-bottom, transparent 0%, rgba(0, 0, 0, 0.2) 30%, rgba(0, 0, 0, 0.5) 70%, rgba(0, 0, 0, 0.8) 100%)',
        backdropFilter: 'blur(8px) brightness(0.9)',
        WebkitBackdropFilter: 'blur(8px) brightness(0.9)',
        pointerEvents: 'none',
        zIndex: 40,
      }} />
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10" style={{
        background: 'rgba(20, 20, 20, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)',
        maskImage: 'linear-gradient(to-bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 80%, rgba(0, 0, 0, 0) 100%)',
        WebkitMaskImage: 'linear-gradient(to-bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 80%, rgba(0, 0, 0, 0) 100%)',
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-3xl font-black text-yellow-500 uppercase tracking-widest" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', fontWeight: 700 }}>CORTEX</div>
          <div className="flex items-center gap-8">
            <Link href="/app">
              <button className="px-6 py-2 rounded-full font-medium text-white text-sm hover:shadow-lg transition" style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
              }}>
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
        {/* Top Fade Overlay */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black/50 via-black/30 to-transparent z-0" />
        
        {/* Bottom Fade Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-0" />
        
        {/* Main Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90 z-0" />

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
          <h1 className="text-7xl md:text-8xl text-center leading-tight mb-6" style={{ 
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            fontWeight: 700,
            background: 'linear-gradient(180deg, #FFFFFF 10%, #5a5a5a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            maskImage: 'linear-gradient(to-bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0) 100%)',
            WebkitMaskImage: 'linear-gradient(to-bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0) 100%)',
          }}>
            F*ck Bad Grades
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

      {/* Features Book Section */}
      <section className="py-20 px-6 border-t border-yellow-600/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-20">What You Get</h2>

          <div className="flex items-center justify-center gap-16">
            {/* Left Arrow */}
            <button
              onClick={() => setCurrentFeature((prev) => (prev === 0 ? features.length - 1 : prev - 1))}
              className="p-4 rounded-full border border-yellow-600/40 hover:border-yellow-500 hover:bg-yellow-500/10 transition flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6 text-yellow-500" />
            </button>

            {/* Book Container */}
            <div className="flex-1 max-w-5xl" style={{ perspective: '1400px' }}>
              <div style={{
                position: 'relative',
                height: '480px',
                transformStyle: 'preserve-3d',
              }}>
                {/* Book Outer Container */}
                <div style={{
                  display: 'flex',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                }}>
                  {/* Book Spine/Binding */}
                  <div style={{
                    width: '20px',
                    background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.3) 0%, rgba(251, 191, 36, 0.1) 100%)',
                    boxShadow: 'inset -2px 0 8px rgba(0, 0, 0, 0.8), 2px 0 12px rgba(251, 191, 36, 0.2)',
                  }} />

                  {/* Left Page */}
                  <motion.div
                    key={`left-${currentFeature}`}
                    initial={{ rotateY: 60, opacity: 0, x: -30 }}
                    animate={{ rotateY: 0, opacity: 1, x: 0 }}
                    exit={{ rotateY: -60, opacity: 0, x: 30 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="flex-1 p-10 flex flex-col justify-center relative"
                    style={{
                      background: 'linear-gradient(135deg, rgba(40, 40, 40, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%)',
                      borderLeft: '1px solid rgba(251, 191, 36, 0.15)',
                      borderTop: '1px solid rgba(251, 191, 36, 0.1)',
                      borderBottom: '1px solid rgba(251, 191, 36, 0.1)',
                      transformStyle: 'preserve-3d',
                      boxShadow: 'inset 8px 0 30px rgba(0, 0, 0, 0.6), inset -2px 0 10px rgba(251, 191, 36, 0.05)',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.2), transparent)',
                    }} />
                    <div className="mb-6">
                      <div className="text-xs text-yellow-600/40 mb-3 uppercase tracking-widest font-medium">Chapter {currentFeature + 1}</div>
                      <h3 className="text-4xl font-bold text-yellow-400 leading-tight">{features[currentFeature].title}</h3>
                    </div>
                    <p className="text-lg text-neutral-300 leading-relaxed font-light">{features[currentFeature].description}</p>
                  </motion.div>

                  {/* Right Page */}
                  <motion.div
                    key={`right-${currentFeature}`}
                    initial={{ rotateY: -60, opacity: 0, x: 30 }}
                    animate={{ rotateY: 0, opacity: 1, x: 0 }}
                    exit={{ rotateY: 60, opacity: 0, x: -30 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="flex-1 p-10 flex flex-col justify-center relative"
                    style={{
                      background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.9) 0%, rgba(40, 40, 40, 0.8) 100%)',
                      borderRight: '1px solid rgba(251, 191, 36, 0.15)',
                      borderTop: '1px solid rgba(251, 191, 36, 0.1)',
                      borderBottom: '1px solid rgba(251, 191, 36, 0.1)',
                      transformStyle: 'preserve-3d',
                      boxShadow: 'inset -8px 0 30px rgba(0, 0, 0, 0.6), inset 2px 0 10px rgba(251, 191, 36, 0.05), 16px 0 40px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.2), transparent)',
                    }} />
                    <div className="mb-6">
                      <div className="text-xs text-yellow-600/40 mb-3 uppercase tracking-widest font-medium">Chapter {currentFeature + 2}</div>
                      <h3 className="text-4xl font-bold text-yellow-400 leading-tight">
                        {features[(currentFeature + 1) % features.length].title}
                      </h3>
                    </div>
                    <p className="text-lg text-neutral-300 leading-relaxed font-light">
                      {features[(currentFeature + 1) % features.length].description}
                    </p>
                  </motion.div>
                </div>

                {/* Page Shadow Effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                  boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.5)',
                  borderRadius: '2px',
                }} />
              </div>

              {/* Page Indicator */}
              <div className="flex justify-center gap-2 mt-10">
                {features.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentFeature(idx)}
                    className={`transition ${
                      idx === currentFeature ? 'bg-yellow-500 w-8' : 'bg-yellow-600/40 w-2'
                    } h-2 rounded-full`}
                  />
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => setCurrentFeature((prev) => (prev === features.length - 1 ? 0 : prev + 1))}
              className="p-4 rounded-full border border-yellow-600/40 hover:border-yellow-500 hover:bg-yellow-500/10 transition flex-shrink-0"
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
            People who actually use Cortex.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 perspective" style={{ perspective: '1500px' }}>
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, rotateX: 15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: i * 0.2, duration: 0.7 }}
                className="p-8 group"
                style={{
                  transform: `rotateZ(${i === 0 ? '-5deg' : i === 1 ? '0.5deg' : '5deg'}) rotateX(${i === 0 ? '3deg' : i === 1 ? '-2deg' : '3deg'}) rotateY(${i === 0 ? '-2deg' : i === 1 ? '1deg' : '2deg'})`,
                  backgroundColor: '#ffd700',
                  backgroundImage: `
                    url("data:image/svg+xml,%3Csvg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='2'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='0.5'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"),
                    linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.1) 100%),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 25%, rgba(0, 0, 0, 0.08) 100%)
                  `,
                  boxShadow: `
                    ${i === 0 ? '-12px 28px 56px' : i === 1 ? '0px 32px 64px' : '12px 28px 56px'} rgba(0, 0, 0, 0.5),
                    ${i === 0 ? '-6px 14px 28px' : i === 1 ? '0px 16px 32px' : '6px 14px 28px'} rgba(0, 0, 0, 0.3),
                    inset -1px 1px 0 rgba(255, 255, 255, 0.5),
                    inset 1px -1px 2px rgba(0, 0, 0, 0.15)
                  `,
                  position: 'relative',
                  minHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '0.5px',
                  clipPath: `polygon(
                    ${Math.random() * 2}% ${Math.random() * 2}%,
                    ${98 + Math.random() * 2}% ${Math.random() * 1.5}%,
                    ${100 - Math.random() * 1.5}% ${98 + Math.random() * 2}%,
                    ${Math.random() * 2}% ${98 + Math.random() * 1.5}%
                  )`,
                }}
              >
                {/* Tape effect at top */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '55%',
                  height: '10px',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.6) 100%)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  borderRadius: '1px',
                  opacity: 0.7,
                }} />

                {/* Worn paper edge highlights */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '0.5px',
                  background: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.2), transparent)',
                }} />

                <p className="text-black mb-8 font-medium leading-relaxed text-base italic">"{testimonial.quote}"</p>
                <div className="pt-4 border-t-2 border-black/20">
                  <p className="font-bold text-black text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-800">{testimonial.role}</p>
                </div>
              </motion.div>
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
      <footer className="bg-black/50 border-t border-gray-700/50 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          {/* CORTEX Logo Text */}
          <div className="text-center mb-16">
            <h3 className="text-9xl md:text-10xl font-bold leading-tight" style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              background: 'linear-gradient(180deg, #FFFFFF 5%, #4a4a4a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.04em',
              marginBottom: '3rem',
            }}>
              CORTEX
            </h3>
          </div>

          {/* Separator Line */}
          <div className="border-t border-gray-600/40 my-12" />

          {/* Footer Navigation */}
          <div className="flex items-center justify-between text-neutral-400 text-sm">
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition">Home</a>
              <a href="#" className="hover:text-white transition">Contact us</a>
              <a href="#" className="hover:text-white transition">Policies</a>
            </div>
            <p>© 2025 Cortex | All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

import { motion } from "framer-motion";
import { ArrowRight, Zap, Brain, Mic, Timer, Sparkles, CheckCircle2, X } from "lucide-react";
import { Link } from "wouter";

const LandingPage = () => {
  const features = [
    {
      icon: Mic,
      title: "Voice Analysis",
      description: "Speak your answer. Get brutal, honest feedback on your understanding.",
    },
    {
      icon: Brain,
      title: "AI Tutoring",
      description: "Two modes: Check Me for accountability, Gen Z Tutor for casual learning.",
    },
    {
      icon: Timer,
      title: "Pomodoro Timer",
      description: "Custom focus intervals. Stay consistent. Build discipline.",
    },
    {
      icon: Zap,
      title: "Live Waveforms",
      description: "Watch your voice translate to waves. Real-time feedback as you speak.",
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
      role: "Pre-Med Student",
      quote:
        "Finally a study tool that calls out my BS. The voice feedback actually makes me better.",
      stars: 5,
    },
    {
      name: "James K.",
      role: "CS Major",
      quote:
        "Gen Z Tutor made learning actually fun. Who knew studying could feel this natural?",
      stars: 5,
    },
    {
      name: "Alex P.",
      role: "Law Student",
      quote:
        "The Pomodoro integration is chef's kiss. My study consistency went through the roof.",
      stars: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            StudyTutor
          </div>
          <div className="flex items-center gap-8">
            <Link href="/app">
              <button className="px-6 py-2 rounded-lg border border-white/20 hover:border-white/40 transition text-sm font-medium">
                App
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-block px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-300 text-sm font-medium">
              🔥 Your AI Study Co-Pilot is Here
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-7xl font-black text-center leading-tight mb-6"
          >
            Study Smarter.{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Score Higher.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-neutral-400 text-center max-w-3xl mx-auto mb-12"
          >
            Voice-based learning with instant feedback. Two modes: brutal accountability or casual Gen Z vibes. Your choice.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center"
          >
            <Link href="/app">
              <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-lg hover:shadow-lg hover:shadow-cyan-400/30 transition flex items-center gap-2 group cursor-pointer">
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
            </Link>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-white/10"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">500+</div>
              <p className="text-neutral-500 text-sm mt-2">Students Learning</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">98%</div>
              <p className="text-neutral-500 text-sm mt-2">Satisfaction Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">2000+</div>
              <p className="text-neutral-500 text-sm mt-2">Hours Studied</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">
            Why StudyTutor Wins
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="p-6 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-400/30 hover:bg-white/[0.08] transition"
                >
                  <Icon className="w-12 h-12 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-neutral-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">
            Proven Superior
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
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
                  <tr key={feature} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-4 px-6 font-medium">{feature}</td>
                    {comparisonData.map((tool, toolIdx) => (
                      <td key={toolIdx} className="text-center py-4 px-6">
                        {tool.enabled[idx] ? (
                          <CheckCircle2 className="w-6 h-6 text-cyan-400 mx-auto" />
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
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4">
            Trusted by Students
          </h2>
          <p className="text-neutral-400 text-center mb-16 max-w-2xl mx-auto">
            Real feedback from students who actually use StudyTutor every day.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-6 rounded-xl border border-white/10 bg-white/5"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.stars)].map((_, j) => (
                    <span key={j} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-neutral-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-neutral-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Your Future Self is Waiting
          </h2>
          <p className="text-xl text-neutral-400 mb-12">
            Stop procrastinating. Start studying with AI that actually cares about your progress.
          </p>
          <Link href="/app">
            <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-lg hover:shadow-lg hover:shadow-cyan-400/30 transition flex items-center gap-2 group cursor-pointer mx-auto">
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-neutral-500 text-sm">
          <p>© 2025 StudyTutor. Built for students who mean business.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms
            </a>
            <a href="#" className="hover:text-white transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

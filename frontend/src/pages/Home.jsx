import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Menu,
  X,
  Sparkles,
  Youtube,
  Github,
  Brain,
  TrendingUp,
} from "lucide-react";
import LiquidEther from "@/components/LiquidEther";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-heading",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.3 }
      );

      gsap.fromTo(
        ".hero-subheading",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.6 }
      );

      gsap.fromTo(
        ".hero-buttons",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.9 }
      );

      const gradient = document.querySelector(".animated-gradient");
      gsap.to(gradient, {
        backgroundPosition: "200% 200%",
        duration: 20,
        repeat: -1,
        ease: "linear",
      });

      const featureCards = gsap.utils.toArray(".feature-card");
      featureCards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none none",
            },
            delay: index * 0.15,
          }
        );
      });

      const steps = gsap.utils.toArray(".step-item");
      steps.forEach((step, index) => {
        gsap.fromTo(
          step,
          { opacity: 0, x: index % 2 === 0 ? -60 : 60 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: step,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      gsap.fromTo(
        ".cta-content",
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".cta-section",
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.to(".cta-button-pulse", {
        boxShadow: "0 0 30px rgba(0, 255, 136, 0.8)",
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    });

    return () => ctx.revert();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <div className="animated-gradient fixed inset-0 -z-10 bg-gradient-to-br from-[#0a0a0a] via-[#001a0f] to-[#0a0a0a] bg-[length:200%_200%]" />

      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-[#00ff88]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-[#00ff88]" />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-[#00ff88] bg-clip-text text-transparent">
                SmartLearn AI
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                className="hover:text-[#00ff88] transition-colors duration-300"
              >
                Home
              </a>
              <a
                href="#explore"
                className="hover:text-[#00ff88] transition-colors duration-300"
              >
                Explore
              </a>
              <a
                href="#github"
                className="hover:text-[#00ff88] transition-colors duration-300"
              >
                GitHub Resources
              </a>
              <a
                href="#youtube"
                className="hover:text-[#00ff88] transition-colors duration-300"
              >
                YouTube Courses
              </a>
              <Link to={"/signup"} className="px-5 py-2 bg-[#00ff88] text-black rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(0,255,136,0.6)] transition-all duration-300 transform hover:scale-105">
                Get Started
              </Link>
            </div>

            <button onClick={toggleMenu} className="md:hidden text-[#00ff88]">
              {menuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 space-y-4 border-t border-[#00ff88]/10">
              <a
                href="#home"
                className="block hover:text-[#00ff88] transition-colors duration-300"
              >
                Home
              </a>
              <a
                href="#explore"
                className="block hover:text-[#00ff88] transition-colors duration-300"
              >
                Explore
              </a>
              <a
                href="#github"
                className="block hover:text-[#00ff88] transition-colors duration-300"
              >
                GitHub Resources
              </a>
              <a
                href="#youtube"
                className="block hover:text-[#00ff88] transition-colors duration-300"
              >
                YouTube Courses
              </a>
              <button className="w-full px-5 py-2 bg-[#00ff88] text-black rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(0,255,136,0.6)] transition-all duration-300">
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 overflow-hidden"
      >
        {/* 🔮 Liquid Ether Background */}
        <div className="absolute inset-0 z-0">
          <LiquidEther
            resolution={0.45}
            mouseForce={22}
            cursorSize={120}
            autoDemo={true}
            autoSpeed={0.6}
            autoIntensity={2.2}
            colors={["#00ff88", "#00cc6a", "#3cffb0"]}
          />
        </div>

        {/* 🌟 Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="hero-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Find the Best Courses & Resources{" "}
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00cc6a] bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h1>

          <p className="hero-subheading text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Personalized recommendations from YouTube and GitHub using smart LLM
            intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-[#00ff88] text-black rounded-lg font-bold text-lg hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] transition-all duration-300 transform hover:scale-105">
              Explore Recommendations
            </button>

            <button className="w-full sm:w-auto px-8 py-4 border-2 border-[#00ff88] text-[#00ff88] rounded-lg font-bold text-lg hover:bg-[#00ff88]/10 transition-all duration-300 transform hover:scale-105">
              How It Works
            </button>
          </div>
        </div>
      </section>

      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00cc6a] bg-clip-text text-transparent">
              SmartLearn AI
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="feature-card group p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-[#00ff88]/20 hover:border-[#00ff88] hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 rounded-lg bg-[#00ff88]/10 flex items-center justify-center mb-4 group-hover:bg-[#00ff88]/20 transition-colors duration-300">
                <Brain className="w-6 h-6 text-[#00ff88]" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                AI-Powered Recommendations
              </h3>
              <p className="text-gray-400">
                Advanced LLM algorithms analyze your interests and skill level
                to suggest the perfect learning resources.
              </p>
            </div>

            <div className="feature-card group p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-[#00ff88]/20 hover:border-[#00ff88] hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 rounded-lg bg-[#00ff88]/10 flex items-center justify-center mb-4 group-hover:bg-[#00ff88]/20 transition-colors duration-300">
                <Youtube className="w-6 h-6 text-[#00ff88]" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                YouTube Course Discovery
              </h3>
              <p className="text-gray-400">
                Discover high-quality video courses from top educators, filtered
                and ranked by AI for maximum learning impact.
              </p>
            </div>

            <div className="feature-card group p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-[#00ff88]/20 hover:border-[#00ff88] hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 rounded-lg bg-[#00ff88]/10 flex items-center justify-center mb-4 group-hover:bg-[#00ff88]/20 transition-colors duration-300">
                <Github className="w-6 h-6 text-[#00ff88]" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                GitHub Learning Repositories
              </h3>
              <p className="text-gray-400">
                Access curated GitHub repos with projects, tutorials, and code
                samples tailored to your learning path.
              </p>
            </div>

            <div className="feature-card group p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-[#00ff88]/20 hover:border-[#00ff88] hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 rounded-lg bg-[#00ff88]/10 flex items-center justify-center mb-4 group-hover:bg-[#00ff88]/20 transition-colors duration-300">
                <TrendingUp className="w-6 h-6 text-[#00ff88]" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Personalized Learning Paths
              </h3>
              <p className="text-gray-400">
                Get a customized roadmap that adapts to your progress, ensuring
                efficient and effective skill development.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={stepsRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-[#001a0f]/30 to-transparent"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16">
            How It{" "}
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00cc6a] bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <div className="space-y-12">
            <div className="step-item flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-[#00ff88]/10 border-2 border-[#00ff88] flex items-center justify-center">
                <span className="text-3xl font-bold text-[#00ff88]">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">
                  Choose Topic & Skill Level
                </h3>
                <p className="text-gray-400 text-lg">
                  Tell us what you want to learn and your current experience
                  level. Our AI will understand your unique needs.
                </p>
              </div>
            </div>

            <div className="step-item flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-[#00ff88]/10 border-2 border-[#00ff88] flex items-center justify-center">
                <span className="text-3xl font-bold text-[#00ff88]">2</span>
              </div>
              <div className="flex-1 md:text-right">
                <h3 className="text-2xl font-bold mb-3">
                  AI Analyzes Best Resources
                </h3>
                <p className="text-gray-400 text-lg">
                  Our advanced LLM scans thousands of YouTube videos and GitHub
                  repositories to find the most relevant and high-quality
                  content.
                </p>
              </div>
            </div>

            <div className="step-item flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-[#00ff88]/10 border-2 border-[#00ff88] flex items-center justify-center">
                <span className="text-3xl font-bold text-[#00ff88]">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">
                  Learn from Curated Content
                </h3>
                <p className="text-gray-400 text-lg">
                  Start learning with a personalized collection of resources
                  ranked by quality, relevance, and learning efficiency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={ctaRef}
        className="cta-section py-20 px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/10 to-[#00cc6a]/10" />
        <div className="cta-content max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Start Learning{" "}
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00cc6a] bg-clip-text text-transparent">
              Smarter Today
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of students who are already using AI to accelerate
            their learning journey.
          </p>
          <button className="cta-button-pulse px-10 py-5 bg-[#00ff88] text-black rounded-lg font-bold text-xl hover:shadow-[0_0_40px_rgba(0,255,136,0.8)] transition-all duration-300 transform hover:scale-105">
            Join Free
          </button>
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#00ff88]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#00ff88]" />
              <span className="text-lg font-bold">SmartLearn AI</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <a
                href="#github"
                className="hover:text-[#00ff88] transition-colors duration-300"
              >
                GitHub
              </a>
              <a
                href="#youtube"
                className="hover:text-[#00ff88] transition-colors duration-300"
              >
                YouTube
              </a>
              <a
                href="#privacy"
                className="hover:text-[#00ff88] transition-colors duration-300"
              >
                Privacy
              </a>
              <a
                href="#contact"
                className="hover:text-[#00ff88] transition-colors duration-300"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500">
            Built for students. Powered by AI.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

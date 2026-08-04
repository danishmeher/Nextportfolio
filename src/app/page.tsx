import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Stats from "@/components/Stats";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import MouseGlow from "@/components/MouseGlow";
import ClientChatAssistant from "@/components/ClientChatAssistant";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      <Preloader />
      <ScrollProgress />
      <MouseGlow />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Stats />
        <Experience />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <ClientChatAssistant />
    </div>
  );
}

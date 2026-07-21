"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Code,
  Briefcase,
  User,
  Mail,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Home,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  getExperiences,
  addExperience,
  updateExperience,
  deleteExperience,
  getHeroInfo,
  updateHeroInfo,
  getAboutInfo,
  updateAboutInfo,
  getContactInfo,
  updateContactInfo,
  initializeDefaultData,
  type Project,
  type Skill,
  type Experience,
  type HeroInfo,
  type AboutInfo,
  type ContactInfo,
} from "@/lib/firestore";

type Tab = "overview" | "projects" | "skills" | "experience" | "hero" | "contact";

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "hero", label: "Hero Section", icon: Home },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "skills", label: "Skills", icon: Code },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "contact", label: "Contact", icon: Mail },
];

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [heroInfo, setHeroInfo] = useState<HeroInfo | null>(null);
  const [aboutInfo, setAboutInfo] = useState<AboutInfo | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      // Initialize default data if empty
      await initializeDefaultData();

      const [projectsData, skillsData, experiencesData, heroData, aboutData, contactData] =
        await Promise.all([
          getProjects(),
          getSkills(),
          getExperiences(),
          getHeroInfo(),
          getAboutInfo(),
          getContactInfo(),
        ]);

      setProjects(projectsData);
      setSkills(skillsData);
      setExperiences(experiencesData);
      setHeroInfo(heroData);
      setAboutInfo(aboutData);
      setContactInfo(contactData);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100"
        >
          <Menu size={24} />
        </button>
        <h1 className="font-bold text-slate-900">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold gradient-text">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-1">{user.email}</p>
        </div>

        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon size={20} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-all mb-2"
          >
            <Home size={20} />
            <span className="font-medium">View Site</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <span>Dashboard</span>
            <ChevronRight size={16} />
            <span className="text-slate-900 font-medium">
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
          </div>

          {dataLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overview" && (
                  <OverviewTab
                    projects={projects}
                    skills={skills}
                    experiences={experiences}
                  />
                )}
                {activeTab === "hero" && (
                  <HeroTab heroInfo={heroInfo} onUpdate={loadData} />
                )}
                {activeTab === "projects" && (
                  <ProjectsTab projects={projects} onUpdate={loadData} />
                )}
                {activeTab === "skills" && (
                  <SkillsTab skills={skills} onUpdate={loadData} />
                )}
                {activeTab === "experience" && (
                  <ExperienceTab experiences={experiences} onUpdate={loadData} />
                )}
                {activeTab === "contact" && (
                  <ContactTab contactInfo={contactInfo} onUpdate={loadData} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}

// Overview Tab
function OverviewTab({
  projects,
  skills,
  experiences,
}: {
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
}) {
  const stats = [
    { label: "Projects", value: projects.length, icon: FolderKanban, color: "bg-indigo-500" },
    { label: "Skills", value: skills.length, icon: Code, color: "bg-cyan-500" },
    { label: "Experiences", value: experiences.length, icon: Briefcase, color: "bg-violet-500" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h2>
      <div className="grid sm:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Tips</h3>
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Use the sidebar to navigate between sections
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Changes are saved to Firebase and reflect on your live site
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Click &quot;View Site&quot; to preview your changes
          </li>
        </ul>
      </div>
    </div>
  );
}

// Hero Tab
function HeroTab({
  heroInfo,
  onUpdate,
}: {
  heroInfo: HeroInfo | null;
  onUpdate: () => void;
}) {
  const [form, setForm] = useState<HeroInfo>(
    heroInfo || {
      name: "",
      title: "",
      subtitle: "",
      available: true,
      email: "",
      github: "",
      linkedin: "",
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHeroInfo(form);
      onUpdate();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Hero Section</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Subtitle
          </label>
          <textarea
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              value={form.github}
              onChange={(e) => setForm({ ...form, github: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="available"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <label htmlFor="available" className="text-sm text-slate-700">
            Show &quot;Available for work&quot; badge
          </label>
        </div>
      </div>
    </div>
  );
}

// Projects Tab
function ProjectsTab({
  projects,
  onUpdate,
}: {
  projects: Project[];
  onUpdate: () => void;
}) {
  const [editing, setEditing] = useState<Project | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => setLocalProjects(projects), [projects]);

  const colorOptions = [
    "from-indigo-500 to-violet-600",
    "from-blue-500 to-cyan-500",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-500",
    "from-pink-500 to-rose-500",
    "from-amber-500 to-orange-500",
    "from-red-500 to-rose-600",
  ];

  const handleNew = () => {
    setEditing({
      title: "",
      company: "",
      description: "",
      tags: [],
      icon: "🚀",
      imageUrl: "",
      link: "",
      color: colorOptions[0],
      featured: false,
      order: projects.length + 1,
    });
    setIsNew(true);
  };

  const handleDragStart = (e: React.DragEvent, id?: string) => {
    if (!id) return;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id?: string) => {
    e.preventDefault();
    if (!id) return;
    setDragOverId(id);
  };

  const handleDrop = async (e: React.DragEvent, id?: string) => {
    e.preventDefault();
    const fromId = draggingId || e.dataTransfer.getData("text/plain");
    const toId = id;
    if (!fromId || !toId || fromId === toId) return;

    const fromIndex = localProjects.findIndex((p) => p.id === fromId);
    const toIndex = localProjects.findIndex((p) => p.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const updated = [...localProjects];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    // Re-assign order
    updated.forEach((p, i) => (p.order = i + 1));
    setLocalProjects(updated);

    try {
      await Promise.all(
        updated.map((p) => (p.id ? updateProject(p.id, { order: p.order }) : Promise.resolve()))
      );
    } catch (err) {
      console.error("Failed to persist project order:", err);
    }

    setDraggingId(null);
    setDragOverId(null);
    onUpdate();
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) {
        await addProject(editing);
      } else if (editing.id) {
        await updateProject(editing.id, editing);
      }
      setEditing(null);
      setIsNew(false);
      onUpdate();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {isNew ? "Add Project" : "Edit Project"}
              </h3>

              <div className="space-y-5">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={editing.imageUrl || ""}
                      onChange={(e) =>
                        setEditing({ ...editing, imageUrl: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="col-span-3 grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editing.title}
                        onChange={(e) =>
                          setEditing({ ...editing, title: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={editing.company || ""}
                        onChange={(e) =>
                          setEditing({ ...editing, company: e.target.value })
                        }
                        placeholder="Optional company name"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Project Link
                      </label>
                      <input
                        type="url"
                        value={editing.link || ""}
                        onChange={(e) =>
                          setEditing({ ...editing, link: e.target.value })
                        }
                        placeholder="https://example.com"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editing.tags.join(", ")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        tags: e.target.value.split(",").map((t) => t.trim()),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditing({ ...editing, color })}
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} ${
                          editing.color === color
                            ? "ring-2 ring-offset-2 ring-primary"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editing.featured}
                    onChange={(e) =>
                      setEditing({ ...editing, featured: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="featured" className="text-sm text-slate-700">
                    Featured project (shown larger)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 px-5 py-2.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects list */}
      <div className="space-y-4">
        {localProjects.map((project) => (
          <div
            key={project.id}
            draggable={!!project.id}
            onDragStart={(e) => handleDragStart(e, project.id)}
            onDragOver={(e) => handleDragOver(e, project.id)}
            onDrop={(e) => handleDrop(e, project.id)}
            onDragEnd={() => {
              setDraggingId(null);
              setDragOverId(null);
            }}
            className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4 ${
              dragOverId === project.id ? "ring-2 ring-offset-1 ring-primary" : ""
            }`}
          >
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center overflow-hidden shrink-0`}
            >
              {project.imageUrl ? (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl">{project.icon || "📁"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{project.title}</h3>
                  {project.company ? (
                    <p className="text-sm text-slate-500 truncate">{project.company}</p>
                  ) : null}
                </div>
                {project.featured && (
                  <span className="text-xs bg-indigo-100 text-primary px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 truncate">{project.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditing(project);
                  setIsNew(false);
                }}
                className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-all"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => project.id && handleDelete(project.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {localProjects.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No projects yet. Click &quot;Add Project&quot; to create one.
          </div>
        )}
      </div>
    </div>
  );
}

// Skills Tab
function SkillsTab({
  skills,
  onUpdate,
}: {
  skills: Skill[];
  onUpdate: () => void;
}) {
  const [editing, setEditing] = useState<Skill | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localSkills, setLocalSkills] = useState<Skill[]>(skills);
  const [draggingSkillId, setDraggingSkillId] = useState<string | null>(null);
  const [dragOverSkillId, setDragOverSkillId] = useState<string | null>(null);

  useEffect(() => setLocalSkills(skills), [skills]);

  const categories: { id: Skill["category"]; label: string }[] = [
    { id: "frontend", label: "Frontend" },
    { id: "backend", label: "Backend & CMS" },
    { id: "tools", label: "Tools & Other" },
  ];

  const handleNew = () => {
    setEditing({ name: "", level: 80, category: "frontend" });
    setIsNew(true);
  };

  const handleSkillDragStart = (e: React.DragEvent, id?: string) => {
    if (!id) return;
    setDraggingSkillId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleSkillDragOver = (e: React.DragEvent, id?: string) => {
    e.preventDefault();
    if (!id) return;
    setDragOverSkillId(id);
  };

  const handleSkillDrop = async (e: React.DragEvent, id?: string, category?: Skill["category"]) => {
    e.preventDefault();
    const fromId = draggingSkillId || e.dataTransfer.getData("text/plain");
    const toId = id;
    if (!fromId || !toId || fromId === toId || !category) return;

    const categorySkills = localSkills.filter((s) => s.category === category);
    const fromIndex = categorySkills.findIndex((s) => s.id === fromId);
    const toIndex = categorySkills.findIndex((s) => s.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const updatedCategorySkills = [...categorySkills];
    const [movedSkill] = updatedCategorySkills.splice(fromIndex, 1);
    updatedCategorySkills.splice(toIndex, 0, movedSkill);

    const updatedSkills = localSkills
      .filter((s) => s.category !== category)
      .concat(updatedCategorySkills);

    updatedCategorySkills.forEach((skill, index) => {
      skill.order = index + 1;
    });

    setLocalSkills(updatedSkills);

    try {
      await Promise.all(
        updatedCategorySkills.map((skill) =>
          skill.id ? updateSkill(skill.id, { order: skill.order }) : Promise.resolve()
        )
      );
    } catch (err) {
      console.error("Failed to persist skill order:", err);
    }

    setDraggingSkillId(null);
    setDragOverSkillId(null);
    onUpdate();
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) {
        await addSkill(editing);
      } else if (editing.id) {
        await updateSkill(editing.id, editing);
      }
      setEditing(null);
      setIsNew(false);
      onUpdate();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    try {
      await deleteSkill(id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const groupedSkills = categories.map((cat) => ({
    ...cat,
    skills: localSkills
      .filter((s) => s.category === cat.id)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Skills</h2>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all"
        >
          <Plus size={18} />
          Add Skill
        </button>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {isNew ? "Add Skill" : "Edit Skill"}
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        category: e.target.value as Skill["category"],
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Level: {editing.level}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editing.level}
                    onChange={(e) =>
                      setEditing({ ...editing, level: parseInt(e.target.value) })
                    }
                    className="w-full accent-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 px-5 py-2.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills by category */}
      <div className="space-y-6">
        {groupedSkills.map((group) => (
          <div key={group.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">{group.label}</h3>
            <div className="space-y-3">
              {group.skills.map((skill) => (
                <div
                  key={skill.id}
                  draggable={!!skill.id}
                  onDragStart={(e) => handleSkillDragStart(e, skill.id)}
                  onDragOver={(e) => handleSkillDragOver(e, skill.id)}
                  onDrop={(e) => handleSkillDrop(e, skill.id, group.id)}
                  onDragEnd={() => {
                    setDraggingSkillId(null);
                    setDragOverSkillId(null);
                  }}
                  className={`flex items-center gap-4 p-3 bg-slate-50 rounded-xl ${
                    dragOverSkillId === skill.id ? "ring-2 ring-offset-1 ring-primary" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">
                        {skill.name}
                      </span>
                      <span className="text-sm text-slate-500">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditing(skill);
                        setIsNew(false);
                      }}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => skill.id && handleDelete(skill.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {group.skills.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                  No skills in this category
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Experience Tab
function ExperienceTab({
  experiences,
  onUpdate,
}: {
  experiences: Experience[];
  onUpdate: () => void;
}) {
  const [editing, setEditing] = useState<Experience | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleNew = () => {
    setEditing({
      role: "",
      company: "",
      period: "",
      description: "",
      tags: [],
      current: false,
      order: experiences.length + 1,
    });
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) {
        await addExperience(editing);
      } else if (editing.id) {
        await updateExperience(editing.id, editing);
      }
      setEditing(null);
      setIsNew(false);
      onUpdate();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    try {
      await deleteExperience(id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Work Experience</h2>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all"
        >
          <Plus size={18} />
          Add Experience
        </button>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {isNew ? "Add Experience" : "Edit Experience"}
              </h3>

              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={editing.role}
                      onChange={(e) =>
                        setEditing({ ...editing, role: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={editing.company}
                      onChange={(e) =>
                        setEditing({ ...editing, company: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Period
                  </label>
                  <input
                    type="text"
                    value={editing.period}
                    onChange={(e) =>
                      setEditing({ ...editing, period: e.target.value })
                    }
                    placeholder="e.g., Jan 2023 - Present"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editing.tags.join(", ")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        tags: e.target.value.split(",").map((t) => t.trim()),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="current"
                    checked={editing.current}
                    onChange={(e) =>
                      setEditing({ ...editing, current: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="current" className="text-sm text-slate-700">
                    Current position
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 px-5 py-2.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Experiences list */}
      <div className="space-y-4">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{exp.role}</h3>
                  {exp.current && (
                    <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-primary font-medium">{exp.company}</p>
                <p className="text-sm text-slate-400">{exp.period}</p>
                <p className="text-sm text-slate-600 mt-2">{exp.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditing(exp);
                    setIsNew(false);
                  }}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => exp.id && handleDelete(exp.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {experiences.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No experiences yet. Click &quot;Add Experience&quot; to create one.
          </div>
        )}
      </div>
    </div>
  );
}

// Contact Tab
function ContactTab({
  contactInfo,
  onUpdate,
}: {
  contactInfo: ContactInfo | null;
  onUpdate: () => void;
}) {
  const [form, setForm] = useState<ContactInfo>(
    contactInfo || {
      email: "",
      location: "",
      responseNote: "",
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContactInfo(form);
      onUpdate();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Contact Info</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Response Note
          </label>
          <textarea
            value={form.responseNote}
            onChange={(e) => setForm({ ...form, responseNote: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

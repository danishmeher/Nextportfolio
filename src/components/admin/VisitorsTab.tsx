"use client";

import { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  RefreshCw,
  Trash2,
  Calendar,
  Compass,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import type { VisitorLog, AiChatLog } from "@/lib/firestore";

export default function VisitorsTab() {
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [chats, setChats] = useState<AiChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [subView, setSubView] = useState<"visitors" | "chats">("visitors");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, cRes] = await Promise.all([
        fetch("/api/admin/visitors")
          .then((r) => r.json())
          .catch(() => ({ visitors: [] })),
        fetch("/api/admin/ai-chats")
          .then((r) => r.json())
          .catch(() => ({ chats: [] })),
      ]);
      setVisitors(vRes.visitors || []);
      setChats(cRes.chats || []);
    } catch (err) {
      console.error("Failed to load logs:", err);
      toast.error("Failed to fetch analytics logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteVisitor = async (id?: string) => {
    if (!id) return;
    try {
      await fetch(`/api/admin/visitors?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setVisitors((prev) => prev.filter((v) => v.id !== id));
      toast.success("Visitor entry removed.");
    } catch {
      toast.error("Failed to delete log.");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all visitor logs?")) return;
    try {
      await fetch("/api/admin/visitors?clearAll=true", { method: "DELETE" });
      setVisitors([]);
      toast.success("All visitor logs cleared.");
    } catch {
      toast.error("Failed to clear logs.");
    }
  };

  const handleDeleteChat = async (id?: string) => {
    if (!id) return;
    try {
      await fetch(`/api/admin/ai-chats?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c.id !== id));
      toast.success("Chat log removed.");
    } catch {
      toast.error("Failed to delete chat log.");
    }
  };

  // Device breakdown
  const mobileCount = visitors.filter((v) => v.device?.toLowerCase() === "mobile").length;
  const desktopCount = visitors.filter((v) => v.device?.toLowerCase() === "desktop").length;
  const mobilePercent = visitors.length ? Math.round((mobileCount / visitors.length) * 100) : 0;

  // Filter visitors
  const filteredVisitors = visitors.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.country?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q) ||
      v.device?.toLowerCase().includes(q) ||
      v.os?.toLowerCase().includes(q) ||
      v.browser?.toLowerCase().includes(q) ||
      v.referrer?.toLowerCase().includes(q)
    );
  });

  // Filter chats
  const filteredChats = chats.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.question?.toLowerCase().includes(q) ||
      c.answer?.toLowerCase().includes(q)
    );
  });

  const formatTime = (ts: number) => {
    if (!ts) return "Just now";
    const date = new Date(ts);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Visitors & Traffic</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time tracking of users visiting your portfolio and chatting with Danish AI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-500" : ""}`} />
            Refresh
          </button>
          {visitors.length > 0 && subView === "visitors" && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Visitors
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{visitors.length}</p>
          <p className="text-xs text-slate-500 mt-1">Logged sessions</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              AI Inquiries
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{chats.length}</p>
          <p className="text-xs text-slate-500 mt-1">Conversations held</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Device Split
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{mobilePercent}%</p>
          <p className="text-xs text-slate-500 mt-1">Mobile vs {100 - mobilePercent}% Desktop</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Latest Source
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-3 truncate">
            {visitors[0]?.referrer || "Direct"}
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {visitors[0]?.country || "Active"}
          </p>
        </div>
      </div>

      {/* Tabs Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setSubView("visitors")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              subView === "visitors"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            Visitors Log ({visitors.length})
          </button>
          <button
            onClick={() => setSubView("chats")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              subView === "chats"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            AI Inquiries ({chats.length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={subView === "visitors" ? "Search country, device, source..." : "Search questions or answers..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Loading traffic analytics...</p>
        </div>
      ) : subView === "visitors" ? (
        filteredVisitors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No visitor records found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Once users open your portfolio link, their visit details (device, location, source) will automatically show up here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Visitor & Location</th>
                    <th className="py-3 px-4">Device & OS</th>
                    <th className="py-3 px-4">Traffic Source</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVisitors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {v.country || "Unknown Country"}
                              {v.city ? `, ${v.city}` : ""}
                            </p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              {v.screen ? `Screen: ${v.screen}` : v.ip || "Direct visitor"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {v.device?.toLowerCase() === "mobile" ? (
                            <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : v.device?.toLowerCase() === "tablet" ? (
                            <Tablet className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <Monitor className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="font-medium text-slate-700">
                            {[v.device, v.os, v.browser].filter(Boolean).join(" • ")}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {v.referrer || "Direct"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatTime(v.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteVisitor(v.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : filteredChats.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No AI inquiries yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            When visitors ask Danish AI questions, both their query and the AI's response will be saved here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChats.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-slate-200 transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-semibold text-slate-700">Visitor Inquiry</span>
                  <span>•</span>
                  <span>{formatTime(c.createdAt)}</span>
                </div>
                <button
                  onClick={() => handleDeleteChat(c.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  title="Delete chat log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Question */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  Q
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-medium text-slate-800">
                  &ldquo;{c.question}&rdquo;
                </div>
              </div>

              {/* Answer */}
              {c.answer && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    AI
                  </div>
                  <div className="flex-1 bg-indigo-50/50 border border-indigo-100/60 p-3 rounded-xl text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {c.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

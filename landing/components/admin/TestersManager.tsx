"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Calendar,
  Send,
  CheckCircle2,
  Copy,
  FileSpreadsheet,
  X,
  Sparkles,
  Eye,
  Edit3,
  ShieldAlert,
  Flame,
  Check,
  Smartphone,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Tester, getTestersFromFirestore } from "../../lib/firestore";
import {
  getWelcomeEmailHtml,
  getWelcomeEmailText,
  getTesterStepsEmailHtml,
  getTesterStepsEmailText,
  getReleaseEmailHtml,
  getReleaseEmailText,
  getFeedbackEmailHtml,
  getFeedbackEmailText,
} from "../../lib/email_templates";

export function TestersManager() {
  const [testers, setTesters] = useState<Tester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Email Template Selection State
  const [templateType, setTemplateType] = useState<
    "welcome" | "tester_steps" | "release" | "feedback" | "custom"
  >("tester_steps");

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fetchTesters = async () => {
    setLoading(true);
    const data = await getTestersFromFirestore();
    setTesters(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTesters();
  }, []);

  // Update default subject and body based on template choice
  useEffect(() => {
    if (templateType === "welcome") {
      setEmailSubject("🎉 Welcome to Bujho Priority Early Access!");
      setEmailBody(getWelcomeEmailText());
    } else if (templateType === "tester_steps") {
      setEmailSubject("🚀 Your Bujho Testing Access is Ready - Follow 2 Steps");
      setEmailBody(getTesterStepsEmailText());
    } else if (templateType === "release") {
      setEmailSubject("🚀 New Bujho Beta Build Live on Google Play!");
      setEmailBody(getReleaseEmailText());
    } else if (templateType === "feedback") {
      setEmailSubject("⭐ We'd love your feedback on Bujho!");
      setEmailBody(getFeedbackEmailText());
    } else if (templateType === "custom") {
      setEmailSubject("📢 Update from Bujho Team");
      setEmailBody("");
    }
  }, [templateType]);

  // Export CSV formatted for Google Play Console Internal Testing upload
  const handleExportPlayConsoleCSV = () => {
    if (testers.length === 0) return;

    const headers = ["Email"];
    const rows = testers.map((t) => [t.email]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `bujho_play_console_testers_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Launch default mail client
  const handleLaunchMailClient = () => {
    const emailList = testers.map((t) => t.email).join(",");
    const mailtoUrl = `mailto:${encodeURIComponent(emailList)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  // Copy template & recipient emails to clipboard
  const handleCopyEmailDetails = () => {
    const emailList = testers.map((t) => t.email).join(", ");
    const textToCopy =
      `RECIPIENTS:\n${emailList}\n\n` +
      `SUBJECT:\n${emailSubject}\n\n` +
      `BODY:\n${emailBody}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Send email via Server API (Nodemailer)
  const handleSendViaServer = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sendToAll: true,
          subject: emailSubject,
          messageBody: emailBody,
          templateType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendResult({
          success: true,
          message: `Successfully sent email to ${data.messageSentCount} playtester(s) via Nodemailer!`,
        });
      } else {
        setSendResult({
          success: false,
          message: data.error || "Failed to send email via Nodemailer.",
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err?.message || "Network error. Failed to send email.",
      });
    } finally {
      setSending(false);
    }
  };

  // Render HTML preview based on selected template
  const getPreviewHtml = () => {
    if (templateType === "welcome") return getWelcomeEmailHtml("Playtester");
    if (templateType === "tester_steps")
      return getTesterStepsEmailHtml("Playtester");
    if (templateType === "release") return getReleaseEmailHtml(emailBody);
    if (templateType === "feedback") return getFeedbackEmailHtml(emailBody);
    return `<div style="font-family: sans-serif; padding: 20px;"><h2>${emailSubject}</h2><p style="white-space: pre-wrap;">${emailBody}</p></div>`;
  };

  const filteredTesters = testers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase text-brand-muted tracking-wider mb-1">
              Registered Testers
            </div>
            <div className="text-3xl font-black text-brand-text">
              {testers.length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-party-orange/15 text-party-orange flex items-center justify-center border border-party-orange/30">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase text-brand-muted tracking-wider mb-1">
              Google Play Internal
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>CSV Upload Ready</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase text-brand-muted tracking-wider mb-1">
              Email Broadcasts
            </div>
            <div className="text-xs font-bold text-party-pink flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Nodemailer Engine</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-party-pink/15 text-party-pink flex items-center justify-center border border-party-pink/30">
            <Mail className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Header & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-brand-surface border border-brand-border shadow-lg">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-brand-text flex items-center gap-2 uppercase tracking-tight">
            <Users className="w-5 h-5 text-party-orange" />
            <span>Playtester Roster</span>
          </h2>
          <p className="text-xs text-brand-muted font-bold">
            Real-time signup queue from Firestore
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTesters}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            disabled={testers.length === 0}
            className="flex-1 sm:flex-none justify-center font-extrabold border-2 border-party-orange/40 hover:bg-party-orange/10 text-brand-text"
          >
            <Mail className="w-4 h-4 mr-1.5 text-party-orange" />
            <span>Broadcast Email</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportPlayConsoleCSV}
            disabled={testers.length === 0}
            className="flex-1 sm:flex-none justify-center font-black uppercase shadow-lg shadow-party-orange/20"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            <span>Export Play Console CSV</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md">
        <Input
          placeholder="Filter by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-party-orange" />}
        />
      </div>

      {/* Testers List Table */}
      {loading ? (
        <div className="py-12 text-center text-sm font-bold text-brand-muted">
          Fetching playtesters from Firebase...
        </div>
      ) : filteredTesters.length === 0 ? (
        <div className="py-12 px-4 text-center text-xs sm:text-sm text-brand-muted bg-brand-surface rounded-3xl border border-brand-border font-bold">
          No playtester signups found.
        </div>
      ) : (
        <>
          {/* Mobile Card Stack */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredTesters.map((tester, idx) => (
              <div
                key={tester.id || idx}
                className="p-4 rounded-2xl bg-brand-surface border border-brand-border space-y-2 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-linear-to-tr from-party-pink/20 to-party-orange/20 text-brand-text text-xs font-black flex items-center justify-center shrink-0 border border-party-orange/30">
                    {tester.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-black text-brand-text text-sm truncate">
                    {tester.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-brand-muted font-mono pt-1">
                  <Mail className="w-3.5 h-3.5 text-party-orange shrink-0" />
                  <span className="truncate">{tester.email}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-brand-muted font-bold">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{new Date(tester.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-3xl border border-brand-border bg-brand-surface shadow-md">
            <table className="w-full text-left text-sm text-brand-text">
              <thead className="text-xs uppercase bg-brand-bg/80 text-brand-muted border-b border-brand-border font-black tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Signup Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredTesters.map((tester, idx) => (
                  <tr
                    key={tester.id || idx}
                    className="hover:bg-brand-bg/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-black text-brand-text flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-linear-to-tr from-party-pink/20 to-party-orange/20 text-brand-text text-xs font-black flex items-center justify-center border border-party-orange/30">
                        {tester.name.charAt(0).toUpperCase()}
                      </span>
                      <span>{tester.name}</span>
                    </td>
                    <td className="px-6 py-4 text-brand-muted">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold">
                        <Mail className="w-3.5 h-3.5 text-party-orange" />
                        <span>{tester.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-brand-muted text-xs font-bold">
                      {new Date(tester.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* STATE-OF-THE-ART EMAIL BROADCAST MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl bg-brand-surface text-brand-text rounded-3xl border-2 border-brand-border shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Top Header */}
            <div className="px-6 py-5 border-b border-brand-border flex items-center justify-between bg-brand-bg/80">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-party-pink/20 to-party-orange/20 text-party-orange flex items-center justify-center border border-party-orange/40 shadow-sm">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-brand-text">
                    Email Broadcast Studio
                  </h3>
                  <p className="text-xs text-brand-muted font-bold">
                    Targeting {testers.length} registered beta playtesters
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-brand-primary/10 text-brand-muted hover:text-brand-text flex items-center justify-center transition-colors cursor-pointer border border-brand-border"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Grid */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Template Selector Cards */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-brand-muted mb-2">
                  SELECT EMAIL TEMPLATE TYPE
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Template 1: Initial Testing Steps */}
                  <button
                    type="button"
                    onClick={() => setTemplateType("tester_steps")}
                    className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                      templateType === "tester_steps"
                        ? "bg-party-orange/15 border-party-orange text-brand-text font-extrabold shadow-md scale-[1.02]"
                        : "bg-brand-bg/80 border-brand-border text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Smartphone className="w-4 h-4 text-party-orange" />
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-party-orange/20 text-party-orange">
                        STEP 1 & 2
                      </span>
                    </div>
                    <div>
                      <div className="font-black text-xs text-brand-text">
                        Tester Testing Steps
                      </div>
                      <div className="text-[10px] text-brand-muted font-bold">
                        Invite Screenshot & Play Store Links
                      </div>
                    </div>
                  </button>

                  {/* Template 2: Welcome Info Only */}
                  <button
                    type="button"
                    onClick={() => setTemplateType("welcome")}
                    className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                      templateType === "welcome"
                        ? "bg-party-pink/15 border-party-pink text-brand-text font-extrabold shadow-md scale-[1.02]"
                        : "bg-brand-bg/80 border-brand-border text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Sparkles className="w-4 h-4 text-party-pink" />
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-party-pink/20 text-party-pink">
                        NO LINKS
                      </span>
                    </div>
                    <div>
                      <div className="font-black text-xs text-brand-text">
                        Welcome Info
                      </div>
                      <div className="text-[10px] text-brand-muted font-bold">
                        Explains 1-2 hours wait notice
                      </div>
                    </div>
                  </button>

                  {/* Template 3: Release Build */}
                  <button
                    type="button"
                    onClick={() => setTemplateType("release")}
                    className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                      templateType === "release"
                        ? "bg-party-cyan/15 border-party-cyan text-brand-text font-extrabold shadow-md scale-[1.02]"
                        : "bg-brand-bg/80 border-brand-border text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Send className="w-4 h-4 text-party-cyan" />
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-party-cyan/20 text-party-cyan">
                        UPDATE
                      </span>
                    </div>
                    <div>
                      <div className="font-black text-xs text-brand-text">
                        New Release Build
                      </div>
                      <div className="text-[10px] text-brand-muted font-bold">
                        Changelog & Play Store CTA
                      </div>
                    </div>
                  </button>

                  {/* Template 4: Feedback Request */}
                  <button
                    type="button"
                    onClick={() => setTemplateType("feedback")}
                    className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                      templateType === "feedback"
                        ? "bg-[#FFD600]/15 border-[#FFD600] text-brand-text font-extrabold shadow-md scale-[1.02]"
                        : "bg-brand-bg/80 border-brand-border text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Sparkles className="w-4 h-4 text-[#FFD600]" />
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFD600]/20 text-[#FFD600]">
                        FEEDBACK
                      </span>
                    </div>
                    <div>
                      <div className="font-black text-xs text-brand-text">
                        Feedback Request
                      </div>
                      <div className="text-[10px] text-brand-muted font-bold">
                        WhatsApp & Web form links
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Editor vs Live Preview Toggle */}
              <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                <div className="flex items-center gap-1.5 bg-brand-bg p-1 rounded-xl border border-brand-border">
                  <button
                    type="button"
                    onClick={() => setActiveTab("editor")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === "editor"
                        ? "bg-brand-primary text-brand-text shadow-sm"
                        : "text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Template Editor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === "preview"
                        ? "bg-brand-primary text-brand-text shadow-sm"
                        : "text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live HTML Preview</span>
                  </button>
                </div>

                <div className="text-[11px] font-bold text-brand-muted hidden sm:block">
                  Recipients:{" "}
                  <span className="text-brand-text font-black">
                    {testers.length} Separate Emails
                  </span>
                </div>
              </div>

              {/* Editor Mode */}
              {activeTab === "editor" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-brand-muted mb-1.5">
                      EMAIL SUBJECT LINE
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Subject line..."
                      className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text font-black text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-brand-muted mb-1.5">
                      MESSAGE BODY CONTENT
                    </label>
                    <textarea
                      rows={7}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Type message content here..."
                      className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text font-mono text-xs focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                /* Live Preview Mode */
                <div className="rounded-2xl border-2 border-brand-border bg-white text-slate-900 p-4 h-80 overflow-y-auto shadow-inner">
                  <iframe
                    title="Live Email Preview"
                    srcDoc={getPreviewHtml()}
                    className="w-full h-full border-none rounded-xl bg-white"
                  />
                </div>
              )}

              {/* Send Status Banner */}
              {sendResult && (
                <div
                  className={`p-4 rounded-2xl border-2 text-xs font-extrabold flex items-center justify-between gap-3 ${
                    sendResult.success
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/40"
                  }`}
                >
                  <span>{sendResult.message}</span>
                  <button
                    onClick={() => setSendResult(null)}
                    className="text-xs underline cursor-pointer hover:opacity-80"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Footer Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-brand-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEmailDetails}
                  className="w-full sm:w-auto font-extrabold"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1.5" />
                  )}
                  <span>{copied ? "Copied!" : "Copy Raw Text"}</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLaunchMailClient}
                  className="w-full sm:w-auto font-extrabold"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  <span>Launch Mail App</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendViaServer}
                  isLoading={sending}
                  disabled={sending || testers.length === 0}
                  className="w-full sm:w-auto font-black uppercase tracking-wider py-3 px-6 shadow-xl shadow-party-orange/25"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Send via Nodemailer Server</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

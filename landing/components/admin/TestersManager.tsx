"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Download,
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
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Tester, getTestersFromFirestore } from "../../lib/firestore";
import {
  getWelcomeEmailText,
  getReleaseEmailText,
} from "../../lib/email_templates";

export function TestersManager() {
  const [testers, setTesters] = useState<Tester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Email Template State
  const [templateType, setTemplateType] = useState<
    "welcome" | "release" | "custom"
  >("welcome");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [copied, setCopied] = useState(false);

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
      setEmailSubject("Welcome to Bujho Early Access Beta! 🎮");
      setEmailBody(getWelcomeEmailText("Playtester"));
    } else if (templateType === "release") {
      setEmailSubject("New Bujho Beta Release Available! 🚀");
      setEmailBody(getReleaseEmailText());
    }
  }, [templateType]);

  // Export CSV specifically formatted for Google Play Console Internal Testing upload
  const handleExportPlayConsoleCSV = () => {
    if (testers.length === 0) return;

    // Google Play Console requires column header 'Email' or plain emails
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

  // Launch default mail client with BCC list
  const handleLaunchMailClient = () => {
    const bccList = testers.map((t) => t.email).join(",");
    const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  // Copy template & recipient emails to clipboard
  const handleCopyEmailDetails = () => {
    const bccList = testers.map((t) => t.email).join(", ");
    const textToCopy =
      `RECIPIENTS (BCC):\n${bccList}\n\n` +
      `SUBJECT:\n${emailSubject}\n\n` +
      `BODY:\n${emailBody}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredTesters = testers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-brand-text flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-primary" />
            <span>Playtesters ({testers.length})</span>
          </h2>
          <p className="text-xs text-brand-muted">
            Directly fetched from Firebase Firestore `testers` collection
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
            className="flex-1 sm:flex-none justify-center"
          >
            <Mail className="w-4 h-4 mr-1.5 text-brand-primary" />
            <span>Send Announcement</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportPlayConsoleCSV}
            disabled={testers.length === 0}
            className="flex-1 sm:flex-none justify-center"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            <span>Export Play Console CSV</span>
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="w-full max-w-md">
        <Input
          placeholder="Filter by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Testers List View */}
      {loading ? (
        <div className="py-12 text-center text-sm font-medium text-brand-muted">
          Fetching signups from Firebase...
        </div>
      ) : filteredTesters.length === 0 ? (
        <div className="py-12 px-4 text-center text-xs sm:text-sm text-brand-muted bg-brand-surface rounded-2xl border border-brand-border">
          No early access signups found in Firebase.
        </div>
      ) : (
        <>
          {/* Mobile Card List (Screen < md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredTesters.map((tester, idx) => (
              <div
                key={tester.id || idx}
                className="p-4 rounded-2xl bg-brand-surface border border-brand-border space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-brand-primary/15 text-brand-text text-xs font-black flex items-center justify-center shrink-0 border border-brand-primary/30">
                    {tester.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-extrabold text-brand-text text-sm truncate">
                    {tester.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-brand-muted font-mono pt-1">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tester.email}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-brand-muted font-medium">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{new Date(tester.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (Screen >= md) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-brand-border bg-brand-surface shadow-xs">
            <table className="w-full text-left text-sm text-brand-text">
              <thead className="text-xs uppercase bg-brand-bg text-brand-muted border-b border-brand-border font-bold">
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
                    className="hover:bg-brand-bg/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-extrabold text-brand-text flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-brand-primary/15 text-brand-text text-xs font-black flex items-center justify-center border border-brand-primary/30">
                        {tester.name.charAt(0).toUpperCase()}
                      </span>
                      <span>{tester.name}</span>
                    </td>
                    <td className="px-6 py-4 text-brand-muted">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{tester.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-brand-muted text-xs font-medium">
                      {new Date(tester.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Send Email Broadcast Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-brand-surface text-brand-text rounded-3xl border border-brand-border shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-brand-border flex items-center justify-between bg-brand-bg/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/15 text-brand-text flex items-center justify-center border border-brand-primary/30">
                  <Mail className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-brand-text">
                    Email Playtesters Announcement
                  </h3>
                  <p className="text-xs text-brand-muted font-medium">
                    Send updates to all {testers.length} registered beta
                    playtesters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-brand-primary/10 text-brand-muted hover:text-brand-text flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Template Type Selector */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-brand-muted mb-1.5">
                  SELECT EMAIL TEMPLATE
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTemplateType("welcome")}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      templateType === "welcome"
                        ? "bg-brand-primary/15 border-brand-primary text-brand-text font-extrabold shadow-sm"
                        : "bg-brand-bg border-brand-border text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-brand-primary mb-1" />
                    <span>Welcome Tester</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateType("release")}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      templateType === "release"
                        ? "bg-brand-primary/15 border-brand-primary text-brand-text font-extrabold shadow-sm"
                        : "bg-brand-bg border-brand-border text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <Send className="w-4 h-4 text-brand-primary mb-1" />
                    <span>New Release Build</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateType("custom")}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      templateType === "custom"
                        ? "bg-brand-primary/15 border-brand-primary text-brand-text font-extrabold shadow-sm"
                        : "bg-brand-bg border-brand-border text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <Mail className="w-4 h-4 text-brand-primary mb-1" />
                    <span>Custom Message</span>
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-brand-muted mb-1.5">
                  EMAIL SUBJECT
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text font-extrabold text-xs focus:outline-none"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-brand-muted mb-1.5">
                  MESSAGE BODY
                </label>
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Type your message content here..."
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text font-mono text-xs focus:outline-none leading-relaxed"
                />
              </div>

              {/* Recipient Count Indicator */}
              <div className="p-3 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-between text-brand-muted font-medium">
                <span>Total targeted playtesters:</span>
                <span className="font-mono font-bold text-brand-primary">
                  {testers.length} emails (BCC)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-brand-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEmailDetails}
                  className="w-full sm:w-auto"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1.5" />
                  )}
                  <span>
                    {copied
                      ? "Copied to Clipboard!"
                      : "Copy Template & BCC List"}
                  </span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleLaunchMailClient}
                  className="w-full sm:w-auto"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  <span>Launch Mail Client (BCC All)</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

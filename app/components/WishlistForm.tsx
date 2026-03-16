"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, CheckCircle } from "lucide-react";

export default function WishlistForm() {
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("wishlist")
      .insert({ email: email.trim(), request: request.trim() });
    if (dbError) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vault-green/10 border border-vault-green/30 mb-5">
          <CheckCircle className="w-8 h-8 text-vault-green" />
        </div>
        <h3 className="font-display text-2xl font-bold mb-2">Got it — thank you!</h3>
        <p className="text-vault-text-dim max-w-md">
          Your idea has been added to our build queue. We read every submission and prioritize based on demand. Stay tuned.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-vault-text-dim mb-2">Your email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@company.com"
          className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-accent transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-vault-text-dim mb-2">
          What automation do you wish existed?
        </label>
        <textarea
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          required
          rows={4}
          placeholder="e.g. An AI bot that monitors my competitors' prices and alerts me when they drop..."
          className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-accent transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-vault-accent text-vault-bg font-display font-bold py-3 rounded-xl hover:bg-vault-accent-dim transition-all disabled:opacity-50"
      >
        {loading ? "Submitting..." : <><Send className="w-4 h-4" /> Submit my idea</>}
      </button>
    </form>
  );
}

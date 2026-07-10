"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="p-5 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
          <Rocket size={36} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {feature} — Coming Soon
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm">
            We're working on this — check back later.
          </p>
        </div>
        <div className="px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-[var(--accent)] border-2 border-[var(--accent)]/30 rounded-full">
          Coming Soon
        </div>
      </motion.div>
    </div>
  );
}

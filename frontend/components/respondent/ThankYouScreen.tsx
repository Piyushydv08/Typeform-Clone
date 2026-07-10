"use client";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { PublicForm } from "@/lib/types";

export function ThankYouScreen({ form }: { form: PublicForm }) {
  const config = form?.theme_config || {};
  const title = config.thank_you_title || "All done!";
  const description = config.thank_you_description || form.thank_you_message || "Thank you for completing this form.";
  const redirectUrl = config.thank_you_redirect_url;
  const buttonText = config.thank_you_button_text || "Continue";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-screen text-center p-8 max-w-2xl mx-auto"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-6"
      >
        <CheckCircle2 size={72} style={{ color: "var(--accent)" }} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>{title}</h1>
          <p className="text-xl whitespace-pre-wrap" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        </div>

        {redirectUrl && (
          <a
            href={redirectUrl}
            className="mt-4 px-8 py-3 rounded-full font-bold text-white transition-opacity hover:opacity-90 active:scale-95 inline-block"
            style={{ backgroundColor: "var(--accent)", boxShadow: "0 4px 15px rgba(255,61,87,0.35)" }}
          >
            {buttonText}
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

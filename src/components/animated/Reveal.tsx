"use client";
import { motion } from "framer-motion";
import React from "react";

export default function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

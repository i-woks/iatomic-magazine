import { motion, useReducedMotion } from "motion/react";
import { Outlet, useLocation } from "react-router-dom";

interface PageTransitionProps {
  context?: unknown;
}

export function PageTransition({ context }: PageTransitionProps) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <main className="relative flex-1 pt-16">
        <Outlet context={context} />
      </main>
    );
  }

  return (
    <motion.main
      key={location.pathname}
      className="relative flex-1 pt-16"
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <Outlet context={context} />
    </motion.main>
  );
}

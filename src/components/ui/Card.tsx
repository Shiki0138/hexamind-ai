'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ className, children, hover = false, ...props }: CardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm bg-white",
        hover && "cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1",
        className
      )}
      whileHover={hover ? { scale: 1.02 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
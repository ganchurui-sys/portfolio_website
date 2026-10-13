"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
import { createPortal } from "react-dom";
import styles from "./NavigationLink.module.css";

function NavigationStatus() {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return createPortal(
    <span className={styles.status} role="status" aria-live="polite">
      <i aria-hidden="true" />
      OPENING…
    </span>,
    document.body,
  );
}

export default function NavigationLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <NavigationStatus />
    </Link>
  );
}

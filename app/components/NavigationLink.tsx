"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
import { createPortal } from "react-dom";
import LoadingPercentage from "./LoadingPercentage";
import { useLoadingEstimate } from "./useLoadingEstimate";
import styles from "./NavigationLink.module.css";

function NavigationStatus() {
  const { pending } = useLinkStatus();
  return pending ? <PendingNavigationStatus /> : null;
}

function PendingNavigationStatus() {
  const progress = useLoadingEstimate();

  return createPortal(
    <span className={styles.status} role="status" aria-live="polite">
      <i aria-hidden="true" />
      OPENING…
      <LoadingPercentage value={progress} estimated />
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

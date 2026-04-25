import React from "react";
import { useRouter } from "../store/router";
import { cn } from "../utils/cn";
import { type PiwigoRoute, routeToHref } from "../utils/routes";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
  href?: string;
  to?: PiwigoRoute | undefined;
}

export function Link({
  className,
  href,
  to,
  children,
  onClick,
  ...props
}: LinkProps) {
  const { navigate, navigateHref } = useRouter();
  const displayHref = href ? href : to ? routeToHref(to) : "";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow right-click, ctrl+click, cmd+click, middle-click to work normally
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
    if (href) {
      navigateHref(href);
    }
    if (to) {
      navigate(to);
    }
    onClick?.(e);
  };

  return (
    <a
      href={displayHref}
      onClick={handleClick}
      {...props}
      className={cn(
        to || href ? "cursor-pointer" : "cursor-default",
        className,
      )}
    >
      {children}
    </a>
  );
}

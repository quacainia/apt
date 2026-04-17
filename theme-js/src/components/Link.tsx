import React from "react";
import { useRouter } from "../store/router";
import { cn } from "../utils/cn";
import { type PiwigoRoute, routeToHref } from "../utils/routes";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
  to: PiwigoRoute | undefined;
}

export function Link({
  className,
  to,
  children,
  onClick,
  ...props
}: LinkProps) {
  const { navigate } = useRouter();
  const href = to ? routeToHref(to) : "";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (to) {
      // Allow right-click, ctrl+click, cmd+click, middle-click to work normally
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }

      e.preventDefault();
      navigate(to);
      onClick?.(e);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      {...props}
      className={cn(to ? "cursor-pointer" : "cursor-default", className)}
    >
      {children}
    </a>
  );
}

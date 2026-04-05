import React from "react";
import { useRouter } from "../store/router";
import { type PiwigoRoute, routeToHref } from "../utils/routes";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: PiwigoRoute;
}

export function Link({ to, children, onClick, ...props }: LinkProps) {
  const { navigate } = useRouter();
  const href = routeToHref(to);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow right-click, ctrl+click, cmd+click, middle-click to work normally
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }

    e.preventDefault();
    navigate(to);
    onClick?.(e);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

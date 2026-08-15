import type { ReactNode } from "react";

/** Ícones 2D traço fino (menu do usuário) — mesma família dos cards de área. */

const s = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type MenuIconName =
  | "pencil"
  | "chat"
  | "file"
  | "lock"
  | "check"
  | "chart"
  | "doc"
  | "mail"
  | "broadcast"
  | "layers"
  | "search"
  | "flask"
  | "github"
  | "triangle"
  | "database"
  | "node"
  | "spark"
  | "globe"
  | "cloud"
  | "card"
  | "star"
  | "logout"
  | "target";

function Svg({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "h-4 w-4 shrink-0 text-facto-gold/85"}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function MenuIcon({
  name,
  className,
}: {
  name: MenuIconName;
  className?: string;
}) {
  switch (name) {
    case "pencil":
      return (
        <Svg className={className}>
          <path d="M4 20l4-.8L19 8.2 15.8 5 4.8 16z" {...s} />
          <path d="M13.6 6.2l3.2 3.2" {...s} />
        </Svg>
      );
    case "chat":
      return (
        <Svg className={className}>
          <path d="M5 6h14v10H8l-3 3V6z" {...s} />
        </Svg>
      );
    case "file":
      return (
        <Svg className={className}>
          <path d="M7 4h7l4 4v12H7V4z" {...s} />
          <path d="M14 4v4h4" {...s} />
        </Svg>
      );
    case "lock":
      return (
        <Svg className={className}>
          <rect x="6" y="11" width="12" height="9" rx="1.5" {...s} />
          <path d="M8 11V8a4 4 0 018 0v3" {...s} />
        </Svg>
      );
    case "check":
      return (
        <Svg className={className}>
          <rect x="5" y="5" width="14" height="14" rx="2" {...s} />
          <path d="M8 12.5l2.5 2.5L16 9" {...s} />
        </Svg>
      );
    case "chart":
      return (
        <Svg className={className}>
          <path d="M5 19V9M10 19v-6M15 19V7M20 19H4" {...s} />
        </Svg>
      );
    case "doc":
      return (
        <Svg className={className}>
          <path d="M7 4h8l3 3v13H7V4z" {...s} />
          <path d="M9.5 11h6M9.5 15h4" {...s} />
        </Svg>
      );
    case "mail":
      return (
        <Svg className={className}>
          <rect x="4" y="6" width="16" height="12" rx="1.5" {...s} />
          <path d="M4 8l8 6 8-6" {...s} />
        </Svg>
      );
    case "broadcast":
      return (
        <Svg className={className}>
          <circle cx="8" cy="12" r="2.5" {...s} />
          <path d="M12 9.5a5 5 0 010 5M15.5 7a8.5 8.5 0 010 10" {...s} />
        </Svg>
      );
    case "layers":
      return (
        <Svg className={className}>
          <path d="M12 4l8 4-8 4-8-4 8-4z" {...s} />
          <path d="M4 14l8 4 8-4" {...s} />
        </Svg>
      );
    case "search":
      return (
        <Svg className={className}>
          <circle cx="11" cy="11" r="6" {...s} />
          <path d="M16 16l4 4" {...s} />
        </Svg>
      );
    case "flask":
      return (
        <Svg className={className}>
          <path d="M9 4h6M10 4v5L6 18a2 2 0 002 2h8a2 2 0 002-2l-4-9V4" {...s} />
        </Svg>
      );
    case "github":
      return (
        <Svg className={className}>
          <path
            d="M12 4a8 8 0 00-2.5 15.6c.4.07.55-.17.55-.38v-1.3c-2.25.49-2.72-1.08-2.72-1.08-.37-.93-.9-1.18-.9-1.18-.73-.5.06-.49.06-.49.81.06 1.24.83 1.24.83.72 1.23 1.9.88 2.36.67.07-.52.28-.88.51-1.08-1.8-.2-3.69-.9-3.69-4 0-.88.31-1.6.83-2.16-.08-.2-.36-1.02.08-2.12 0 0 .68-.22 2.22.83a7.7 7.7 0 014.04 0c1.54-1.05 2.22-.83 2.22-.83.44 1.1.16 1.92.08 2.12.52.56.83 1.28.83 2.16 0 3.11-1.9 3.8-3.7 4 .29.25.55.74.55 1.5v2.22c0 .21.15.46.55.38A8 8 0 0012 4z"
            {...s}
          />
        </Svg>
      );
    case "triangle":
      return (
        <Svg className={className}>
          <path d="M12 5l8 14H4L12 5z" {...s} />
        </Svg>
      );
    case "database":
      return (
        <Svg className={className}>
          <ellipse cx="12" cy="7" rx="7" ry="3" {...s} />
          <path d="M5 7v10c0 1.7 3.1 3 7 3s7-1.3 7-3V7" {...s} />
        </Svg>
      );
    case "node":
      return (
        <Svg className={className}>
          <path d="M12 4l8 4.5v7L12 20l-8-4.5v-7L12 4z" {...s} />
        </Svg>
      );
    case "spark":
      return (
        <Svg className={className}>
          <path d="M12 3l1.4 5.2L19 10l-5.6 1.8L12 17l-1.4-5.2L5 10l5.6-1.8L12 3z" {...s} />
        </Svg>
      );
    case "globe":
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="8" {...s} />
          <path d="M4 12h16M12 4c2.5 2.5 3.8 5.2 3.8 8S14.5 17.5 12 20c-2.5-2.5-3.8-5.2-3.8-8S9.5 6.5 12 4z" {...s} />
        </Svg>
      );
    case "cloud":
      return (
        <Svg className={className}>
          <path d="M7 18h10a4 4 0 00.3-8 5.5 5.5 0 00-10.6 1.5A3.5 3.5 0 007 18z" {...s} />
        </Svg>
      );
    case "card":
      return (
        <Svg className={className}>
          <rect x="3" y="6" width="18" height="12" rx="1.5" {...s} />
          <path d="M3 10h18" {...s} />
        </Svg>
      );
    case "star":
      return (
        <Svg className={className}>
          <path d="M12 4l2 5.5 6 .5-4.5 3.8 1.4 5.7L12 16.5 7.1 19.5l1.4-5.7L4 10l6-.5L12 4z" {...s} />
        </Svg>
      );
    case "logout":
      return (
        <Svg className={className}>
          <path d="M10 6H6v12h4M11 12h8M16 9l3 3-3 3" {...s} />
        </Svg>
      );
    case "target":
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="8" {...s} />
          <circle cx="12" cy="12" r="4" {...s} />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        </Svg>
      );
    default:
      return null;
  }
}

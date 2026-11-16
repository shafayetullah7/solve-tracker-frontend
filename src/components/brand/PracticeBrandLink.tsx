import { PracticeMark } from "./PracticeMark";

export type PracticeBrandSize = "nav" | "sidebar" | "auth";

export type PracticeBrandLinkProps = {
  href: string;
  class?: string;
  size?: PracticeBrandSize;
  /** Default true. When false, link is labelled for screen readers only. */
  wordmark?: boolean;
};

const markClass: Record<PracticeBrandSize, string> = {
  nav: "h-7 w-7 shrink-0 text-brand",
  sidebar: "h-8 w-8 shrink-0 text-brand",
  auth: "h-11 w-11 shrink-0 text-brand",
};

const linkClass: Record<PracticeBrandSize, string> = {
  nav: "inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-brand underline-offset-4 hover:underline",
  sidebar:
    "inline-flex min-h-11 items-center gap-2.5 rounded-control px-1 text-lg font-bold tracking-tight text-brand underline-offset-4 hover:underline",
  auth: "mx-auto inline-flex items-center gap-3 text-xl font-bold tracking-tight text-brand underline-offset-4 hover:underline",
};

export function PracticeBrandLink(props: PracticeBrandLinkProps) {
  const size = () => props.size ?? "nav";
  const showWordmark = () => props.wordmark !== false;

  return (
    <a
      href={props.href}
      class={[linkClass[size()], props.class].filter(Boolean).join(" ")}
      aria-label={showWordmark() ? undefined : "Practice home"}
    >
      <PracticeMark class={markClass[size()]} />
      {showWordmark() ? (
        <span>
          practice<span class="text-muted">.</span>
        </span>
      ) : null}
    </a>
  );
}
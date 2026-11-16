const linkClass =
  "text-brand underline-offset-4 hover:underline focus-visible:outline-offset-2";

type DashboardStatLinkProps = {
  href: string;
  label: string;
};

export function DashboardStatLink(props: DashboardStatLinkProps) {
  return (
    <a class={linkClass} href={props.href}>
      {props.label}
    </a>
  );
}
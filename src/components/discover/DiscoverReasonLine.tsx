export type DiscoverReasonLineProps = {
  text: string;
};

export function DiscoverReasonLine(props: DiscoverReasonLineProps) {
  return (
    <p class="text-caption text-muted line-clamp-2" data-testid="discover-reason">
      {props.text}
    </p>
  );
}
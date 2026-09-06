type AvatarProps = {
  name: string;
  src?: string;
  size?: number;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export default function Avatar({ name, src, size = 32 }: AvatarProps) {
  const dimension = { width: size, height: size };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external, unpredictable-domain avatar sources
      <img
        src={src}
        alt={name}
        style={dimension}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      style={dimension}
      className="flex items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
    >
      {getInitials(name)}
    </span>
  );
}

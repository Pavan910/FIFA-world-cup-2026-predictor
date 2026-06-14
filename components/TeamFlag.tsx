export default function TeamFlag({
  flag,
  name,
  className = "text-2xl",
}: {
  flag: string;
  name: string;
  className?: string;
}) {
  if (flag.startsWith("http")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={flag} alt={name} className="h-6 w-6 object-contain" />;
  }
  return <span className={className}>{flag || "🏳️"}</span>;
}

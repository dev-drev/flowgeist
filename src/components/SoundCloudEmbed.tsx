interface SoundCloudEmbedProps {
  url: string;
  /** Larger player with artwork */
  visual?: boolean;
  className?: string;
}

function buildPlayerSrc(url: string, visual: boolean): string {
  const params = new URLSearchParams({
    url,
    color: "#ff5500",
    auto_play: "false",
    hide_related: "false",
    show_comments: "true",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "true",
  });

  if (visual) {
    params.set("visual", "true");
  }

  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

export default function SoundCloudEmbed({
  url,
  visual = true,
  className = "",
}: SoundCloudEmbedProps) {
  const height = visual ? 300 : 166;

  return (
    <div
      className={`overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] ${className}`}
    >
      <iframe
        title="SoundCloud player"
        width="100%"
        height={height}
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={buildPlayerSrc(url, visual)}
        className="block w-full"
      />
    </div>
  );
}

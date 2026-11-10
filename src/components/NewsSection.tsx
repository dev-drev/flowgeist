import Image from "next/image";

const NEWS = [
  {
    date: "06.11.2026",
    kicker: "Bandcamp",
    title: "Flowgeist [EVIGHET007]",
    body: "The debut album is out on Evighet Records. Ten tracks, composed by Marco Bruno and Andrea Davide, from Molecules — with Zainab J Lascandri — to Meaningful Quest. The vinyl is a marbled heavyweight 12-inch, edition of 300, with bookmark and sticker. Digital in 24-bit.",
    href: "https://flowgeist.bandcamp.com/album/flowgeist-evighet007",
    label: "Listen on Bandcamp →",
    image: "/news/evighet007.jpg",
  },
  {
    date: "06.11.2026",
    kicker: "Live",
    title: "Kantine am Berghain",
    body: "Flowgeist makes its live debut at Kantine am Berghain alongside the release of the record. The performance opens the studio architecture of the album to the room.",
    href: "http://www.berghain.berlin/en/events/82079/",
    label: "Tickets →",
    image: "/berghain-logo.svg",
  },
  {
    date: "17.10.2026",
    kicker: "FAZEmag",
    title: "Die Kunst der Mutation",
    body: "FAZEmag 176 on ten years of friendship between Marco Bruno and Velvet May, and a debut that treats electronic music as cinema. The 1 November premiere at Kantine am Berghain pairs the music with a short film directed by Stefano Canavese, live visuals by 4C, and an identity by sira.raw. Text by Triple P.",
    href: "https://www.fazemag.de/flowgeist-die-kunst-der-mutation/",
    label: "Read on FAZEmag →",
    image: "/news/faze-mutation.jpg",
  },
  {
    date: "21.09.2026",
    kicker: "Dork",
    title: "Flowgeist have announced their self-titled debut album",
    body: "Dork reports the debut: ten tracks out on 6 November via Evighet Records, digitally and on double vinyl. The launch show is at Kantine am Berghain on 1 November, with Alex P. Hybrid and Pareal Performance. Doors at 19:00. Words by Claire Jacobs.",
    href: "https://readdork.com/news/flowgeist-self-titled-debut-album-9a71c765a4",
    label: "Read on Dork →",
    image: "/news/dork-page.png",
  },
  {
    date: "10.10.2026",
    kicker: "Instagram",
    title: "Lens Addiction on ‘Flowgeist’",
    body: "Lens Addiction posts the glass behind the short film, shot on a Fujifilm GFX Eterna 55. Directed and photographed by Stefano Canavese, with music by Flowgeist, VFX by 4C, mastering by Marco Bruno, and voiceover by Pareal.",
    href: "https://www.instagram.com/p/DeTsA8fEfqd/",
    label: "See on Instagram →",
    image: "/news/lens-addiction.jpg",
  },
  {
    date: "2026",
    kicker: "Film",
    title: "A Short Film",
    body: "A short film accompanies the album. Image and sound carry the same narrative: dense atmospheres, fractured rhythm, and a voice that stays in the frame.",
    href: "/music",
    label: "Watch →",
    image: "/news/short-film-still.jpg",
  },
];

export const newsLabelClass =
  "ml-10 pt-8 text-[12px] font-semibold tracking-[0.10px] text-black/65 sm:text-[13px] md:ml-0 md:px-10 md:pt-14 md:text-[22px] 2xl:text-[28px] 3xl:text-[34px]";

export default function NewsSection({
  labelClassName = newsLabelClass,
  listClassName = "mt-8 flex flex-col px-4 md:mt-6 md:px-10",
}: {
  labelClassName?: string;
  listClassName?: string;
}) {
  return (
    <>
      <p className={labelClassName}>[news]</p>
      <div className={listClassName}>
        {NEWS.map((item) => (
          <article
            key={item.title}
            className="mt-8 grid items-start gap-4 border-t border-black/15 pt-8 first:mt-0 first:border-t-0 first:pt-0 md:mt-0 md:grid-cols-[7.5rem_13rem_minmax(0,36rem)] md:gap-x-10 md:py-9 md:first:mt-0 md:first:border-t md:first:pt-9"
          >
            <p className="font-pt-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-black/45 md:text-right">
              {item.date}
            </p>
            <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden bg-[#2a2a2a] md:aspect-square md:w-[13rem] md:max-w-none">
              {item.image.endsWith(".svg") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt=""
                  className="absolute left-1/2 top-1/2 h-auto w-[68%] -translate-x-1/2 -translate-y-1/2 object-contain"
                />
              ) : (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 208px, 100vw"
                  className="object-cover object-center"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-pt-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                {item.kicker}
              </p>
              <h2 className="mt-2 font-alte-haas-bold text-[22px] leading-[1.05] text-black/85 md:text-[30px]">
                {item.title}
              </h2>
              <p className="mt-3 font-alte-haas-bold text-[14px] font-semibold leading-[1.25] text-[#5c5c5c] md:text-[17px]">
                {item.body}
              </p>
              <a
                href={item.href}
                {...(item.href.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                className="mt-4 inline-block font-pt-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-black/70 transition hover:text-black"
              >
                {item.label}
              </a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export default function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-black/20 bg-[#BABABA] pb-[max(2rem,env(safe-area-inset-bottom))] md:border-t md:px-10 md:pb-14 md:pt-10 ${className}`}
    >
      <p className="ml-10 pt-4 text-[12px] font-semibold tracking-[0.10px] text-black/65 sm:text-[13px] md:ml-0 md:pt-0 md:text-[22px] 2xl:text-[28px] 3xl:text-[34px]">
        [contacts]
      </p>
      <div className="b-6 font-pt-mono flex w-full flex-col flex-wrap bg-[#515151] pb-3 text-[12px] font-semibold tracking-[0.2em] text-black/65 sm:text-[13px] md:bg-transparent md:pb-0 md:text-[12px]">
        <div className="ml-8 flex h-full flex-col gap-6 bg-[#BABABA] p-4 md:ml-0 md:flex-row md:flex-wrap md:gap-x-16 md:gap-y-6 md:bg-transparent md:p-0 md:pt-6">
          <a
            href="mailto:info@flowgeist.net"
            className="cursor-pointer text-black/90 transition-opacity hover:opacity-70"
          >
            MAIL_ <br />
            <span className="pl-10 font-alte-haas-bold text-[12px] font-semibold normal-case tracking-normal text-[#5c5c5c] sm:text-[13px] md:text-[22px] 2xl:text-[28px] 3xl:text-[34px]">
              info [at] flowgeist.net
            </span>
          </a>
          <a
            href="https://www.instagram.com/flowgeistx/"
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer text-black/90 transition-opacity hover:opacity-70"
          >
            _INSTAGRAM <br />
            <span className="pl-10 font-alte-haas-bold text-[12px] normal-case tracking-normal text-[#5c5c5c] sm:text-[13px] md:text-[22px] 2xl:text-[28px] 3xl:text-[34px]">
              @flowgeistx
            </span>
          </a>
          <a
            href="https://soundcloud.com/flowgeistx"
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer text-black/90 transition-opacity hover:opacity-70"
          >
            SOUNDCLOUD --
            <br />
            <span className="pl-10 font-alte-haas-bold text-[12px] normal-case tracking-normal text-[#5c5c5c] sm:text-[13px] md:text-[22px] 2xl:text-[28px] 3xl:text-[34px]">
              @flowgeistx
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

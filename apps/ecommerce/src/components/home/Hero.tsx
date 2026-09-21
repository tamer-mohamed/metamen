import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[320px] items-end overflow-hidden sm:min-h-[420px]">
      <Image
        src="/hero/banner.svg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
        <div className="max-w-xl text-white">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Everyday essentials, thoughtfully made
          </h1>
          <p className="mt-3 text-base text-white/80 sm:text-lg">
            A demo storefront homepage — browse a small sample collection
            below.
          </p>
        </div>
      </div>
    </section>
  );
}

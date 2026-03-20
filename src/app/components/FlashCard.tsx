"use client";

import { useEffect, useState } from "react";

export default function FlashCard({ image, text }: any) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [image, text]);

  return (
    <div
      onClick={() => setFlipped((prev) => !prev)}
      className="
        w-full
        max-w-[95vw]
        sm:max-w-[760px]
        md:max-w-[920px]
        aspect-[4/3]
        flashcard-shell
        mx-auto
        cursor-pointer
        perspective
        select-none
      "
    >
      <div
        className={`relative w-full h-full duration-500 ease-in-out transform-style preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        <div className="absolute w-full h-full backface-hidden">
          <img
            src={image}
            className="
              w-full h-full object-cover rounded-[2rem]
              shadow-2xl shadow-black/15
              ring-1 ring-black/10 dark:ring-white/10
            "
          />
        </div>

        <div
          className="
            absolute w-full h-full
            rotate-y-180 backface-hidden
            bg-white/92 dark:bg-neutral-900/82
            flex items-center justify-center
            text-[32px] sm:text-[36px] md:text-[44px] leading-tight font-bold tracking-tight
            text-black dark:text-white
            text-center px-10
            rounded-[2rem]
            shadow-2xl shadow-black/15
            ring-1 ring-black/10 dark:ring-white/10
          "
        >
          {text}
        </div>
      </div>
    </div>
  );
}

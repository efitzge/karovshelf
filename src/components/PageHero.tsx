import Image from "next/image";

export default function PageHero({
  src,
  title,
  description,
}: {
  src: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      <div className="mx-auto w-full max-w-[220px] shrink-0 rounded-2xl bg-art-surface p-3 sm:mx-0">
        <Image
          src={src}
          alt=""
          width={1536}
          height={1024}
          className="h-auto w-full object-contain"
        />
      </div>
    </div>
  );
}

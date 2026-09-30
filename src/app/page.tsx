import { GuineafowlSpots } from "@/components/guineafowl-spots";
import { SayingRiddle } from "@/components/saying-riddle";
import { getHeroSayings } from "@/lib/kangas/data";

export const revalidate = 3600;

export default async function Home() {
  const sayings = await getHeroSayings();
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-16 sm:px-8 md:grid-cols-[3fr_2fr] md:py-24">
      <SayingRiddle sayings={sayings} />
      <GuineafowlSpots className="order-first mx-auto aspect-square w-40 md:order-none md:w-full" />
    </div>
  );
}

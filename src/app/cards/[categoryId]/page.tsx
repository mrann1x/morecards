"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import FlashCard from "../../components/FlashCard";
import Link from "next/link";

const supabase = createClient();

type Card = {
  id: string;
  text: string;
  image_url: string;
};

export default function Cards({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = use(params);

  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("category_id", categoryId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setCards(data || []);
      setIndex(0);
      setLoading(false);
    }

    load();
  }, [categoryId]);

  const next = () => {
    if (index < cards.length - 1) setIndex((i) => i + 1);
  };

  const prev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-80 h-80 card animate-pulse" />
      </div>
    );
  }

  const card = cards[index];

  if (!card) {
    return (
      <div className="list-row">
        <h1 className="text-2xl font-semibold tracking-tight">No cards</h1>
        <p className="muted mt-2">Add some cards to start studying.</p>
        <Link href="/categories" className="inline-flex btn btn-ghost py-2 px-3 text-sm mt-4 w-fit">
          {"<- Categories"}
        </Link>
      </div>
    );
  }

  return (
    <div className="study-page study-page--center space-y-3 sm:space-y-4">
      <div>
        <FlashCard key={card.id} image={card.image_url} text={card.text} />
      </div>

      <div className="study-count">
        {index + 1} / {cards.length}
      </div>

      <div className="study-actions">
        {cards.length > 1 && (
          <div className="study-nav">
            <button onClick={prev} disabled={index === 0} className="study-action">
              Previous
            </button>
            <button
              onClick={next}
              disabled={index === cards.length - 1}
              className="study-action"
            >
              Next
            </button>
          </div>
        )}

        <div className="study-links">
          <Link href="/" className="study-link">
            {"<- Home"}
          </Link>
          <Link href={`/categories/${categoryId}`} className="study-link">
            Manage
          </Link>
        </div>
      </div>
    </div>
  );
}

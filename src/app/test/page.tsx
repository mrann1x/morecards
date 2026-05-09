"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

type Card = {
  id: string;
  text: string;
  image_url: string;
  category_id: string;
};

type Category = {
  id: string;
  name: string;
};

function getRandomCards(cards: Card[], limit: number) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, limit);
}

export default function TestPage() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [categoriesById, setCategoriesById] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [{ data: cardData, error: cardError }, { data: categoryData, error: categoryError }] = await Promise.all([
        supabase
        .from("cards")
        .select("id,text,image_url,category_id")
        .not("image_url", "is", null)
        .not("text", "is", null),
        supabase
          .from("categories")
          .select("id,name"),
      ]);

      if (cardError || categoryError) {
        console.error(cardError || categoryError);
        setAllCards([]);
        setCards([]);
        setCategoriesById({});
        setLoading(false);
        return;
      }

      const nextCards = cardData || [];
      const nextCategories = (categoryData || []).reduce<Record<string, string>>((accumulator, category: Category) => {
        accumulator[category.id] = category.name;
        return accumulator;
      }, {});

      setAllCards(nextCards);
      setCards(getRandomCards(nextCards, 10));
      setCategoriesById(nextCategories);
      setIndex(0);
      setAnswer("");
      setScore(0);
      setFeedback("");
      setShowHint(false);
      setLoading(false);
    }

    load();
  }, []);

  function resetTest() {
    setCards(getRandomCards(allCards, 10));
    setIndex(0);
    setAnswer("");
    setScore(0);
    setFeedback("");
    setShowHint(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const currentCard = cards[index];
    if (!currentCard) return;

    const isCorrect = answer === currentCard.text;
    const isLast = index === cards.length - 1;

    if (isCorrect) {
      setScore((currentScore) => currentScore + 1);
      setFeedback(`Correct. Answer: ${currentCard.text}`);
    } else {
      setFeedback(`Wrong. Correct answer: ${currentCard.text}`);
    }

    if (isLast) {
      setIndex(cards.length);
      setAnswer("");
      setShowHint(false);
      return;
    }

    setIndex((currentIndex) => currentIndex + 1);
    setAnswer("");
    setShowHint(false);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-80 h-80 card animate-pulse" />
      </div>
    );
  }

  if (allCards.length === 0) {
    return (
      <div className="list-row">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">No cards available</h1>
          <p className="muted mt-2">Add cards with both an image and text first.</p>
        </div>
        <Link href="/" className="inline-flex btn btn-ghost py-2 px-3 text-sm w-fit">
          {"<- Home"}
        </Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="list-row">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nothing to test yet</h1>
          <p className="muted mt-2">Try again after adding more cards.</p>
        </div>
        <button onClick={resetTest} className="btn btn-primary py-2 px-3 text-sm">
          Try again
        </button>
      </div>
    );
  }

  const isFinished = index >= cards.length;

  if (isFinished) {
    return (
      <div className="study-page space-y-5">
        <div className="card p-6 sm:p-8 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Test complete</h1>
          <p className="text-lg">
            Score: <span className="font-semibold">{score}</span> / {cards.length}
          </p>
          <p className="muted">
            Start a new round to get another random set of 10 cards.
          </p>
          {feedback && <p className="text-sm muted">{feedback}</p>}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button onClick={resetTest} className="btn btn-primary">
              New random round
            </button>
            <Link href="/" className="btn btn-ghost">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[index];
  const currentCategoryName = categoriesById[currentCard.category_id] || "Unknown category";

  return (
    <div className="study-page space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Test</h1>
          <p className="muted mt-2">
            Type the exact text stored in the database for this card.
          </p>
        </div>
        <div className="test-stats">
          <span>{index + 1} / {cards.length}</span>
          <span>Score: {score}</span>
        </div>
      </div>

      <section className="card p-4 sm:p-6 section-stack">
        <div className="test-image-shell">
          <img
            src={currentCard.image_url}
            alt={currentCard.text}
            className="w-full h-full object-contain"
          />
        </div>

        <form onSubmit={handleSubmit} className="section-stack">
          <input
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
            }}
            placeholder="Type the exact text..."
            className="input w-full"
            autoFocus
          />

          <div className="test-action-row">
            <button type="submit" className="btn btn-primary">
              Check
            </button>
            <button
              type="button"
              onClick={() => setShowHint((currentValue) => !currentValue)}
              className="btn btn-ghost"
            >
              {showHint ? "Hide hint" : "Hint"}
            </button>
            <button type="button" onClick={resetTest} className="btn btn-ghost">
              New random round
            </button>
          </div>

          {showHint && (
            <p className="text-sm muted">
              Category: {currentCategoryName}
            </p>
          )}

          <p className={`text-sm ${feedback.startsWith("Wrong") ? "text-red-600 dark:text-red-400" : "muted"}`}>
            {feedback || "Answers must match the saved text exactly, character by character."}
          </p>
        </form>
      </section>
    </div>
  );
}

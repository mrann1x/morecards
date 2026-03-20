"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

const supabase = createClient()

type Category = {
  id: string
  name: string
}

type Card = {
  category_id: string
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [cards, setCards] = useState<Card[]>([])

  useEffect(() => {
    async function load() {
      const { data: categories } = await supabase
        .from("categories")
        .select("*")

      const { data: cards } = await supabase
        .from("cards")
        .select("category_id")

      if (!categories || !cards) {
        setCategories([])
        setCards([])
        return
      }

      setCards(cards)

      const categoryIdsWithCards = new Set(
        cards.map((c) => c.category_id)
      )

      const filtered = categories.filter((c) =>
        categoryIdsWithCards.has(c.id)
      )

      setCategories(filtered)
    }

    load()
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Categories</h1>
        <p className="muted mt-2">
          Only categories with at least one card are shown here.
        </p>
      </div>

      {categories.length === 0 && (
        <div className="list-row muted">
          No categories with cards yet.
        </div>
      )}

      <div className="category-grid">
        {categories.map((c) => {
          const count = cards.filter((card) => card.category_id === c.id).length;

          return (
            <Link
              key={c.id}
              href={`/cards/${c.id}`}
              className="card category-tile"
            >
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight">{c.name}</h2>
              </div>
              <span className="text-sm font-medium muted">{count} cards</span>
            </Link>
          );
        })}
      </div>
    </div>
  )
}

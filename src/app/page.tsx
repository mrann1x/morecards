"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

const supabase = createClient()

type Category = {
  id: string
  name: string
  parent_category_id?: string | null
  parentCategoryId?: string | null
}

type Card = {
  category_id: string
}

function getParentId(category: Category) {
  return category.parent_category_id ?? category.parentCategoryId ?? null
}

function formatCount(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`
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
      setCategories(categories)
    }

    load()
  }, [])

  const cardCounts = new Map<string, number>()
  for (const card of cards) {
    cardCounts.set(card.category_id, (cardCounts.get(card.category_id) ?? 0) + 1)
  }

  const childCounts = new Map<string, number>()
  for (const category of categories) {
    const parentId = getParentId(category)
    if (!parentId) continue
    childCounts.set(parentId, (childCounts.get(parentId) ?? 0) + 1)
  }

  const rootCategories = categories.filter((category) => {
    if (getParentId(category)) return false
    const hasChildren = (childCounts.get(category.id) ?? 0) > 0
    const hasCards = (cardCounts.get(category.id) ?? 0) > 0
    return hasChildren || hasCards
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Categories</h1>
        <p className="muted mt-2">
          Root categories with cards or subcategories are shown here.
        </p>
      </div>

      {rootCategories.length === 0 && (
        <div className="list-row muted">
          No categories with cards or subcategories yet.
        </div>
      )}

      <div className="category-grid">
        {rootCategories.map((c) => {
          const subCount = childCounts.get(c.id) ?? 0
          const cardCount = cardCounts.get(c.id) ?? 0
          const subtitle = subCount > 0
            ? formatCount(subCount, "subcategory", "subcategories")
            : formatCount(cardCount, "card", "cards")

          return (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="card category-tile"
            >
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight">{c.name}</h2>
              </div>
              <span className="text-sm font-medium muted">{subtitle}</span>
            </Link>
          );
        })}
      </div>
    </div>
  )
}

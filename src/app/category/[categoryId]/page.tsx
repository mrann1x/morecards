"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

export default function CategoryBrowser({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = use(params)
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [current, setCurrent] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)

      const { data: categories } = await supabase
        .from("categories")
        .select("*")

      const { data: cards } = await supabase
        .from("cards")
        .select("category_id")

      if (!active) return

      const categoryList = categories || []
      setCategories(categoryList)
      setCards(cards || [])

      const currentCategory = categoryList.find((c) => c.id === categoryId) || null
      setCurrent(currentCategory)

      const children = categoryList.filter((c) => getParentId(c) === categoryId)

      if (children.length === 0) {
        router.replace(`/cards/${categoryId}`)
        return
      }

      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [categoryId, router])

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-80 h-40 card animate-pulse" />
      </div>
    )
  }

  if (!current) {
    return (
      <div className="list-row">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Category not found</h1>
          <p className="muted mt-2">Pick a different category from the homepage.</p>
        </div>
        <Link href="/" className="inline-flex btn btn-ghost py-2 px-3 text-sm w-fit">
          {"<- Home"}
        </Link>
      </div>
    )
  }

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

  const children = categories.filter((category) => getParentId(category) === categoryId)
  const visibleChildren = children.filter((category) => {
    const hasChildren = (childCounts.get(category.id) ?? 0) > 0
    const hasCards = (cardCounts.get(category.id) ?? 0) > 0
    return hasChildren || hasCards
  })

  const parentId = getParentId(current)
  const backHref = parentId ? `/category/${parentId}` : "/"

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{current.name}</h1>
        <p className="muted mt-2">
          Choose a subcategory. If there are no subcategories, you will go straight to cards.
        </p>
      </div>

      {visibleChildren.length === 0 && (
        <div className="list-row muted">
          No subcategories with cards yet.
        </div>
      )}

      <div className="category-grid">
        {visibleChildren.map((child) => {
          const subCount = childCounts.get(child.id) ?? 0
          const cardCount = cardCounts.get(child.id) ?? 0
          const subtitle = subCount > 0
            ? formatCount(subCount, "subcategory", "subcategories")
            : formatCount(cardCount, "card", "cards")

          return (
            <Link
              key={child.id}
              href={`/category/${child.id}`}
              className="card category-tile"
            >
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight">{child.name}</h2>
              </div>
              <span className="text-sm font-medium muted">{subtitle}</span>
            </Link>
          )
        })}
      </div>

      <div className="flex justify-center mt-[3%]">
        <Link href={backHref} className="inline-flex btn btn-ghost py-2 px-3 text-sm w-fit">
          {"<- Back"}
        </Link>
      </div>
    </div>
  )
}

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import ImageUpload from "../../components/ImageUpload";

const supabase = createClient();

type Card = {
  id: string;
  text: string;
  image_url: string;
  order: number | null;
  created_at?: string;
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = use(params);

  const [cards, setCards] = useState<Card[]>([]);
  const [newText, setNewText] = useState("");
  const [newImage, setNewImage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  async function fetchCards() {
    const { data, error } = await supabase
      .from("cards")
      .select("id,text,image_url,order,created_at")
      .eq("category_id", categoryId)
      .order("order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setCards([]);
      return;
    }

    setCards(data || []);
  }

  useEffect(() => {
    fetchCards();
  }, [categoryId]);

  async function addCard() {
    if (!newText || !newImage) {
      alert("Fill everything");
      return;
    }

    const maxOrder = cards.reduce((max, card) => {
      if (typeof card.order !== "number") return max;
      return card.order > max ? card.order : max;
    }, 0);

    const { error } = await supabase.from("cards").insert({
      text: newText,
      image_url: newImage,
      category_id: categoryId,
      order: maxOrder + 1,
    });

    if (error) {
      console.error(error);
      return;
    }

    setNewText("");
    setNewImage("");
    fetchCards();
  }

  async function deleteCard(id: string) {
    await supabase.from("cards").delete().eq("id", id);
    fetchCards();
  }

  async function updateCard(id: string) {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from("cards")
      .update({ text: editText })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setEditingId(null);
    setEditText("");
    fetchCards();
  }

  function reorderCards(list: Card[], fromId: string, toId: string) {
    const fromIndex = list.findIndex((card) => card.id === fromId);
    const toIndex = list.findIndex((card) => card.id === toId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return list;

    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    return next.map((card, index) => ({ ...card, order: index + 1 }));
  }

  async function persistOrder(next: Card[]) {
    setSavingOrder(true);

    const updates = next.map((card) => ({
      id: card.id,
      order: card.order ?? 0,
      category_id: categoryId,
    }));

    const { error } = await supabase
      .from("cards")
      .upsert(updates, { onConflict: "id" });

    if (error) {
      console.error(error);
      fetchCards();
    }

    setSavingOrder(false);
  }

  function handleDragStart(id: string, event: React.DragEvent<HTMLButtonElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  }

  function handleDragOver(id: string, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (dragOverId !== id) setDragOverId(id);
  }

  function handleDrop(id: string, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const sourceId = draggingId || event.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === id) {
      setDragOverId(null);
      setDraggingId(null);
      return;
    }

    const next = reorderCards(cards, sourceId, id);
    setCards(next);
    setDragOverId(null);
    setDraggingId(null);
    void persistOrder(next);
  }

  function handleDragEnd() {
    setDragOverId(null);
    setDraggingId(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Card editor</h1>
        <p className="muted mt-2">Add, edit, and remove cards in this category.</p>
      </div>

      <section className="card p-4 sm:p-5 section-stack">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Card text..."
          className="input w-full"
        />

        <ImageUpload onUpload={setNewImage} />

        {newImage && (
          <div className="preview-grid max-w-sm">
            <div className="card overflow-hidden card-thumb">
              <img src={newImage} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <button onClick={addCard} className="btn btn-primary">
          Add card
        </button>
      </section>

      <section className="mt-[3%] space-y-3">
        <div className="flex items-center gap-3">
          <div className="cards-subtitle">Cards</div>
          {savingOrder && <div className="text-xs muted">Saving order...</div>}
        </div>

        <div className="list-stack">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`list-row flex-col sm:flex-row sm:items-center ${
                dragOverId === card.id && draggingId !== card.id
                  ? "border-black/30 dark:border-white/30"
                  : ""
              }`}
              onDragOver={(event) => handleDragOver(card.id, event)}
              onDrop={(event) => handleDrop(card.id, event)}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <button
                  type="button"
                  className="text-xs font-semibold uppercase tracking-[0.22em] muted cursor-grab select-none"
                  draggable={!savingOrder && editingId !== card.id}
                  onDragStart={(event) => handleDragStart(card.id, event)}
                  onDragEnd={handleDragEnd}
                  aria-label="Drag to reorder"
                >
                  Drag
                </button>
                <img
                  src={card.image_url}
                  className="card-thumb rounded-xl object-cover border border-black/10 dark:border-white/10 shadow-sm shrink-0"
                />

                <div className="min-w-0">
                  {editingId === card.id ? (
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="input py-2 px-3 w-full"
                    />
                  ) : (
                    <div className="font-medium truncate text-base sm:text-lg">{card.text}</div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                {editingId === card.id ? (
                  <>
                    <button
                      onClick={() => updateCard(card.id)}
                      className="btn btn-primary py-2 px-3 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText("");
                      }}
                      className="btn btn-ghost py-2 px-3 text-sm muted"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(card.id);
                        setEditText(card.text);
                      }}
                      className="btn btn-ghost py-2 px-3 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="btn btn-ghost py-2 px-3 text-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-center mt-[3%]">
        <Link href="/" className="inline-flex btn btn-ghost py-2 px-3 text-sm w-fit">
          {"<- Back"}
        </Link>
      </div>
    </div>
  );
}

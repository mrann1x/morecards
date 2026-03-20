"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import ImageUpload from "../../components/ImageUpload";

const supabase = createClient();

export default function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = use(params);

  const [cards, setCards] = useState<any[]>([]);
  const [newText, setNewText] = useState("");
  const [newImage, setNewImage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  async function fetchCards() {
    const { data } = await supabase
      .from("cards")
      .select("*")
      .eq("category_id", categoryId)
      .order("created_at", { ascending: true });

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

    const { error } = await supabase.from("cards").insert({
      text: newText,
      image_url: newImage,
      category_id: categoryId,
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
        <div className="cards-subtitle">Cards</div>

        <div className="list-stack">
          {cards.map((card) => (
            <div
              key={card.id}
              className="list-row flex-col sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
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

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const supabase = createClient();

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCat, setNewCat] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function fetchCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });
    setCategories(data || []);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function addCategory() {
    if (!newCat.trim()) return;

    const { error } = await supabase.from("categories").insert({ name: newCat });
    if (error) return console.error(error);

    setNewCat("");
    fetchCategories();
  }

  async function updateCategory(id: string) {
    if (!editName.trim()) return;

    const { error } = await supabase.from("categories").update({ name: editName }).eq("id", id);
    if (error) return console.error(error);

    setEditingId(null);
    setEditName("");
    fetchCategories();
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete category and all its cards?")) return;

    await supabase.from("cards").delete().eq("category_id", id);
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return console.error(error);

    fetchCategories();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Categories</h1>
        <p className="muted mt-2">Create a new category, then edit or delete the existing ones.</p>
      </div>

      <section className="card p-4 sm:p-5">
        <div className="field-row">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="input flex-1"
            placeholder="New category"
          />
          <button onClick={addCategory} className="btn btn-primary">
            Add
          </button>
        </div>
      </section>

      <section className="mt-[3%] space-y-3">
        <div className="cards-subtitle">Existing categories</div>

        <div className="list-stack">
          {categories.map((c) => (
            <div key={c.id} className="list-row">
              <div className="min-w-0 flex-1">
                {editingId === c.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href={`/categories/${c.id}`} className="font-medium text-base sm:text-lg">
                      {c.name}
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {editingId === c.id ? (
                  <>
                    <button onClick={() => updateCategory(c.id)} className="btn btn-primary">
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditName("");
                      }}
                      className="btn btn-ghost muted"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(c.id);
                        setEditName(c.name);
                      }}
                      className="btn btn-ghost"
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteCategory(c.id)} className="btn btn-ghost">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

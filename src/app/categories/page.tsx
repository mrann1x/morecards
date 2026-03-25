"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const supabase = createClient();

type Category = {
  id: string;
  name: string;
  parent_category_id?: string | null;
  parentCategoryId?: string | null;
};

function getParentId(category: Category) {
  return category.parent_category_id ?? category.parentCategoryId ?? null;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState("");
  const [newParentId, setNewParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editParentId, setEditParentId] = useState<string | null>(null);

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

    const { error } = await supabase.from("categories").insert({
      name: newCat,
      parentCategoryId: newParentId || null,
    });
    if (error) return console.error(error);

    setNewCat("");
    setNewParentId(null);
    fetchCategories();
  }

  async function updateCategory(id: string) {
    if (!editName.trim()) return;

    const { error } = await supabase
      .from("categories")
      .update({
        name: editName,
        parentCategoryId: editParentId || null,
      })
      .eq("id", id);
    if (error) return console.error(error);

    setEditingId(null);
    setEditName("");
    setEditParentId(null);
    fetchCategories();
  }

  async function deleteCategory(id: string) {
    const hasChildren = categories.some((category) => getParentId(category) === id);
    if (hasChildren) {
      alert("This category has subcategories. Move or delete them first.");
      return;
    }

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
          <select
            value={newParentId ?? ""}
            onChange={(e) => setNewParentId(e.target.value || null)}
            className="input min-w-[12rem]"
          >
            <option value="">No parent (root)</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
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
                  <div className="flex flex-col gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input w-full"
                    />
                    <select
                      value={editParentId ?? ""}
                      onChange={(e) => setEditParentId(e.target.value || null)}
                      className="input w-full"
                    >
                      <option value="">No parent (root)</option>
                      {categories
                        .filter((category) => category.id !== c.id)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <Link href={`/categories/${c.id}`} className="font-medium text-base sm:text-lg">
                        {c.name}
                      </Link>
                      {getParentId(c) && (
                        <div className="text-xs muted mt-1">
                          Parent: {categories.find((cat) => cat.id === getParentId(c))?.name ?? "Unknown"}
                        </div>
                      )}
                    </div>
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
                        setEditParentId(null);
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
                        setEditParentId(getParentId(c));
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

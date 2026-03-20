"use client";

import { useState } from "react";

export default function ImageUpload({ onUpload }: any) {
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "flashcards_upload");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    setLoading(false);
    onUpload(data.secure_url);
  }

  return (
    <div className="section-stack">
      <input className="file-input" type="file" onChange={handleUpload} />
      {loading && <p className="muted text-sm">Uploading...</p>}
    </div>
  );
}

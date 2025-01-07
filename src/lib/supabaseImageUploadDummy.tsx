"use client";

import React, { useState } from "react";
import { uploadImageToSupabase } from "./uploadImageToSupabase";

export default function SupbaseDummyImageUpload() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const url = await uploadImageToSupabase(file);

    if (url) {
      setImageUrl(url);
    }

    setUploading(false);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
      {imageUrl && (
        <div>
          <p>Image Uploaded Successfully!</p>
          <img
            src={imageUrl}
            alt="Uploaded"
            style={{ width: "300px", height: "auto" }}
          />
        </div>
      )}
    </div>
  );
}

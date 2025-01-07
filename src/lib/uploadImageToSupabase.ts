import { supabase } from "@/lib/supabaseClient";

export async function uploadImageToSupabase(file: File): Promise<string | null> {
    try {
        const uniqueFileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from("uploads") // Replace "uploads" with your Supabase bucket name
            .upload(uniqueFileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            console.error("Error uploading file:", error.message);
            return null;
        }

        // Get the public URL of the uploaded image
        const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(data.path);

        if (!publicUrl) {
            console.error("Could not generate public URL");
            return null;
        }

        return publicUrl; // Return the public URL of the uploaded image
    } catch (error) {
        console.error("File upload failed:", error);
        return null;
    }
}

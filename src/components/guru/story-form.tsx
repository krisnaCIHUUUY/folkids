"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { storySchema, type StoryFormValues } from "@/lib/validations/story";
import { createStory, updateStory } from "@/lib/actions/stories";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaUploader } from "@/components/guru/media-uploader";

export function StoryForm({
  storyId,
  defaultValues,
}: {
  storyId?: number;
  defaultValues?: Partial<StoryFormValues>;
}) {
  const router = useRouter();
  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    mode: "onTouched",
    defaultValues: {
      title: defaultValues?.title ?? "",
      synopsis: defaultValues?.synopsis ?? "",
      region_origin: defaultValues?.region_origin ?? "",
      character_theme: defaultValues?.character_theme ?? "",
      difficulty: defaultValues?.difficulty ?? "mudah",
      cover_image_url: defaultValues?.cover_image_url ?? "",
      module_pdf_url: defaultValues?.module_pdf_url ?? "",
    },
  });

  async function onSubmit(values: StoryFormValues) {
    if (storyId) {
      const result = await updateStory(storyId, values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Perubahan tersimpan");
      router.push("/cms");
      router.refresh();
    } else {
      const result = await createStory(values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Cerita dibuat");
      router.push(`/cms/${result.id}/halaman`);
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="clay mt-6 space-y-5 bg-white p-6 md:p-8"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">Judul</FormLabel>
              <FormControl>
                <Input placeholder="Judul cerita" {...field} />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="synopsis"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">Sinopsis</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Ringkasan cerita" {...field} />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="region_origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-clay-ink">
                  Daerah Asal
                </FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Jawa Tengah" {...field} />
                </FormControl>
                <FormMessage className="text-clay-coral" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="character_theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-clay-ink">
                  Tema Karakter
                </FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Keberanian" {...field} />
                </FormControl>
                <FormMessage className="text-clay-coral" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Tingkat Kesulitan
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mudah">Mudah</SelectItem>
                  <SelectItem value="sedang">Sedang</SelectItem>
                  <SelectItem value="sulit">Sulit</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cover_image_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MediaUploader
                  kind="image"
                  label="Gambar Sampul"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="module_pdf_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MediaUploader
                  kind="pdf"
                  label="Modul PDF (opsional)"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <p className="text-xs font-semibold text-clay-ink/50">
                Upload modul PDF sebagai bahan pendukung cerita. Siswa bisa membacanya di halaman cerita.
              </p>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="clay-sm bg-clay-rose px-6 py-3 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-60"
          >
            {form.formState.isSubmitting
              ? "Menyimpan…"
              : storyId
                ? "Simpan Perubahan"
                : "Buat Cerita"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/cms")}
            className="clay-sm bg-white px-6 py-3 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            Batal
          </button>
        </div>
      </form>
    </Form>
  );
}

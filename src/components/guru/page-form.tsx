"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  storyPageSchema,
  type StoryPageFormValues,
} from "@/lib/validations/story";
import { createPage, updatePage } from "@/lib/actions/stories";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MediaUploader } from "@/components/guru/media-uploader";
import { RichTextEditor } from "@/components/guru/rich-text-editor";

export function PageForm({
  storyId,
  pageId,
  defaultValues,
  onDone,
}: {
  storyId: number;
  pageId?: number;
  defaultValues?: Partial<StoryPageFormValues>;
  onDone: () => void;
}) {
  const form = useForm<StoryPageFormValues>({
    resolver: zodResolver(storyPageSchema),
    mode: "onTouched",
    defaultValues: {
      content: defaultValues?.content ?? "",
      illustration_url: defaultValues?.illustration_url ?? "",
      audio_url: defaultValues?.audio_url ?? "",
      character_values: defaultValues?.character_values ?? "",
    },
  });

  async function onSubmit(values: StoryPageFormValues) {
    const result = pageId
      ? await updatePage(pageId, storyId, values)
      : await createPage(storyId, values);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(pageId ? "Halaman tersimpan" : "Halaman ditambahkan");
    onDone();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Konten Halaman
              </FormLabel>
              <FormControl>
                <RichTextEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="illustration_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MediaUploader
                  kind="image"
                  label="Ilustrasi"
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
          name="audio_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MediaUploader
                  kind="audio"
                  label="Audio Narasi"
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
          name="character_values"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Nilai Karakter
              </FormLabel>
              <FormControl>
                <Input placeholder="Contoh: jujur, berani" {...field} />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="clay-sm w-full bg-clay-rose py-3 text-sm font-black text-white transition active:[transform:translateY(2px)] disabled:opacity-60"
        >
          {form.formState.isSubmitting ? "Menyimpan…" : "Simpan Halaman"}
        </button>
      </form>
    </Form>
  );
}

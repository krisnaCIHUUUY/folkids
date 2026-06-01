"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Heading2, List, ListOrdered } from "lucide-react";

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()} // jaga fokus editor
      onClick={onClick}
      className={[
        "clay-sm grid size-9 place-items-center transition",
        "hover:[transform:translateY(-2px)] active:[transform:translateY(1px)]",
        active ? "bg-clay-rose text-white" : "bg-white text-clay-ink/70 hover:text-clay-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      <ToolbarButton
        label="Tebal"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" strokeWidth={2.5} />
      </ToolbarButton>
      <ToolbarButton
        label="Miring"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" strokeWidth={2.5} />
      </ToolbarButton>
      <ToolbarButton
        label="Judul"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" strokeWidth={2.5} />
      </ToolbarButton>
      <ToolbarButton
        label="Daftar berpoin"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" strokeWidth={2.5} />
      </ToolbarButton>
      <ToolbarButton
        label="Daftar bernomor"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" strokeWidth={2.5} />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false, // hindari hydration mismatch (Next App Router)
    extensions: [StarterKit.configure({ heading: { levels: [2] } })],
    content: value || "",
    editorProps: {
      attributes: {
        class: "rich-content min-h-[160px] outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? "" : editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="clay-inset min-h-[200px] bg-white p-4 text-sm text-clay-ink/40">
        Memuat editor…
      </div>
    );
  }

  return (
    <div className="clay-inset bg-white p-3">
      <Toolbar editor={editor} />
      <div className="rounded-xl bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-clay-rose/40">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

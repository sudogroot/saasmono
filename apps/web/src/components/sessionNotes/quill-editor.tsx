'use client'

import { useEditor, EditorContent, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react'
import { Button } from '@repo/ui'
import { useCallback, useEffect } from 'react'

interface TiptapEditorProps {
  value: string
  onChange?: (value: string) => void
  readonly?: boolean
  placeholder?: string
  className?: string
}

// Parse the value string into Tiptap JSON content
function parseContent(value: string): JSONContent | string {
  if (!value || value.trim().length === 0) {
    return ''
  }

  try {
    const parsed = JSON.parse(value)

    // Validate that it's a valid Tiptap JSON structure
    if (parsed && typeof parsed === 'object' && 'type' in parsed) {
      return parsed as JSONContent
    }

    // If it doesn't have the expected structure, return empty to avoid errors
    console.warn('Invalid Tiptap JSON format, using empty content')
    return ''
  } catch (error) {
    // If parsing fails, return empty content
    console.warn('Failed to parse content as JSON:', error)
    return ''
  }
}

export function QuillEditor({
  value,
  onChange,
  readonly = false,
  placeholder = 'اكتب الملاحظات هنا...',
  className = '',
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: parseContent(value),
    editable: !readonly,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      const jsonString = JSON.stringify(json)
      onChange?.(jsonString)
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  // Update editor content when value changes externally
  useEffect(() => {
    if (!editor) return

    const currentContent = JSON.stringify(editor.getJSON())
    const newContent = value || '{}'

    // Only update if content has actually changed
    if (currentContent !== newContent) {
      editor.commands.setContent(parseContent(value))
    }
  }, [editor, value])

  if (readonly) {
    return (
      <div className={`tiptap-readonly ${className}`} dir="rtl">
        <style jsx global>{`
          .tiptap-readonly .ProseMirror {
            outline: none;
            direction: rtl;
            text-align: right;
          }
          .tiptap-readonly .ProseMirror * {
            unicode-bidi: plaintext;
          }
          .tiptap-readonly .ProseMirror p {
            margin: 0.5em 0;
            line-height: 1.6;
          }
          .tiptap-readonly .ProseMirror h1,
          .tiptap-readonly .ProseMirror h2,
          .tiptap-readonly .ProseMirror h3 {
            font-weight: bold;
            margin: 1em 0 0.5em 0;
          }
          .tiptap-readonly .ProseMirror h1 {
            font-size: 1.5em;
          }
          .tiptap-readonly .ProseMirror h2 {
            font-size: 1.3em;
          }
          .tiptap-readonly .ProseMirror h3 {
            font-size: 1.1em;
          }
          .tiptap-readonly .ProseMirror strong {
            font-weight: bold;
          }
          .tiptap-readonly .ProseMirror em {
            font-style: italic;
          }
          .tiptap-readonly .ProseMirror ul,
          .tiptap-readonly .ProseMirror ol {
            padding-right: 1.5em;
            margin: 0.5em 0;
          }
          .tiptap-readonly .ProseMirror li {
            margin: 0.25em 0;
          }
          .tiptap-readonly .ProseMirror a {
            color: hsl(var(--primary));
            text-decoration: underline;
          }
          /* Text selection styling - only within ProseMirror editor */
          .tiptap-readonly .ProseMirror::selection {
            background-color: rgba(0, 123, 255, 0.3);
          }
          .tiptap-readonly .ProseMirror *::selection {
            background-color: rgba(0, 123, 255, 0.3);
          }
          .tiptap-readonly .ProseMirror::-moz-selection {
            background-color: rgba(0, 123, 255, 0.3);
          }
          .tiptap-readonly .ProseMirror *::-moz-selection {
            background-color: rgba(0, 123, 255, 0.3);
          }
          /* ProseMirror node selection */
          .tiptap-readonly .ProseMirror-selectednode {
            outline: 2px solid hsl(var(--primary));
            background-color: hsl(var(--primary) / 0.1);
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    )
  }

  return (
    <div className={`tiptap-editor border rounded-md ${className}`} dir="rtl">
      <style jsx global>{`
        .tiptap-editor .ProseMirror {
          outline: none;
          direction: rtl;
          text-align: right;
          caret-color: currentColor;
          position: relative;
        }
        .tiptap-editor .ProseMirror * {
          unicode-bidi: plaintext;
        }
        .tiptap-editor .ProseMirror p {
          margin: 0.5em 0;
          line-height: 1.6;
        }
        .tiptap-editor .ProseMirror h1,
        .tiptap-editor .ProseMirror h2,
        .tiptap-editor .ProseMirror h3 {
          font-weight: bold;
          margin: 1em 0 0.5em 0;
        }
        .tiptap-editor .ProseMirror h1 {
          font-size: 1.5em;
        }
        .tiptap-editor .ProseMirror h2 {
          font-size: 1.3em;
        }
        .tiptap-editor .ProseMirror h3 {
          font-size: 1.1em;
        }
        .tiptap-editor .ProseMirror strong {
          font-weight: bold;
        }
        .tiptap-editor .ProseMirror em {
          font-style: italic;
        }
        .tiptap-editor .ProseMirror ul,
        .tiptap-editor .ProseMirror ol {
          padding-right: 1.5em;
          margin: 0.5em 0;
        }
        .tiptap-editor .ProseMirror li {
          margin: 0.25em 0;
        }
        .tiptap-editor .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        /* Text selection styling - only within ProseMirror editor */
        .tiptap-editor .ProseMirror::selection {
          background-color: rgba(0, 123, 255, 0.3);
        }
        .tiptap-editor .ProseMirror *::selection {
          background-color: rgba(0, 123, 255, 0.3);
        }
        .tiptap-editor .ProseMirror::-moz-selection {
          background-color: rgba(0, 123, 255, 0.3);
        }
        .tiptap-editor .ProseMirror *::-moz-selection {
          background-color: rgba(0, 123, 255, 0.3);
        }
        /* ProseMirror node selection */
        .tiptap-editor .ProseMirror-selectednode {
          outline: 2px solid hsl(var(--primary));
          background-color: hsl(var(--primary) / 0.1);
        }
        /* Focus state */
        .tiptap-editor .ProseMirror-focused {
          outline: none;
        }
        /* Placeholder styling */
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: hsl(var(--muted-foreground));
          content: attr(data-placeholder);
          float: right;
          height: 0;
          pointer-events: none;
        }
      `}</style>
      {/* Toolbar */}
      {editor && (
        <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/50">
          {/* Headings */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Text formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'bg-muted' : ''}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Alignment */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Link */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={editor.isActive('link') ? 'bg-muted' : ''}
          >
            <Link2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Editor content */}
      <div className="prose prose-sm max-w-none p-4 min-h-[300px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

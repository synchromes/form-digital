import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useState } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { ResizableNodeView } from './extensions/ResizableNodeView'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  ListChecks,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Space,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Link as LinkIcon,
  Unlink,
  Palette,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  RemoveFormatting,
  Table as TableIcon,
  Columns,
  Rows,
  Trash2,
  Plus,
  Square,
  SquareDashed,
  Undo,
  Redo
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Tulis template dokumen di sini...'
}: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // Disable built-in extensions we're adding separately
        strike: false, // Adding separately below
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Underline,
      Strike,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: null, // Allow dynamic class assignment
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            class: {
              default: null,
              parseHTML: element => element.getAttribute('class'),
              renderHTML: attributes => {
                if (!attributes.class) {
                  return {}
                }
                return {
                  class: attributes.class,
                }
              },
            },
          }
        },
      }),
      TableRow,
      TableHeader.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            height: {
              default: null,
              parseHTML: element => element.style.height || null,
              renderHTML: attributes => {
                if (!attributes.height) {
                  return {}
                }
                return {
                  style: `height: ${attributes.height} `,
                }
              },
            },
          }
        },
        addNodeView() {
          return ({ node, view, getPos, editor }) => {
            return new ResizableNodeView(node, view, getPos as () => number, editor)
          }
        }
      }),
      TableCell.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            height: {
              default: null,
              parseHTML: element => element.style.height || null,
              renderHTML: attributes => {
                if (!attributes.height) {
                  return {}
                }
                return {
                  style: `height: ${attributes.height} `,
                }
              },
            },
          }
        },
        addNodeView() {
          return ({ node, view, getPos, editor }) => {
            return new ResizableNodeView(node, view, getPos as () => number, editor)
          }
        }
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
        style: 'font-family: Times New Roman, serif; font-size: 12pt; line-height: 1.6; white-space: pre-wrap; tab-size: 20mm;'
      },
      handleKeyDown: (view, event) => {
        // Handle Tab key in tables
        if (event.key === 'Tab') {
          if (editor?.isActive('table')) {
            return false // Let table handle tab navigation
          }
          event.preventDefault()
          const spaces = '\u00A0\u00A0\u00A0\u00A0'
          editor?.commands.insertContent(spaces)
          return true
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title
  }: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p - 2 rounded hover: bg - gray - 100 transition - colors disabled: opacity - 30 disabled: cursor - not - allowed ${active ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
        } `}
      title={title}
    >
      {children}
    </button>
  )

  const addLink = () => {
    const url = prompt('Masukkan URL:', 'https://')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const toggleTableBorder = () => {
    // Get current table attributes
    const currentAttrs = editor.getAttributes('table')
    const currentClass = currentAttrs.class || ''

    // Toggle borderless-table class
    let newClass = ''
    if (currentClass.includes('borderless-table')) {
      // Remove borderless-table class
      newClass = currentClass.replace(/\s*borderless-table\s*/g, '').trim()
    } else {
      // Add borderless-table class
      newClass = currentClass ? `${currentClass} borderless - table`.trim() : 'borderless-table'
    }

    // Update table attributes using TipTap commands
    editor.chain().focus().updateAttributes('table', {
      class: newClass || null
    }).run()
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Add custom styles */}
      <style jsx global>{`
  .ProseMirror p { margin - bottom: 1rem; }
        .ProseMirror br { display: block; margin: 0.5rem 0; }
        .ProseMirror table { border - collapse: collapse; width: auto; margin: 1rem 0; }
        .ProseMirror td, .ProseMirror th {
  border: 1px solid #d1d5db;
  padding: 8px 12px;
  min - width: 50px;
  height: 40px;
  position: relative;
  vertical - align: top;
}
        .ProseMirror th { background - color: #f3f4f6; font - weight: bold; }
        .ProseMirror.borderless - table td,
        .ProseMirror.borderless - table th {
  border: none!important;
}
        .ProseMirror blockquote {
  border - left: 3px solid #d1d5db;
  padding - left: 1rem;
  margin - left: 0;
  font - style: italic;
  color: #6b7280;
}
        .ProseMirror code {
  background - color: #f3f4f6;
  padding: 2px 4px;
  border - radius: 3px;
  font - family: monospace;
  font - size: 0.9em;
}
        .ProseMirror pre {
  background - color: #1f2937;
  color: #f3f4f6;
  padding: 1rem;
  border - radius: 0.5rem;
  overflow - x: auto;
}
        .ProseMirror pre code {
  background: none;
  color: inherit;
  padding: 0;
}
        .ProseMirror hr {
  border: none;
  border - top: 2px solid #d1d5db;
  margin: 2rem 0;
}
        .ProseMirror ul[data - type= "taskList"] {
  list - style: none;
  padding - left: 0;
}
        .ProseMirror ul[data - type= "taskList"] li {
  display: flex;
  align - items: flex - start;
}
        .ProseMirror ul[data - type= "taskList"] li input[type = "checkbox"] {
  margin - right: 0.5rem;
  margin - top: 0.25rem;
}
        .ProseMirror h1 { font - size: 2em; font - weight: bold; margin: 1rem 0 0.5rem; }
        .ProseMirror h2 { font - size: 1.5em; font - weight: bold; margin: 1rem 0 0.5rem; }
        .ProseMirror h3 { font - size: 1.25em; font - weight: bold; margin: 1rem 0 0.5rem; }
`}</style>

      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        {/* Font Selection */}
        <select
          className="h-8 px-2 text-sm border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          value={editor.getAttributes('textStyle').fontFamily || ''}
        >
          <option value="" disabled>Font</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Times New Roman, serif">Times New Roman</option>
          <option value="Courier New, monospace">Courier New</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Verdana, sans-serif">Verdana</option>
          <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
          <option value="Impact, sans-serif">Impact</option>
          <option value="'Gotham Light', sans-serif">Gotham Light</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive('taskList')}
          title="Task List (Checklist)"
        >
          <ListChecks className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Colors */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            active={showColorPicker}
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </ToolbarButton>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-10 grid grid-cols-5 gap-1">
              {['#000000', '#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#c026d3'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(color).run()
                    setShowColorPicker(false)
                  }}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run()
                  setShowColorPicker(false)
                }}
                className="col-span-5 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <ToolbarButton
            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
            active={showHighlightPicker || editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-10 grid grid-cols-5 gap-1">
              {['#fef08a', '#fed7aa', '#fecaca', '#ddd6fe', '#bae6fd', '#bbf7d0'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color }).run()
                    setShowHighlightPicker(false)
                  }}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run()
                  setShowHighlightPicker(false)
                }}
                className="col-span-5 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Links */}
        <ToolbarButton
          onClick={addLink}
          active={editor.isActive('link')}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          title="Remove Link"
        >
          <Unlink className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Other formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Line"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          active={editor.isActive('subscript')}
          title="Subscript"
        >
          <SubscriptIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          active={editor.isActive('superscript')}
          title="Superscript"
        >
          <SuperscriptIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            const spaces = '\u00A0\u00A0\u00A0\u00A0'
            editor.chain().focus().insertContent(spaces).run()
          }}
          title="Insert Spacing (Tab)"
        >
          <Space className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Table */}
        <ToolbarButton
          onClick={() => {
            const cols = prompt('Jumlah kolom:', '2')
            const rows = prompt('Jumlah baris:', '4')
            if (cols && rows) {
              editor.chain().focus().insertTable({
                rows: parseInt(rows) || 4,
                cols: parseInt(cols) || 2,
                withHeaderRow: false
              }).run()
            }
          }}
          active={editor.isActive('table')}
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>

        {/* Table manipulation - only show when inside table */}
        {editor.isActive('table') && (
          <>
            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              title="Tambah Kolom (Kiri)"
            >
              <Plus className="w-3 h-3" />
              <Columns className="w-3 h-3" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Tambah Kolom (Kanan)"
            >
              <Columns className="w-3 h-3" />
              <Plus className="w-3 h-3" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Hapus Kolom"
            >
              <Columns className="w-3 h-3" />
              <Trash2 className="w-3 h-3" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().addRowBefore().run()}
              title="Tambah Baris (Atas)"
            >
              <Plus className="w-3 h-3" />
              <Rows className="w-3 h-3" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Tambah Baris (Bawah)"
            >
              <Rows className="w-3 h-3" />
              <Plus className="w-3 h-3" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Hapus Baris"
            >
              <Rows className="w-3 h-3" />
              <Trash2 className="w-3 h-3" />
            </ToolbarButton>

            <ToolbarButton
              onClick={toggleTableBorder}
              title="Toggle Garis Table"
            >
              {(editor.getAttributes('table').class || '').includes('borderless-table') ? (
                <Square className="w-4 h-4" />
              ) : (
                <SquareDashed className="w-4 h-4" />
              )}
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Hapus Table"
            >
              <TableIcon className="w-3 h-3" />
              <Trash2 className="w-3 h-3" />
            </ToolbarButton>
          </>
        )}

        <div className="w-px bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  )
}

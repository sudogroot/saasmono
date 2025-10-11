'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import 'quill/dist/quill.snow.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface QuillEditorProps {
  value: string
  onChange?: (value: string) => void
  readonly?: boolean
  placeholder?: string
  className?: string
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link'],
    ['clean'],
  ],
}

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'align',
  'link',
]

export function QuillEditor({
  value,
  onChange,
  readonly = false,
  placeholder = 'اكتب الملاحظات هنا...',
  className = '',
}: QuillEditorProps) {
  if (readonly) {
    return (
      <div className={`quill-readonly ${className}`}>
        <ReactQuill
          value={value || ''}
          readOnly={true}
          theme="bubble"
          modules={{ toolbar: false }}
        />
      </div>
    )
  }

  return (
    <div className={`quill-editor ${className}`}>
      <ReactQuill
        value={value || ''}
        onChange={onChange}
        theme="snow"
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  )
}

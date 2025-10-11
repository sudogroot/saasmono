'use client'

import { useState, KeyboardEvent } from 'react'
import { Input, Button } from '@repo/ui'
import { X, Plus } from 'lucide-react'

interface KeywordsInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function KeywordsInput({
  value,
  onChange,
  placeholder = 'أضف كلمة مفتاحية...',
  disabled = false,
}: KeywordsInputProps) {
  const [inputValue, setInputValue] = useState('')

  // Parse keywords from comma-separated string
  const keywords = value
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0)

  const addKeyword = () => {
    const newKeyword = inputValue.trim()
    if (!newKeyword) return

    // Check if already exists
    if (keywords.some((k) => k.toLowerCase() === newKeyword.toLowerCase())) {
      setInputValue('')
      return
    }

    const newKeywords = [...keywords, newKeyword]
    onChange(newKeywords.join(','))
    setInputValue('')
  }

  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index)
    onChange(newKeywords.join(','))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    } else if (e.key === 'Backspace' && inputValue === '' && keywords.length > 0) {
      // Remove last keyword on backspace when input is empty
      removeKeyword(keywords.length - 1)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addKeyword}
          disabled={disabled || !inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
            >
              <span>{keyword}</span>
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                disabled={disabled}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

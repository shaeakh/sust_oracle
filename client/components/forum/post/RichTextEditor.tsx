import React from 'react'
import { Textarea } from "@/components/ui/textarea"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onKeyPress: () => void
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, onKeyPress }) => {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={onKeyPress}
      placeholder="Write your post..."
      className="min-h-[100px]"
    />
  )
}


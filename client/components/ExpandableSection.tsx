'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Edit2, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ExpandableSectionProps {
  title: string
  items: string[]
  onEdit: (index: number, value: string) => void
}

export default function ExpandableSection({ title, items, onEdit }: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [tempValue, setTempValue] = useState('')

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setTempValue(items[index])
  }

  const handleSave = (index: number) => {
    onEdit(index, tempValue)
    setEditingIndex(null)
  }

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden">
      <motion.button
        className="w-full p-4 flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ backgroundColor: '#e5e7eb' }}
      >
        <span className="font-medium text-gray-800">{title}</span>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ul className="p-4 space-y-2">
              {items.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-gray-700 flex items-center justify-between"
                >
                  {editingIndex === index ? (
                    <>
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="mr-2"
                      />
                      <Button onClick={() => handleSave(index)} size="sm">
                        <Save className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span>{item}</span>
                      <Button onClick={() => handleEdit(index)} size="sm" variant="ghost">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


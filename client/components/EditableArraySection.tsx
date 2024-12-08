"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Edit, Plus, X } from "lucide-react";
import { useState } from "react";

interface EditableArraySectionProps {
  title: string;
  items: string[];
  onUpdate: (newArray: string[]) => void;
}

export default function EditableArraySection({
  title,
  items,
  onUpdate,
}: EditableArraySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleAdd = () => {
    if (newItem.trim()) {
      onUpdate([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemove = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
  };

  const handleSave = (index: number) => {
    const newItems = [...items];
    newItems[index] = editingValue;
    onUpdate(newItems);
    setEditingIndex(null);
  };

  return (
    <div className="bg-gray-100/75 rounded-lg overflow-hidden">
      <motion.button
        className="w-full p-4 flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ backgroundColor: "rgba(229, 231, 235, 0.75)" }}
      >
        <span className="font-medium text-gray-800">{title}</span>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
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
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2 bg-white/75 p-2 rounded"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(index)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {editingIndex === index ? (
                    <div className="flex-1 flex items-center space-x-2">
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={() => handleSave(index)} size="sm">
                        Save
                      </Button>
                    </div>
                  ) : (
                    <span className="flex-1">{item}</span>
                  )}
                  <Button
                    onClick={() => handleRemove(index)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.li>
              ))}
            </ul>
            <div className="p-4 flex space-x-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={`Add new ${title.toLowerCase()}`}
              />
              <Button onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

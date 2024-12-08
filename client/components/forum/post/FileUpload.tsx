import React from 'react'
import { Button } from "@/components/ui/button"
import { Upload } from 'lucide-react'

interface FileUploadProps {
  onFileChange: (file: File | null) => void
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null
    onFileChange(file)
  }

  return (
    <div>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </label>
    </div>
  )
}


"use client"

import React from "react"
import { Upload } from "lucide-react" // npm install lucide-react if not already

interface FileUploadProps {
  id: string
  file: File | null
  setFile: (file: File | null) => void
  label?: string
  styles?: string // additional custom className
}

export default function FileUploadComponent({
  id,
  file,
  setFile,
  label,
  styles = "",
}: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
  }

  return (
    <div
      className={`w-full flex flex-col items-center border rounded-lg p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition ${styles}`}
      onClick={() => document.getElementById(id)?.click()}
    >
      {/* {label && <p className="text-sm mb-2 font-medium text-gray-700">{label}</p>} */}

      {/* Upload Box — smaller by default */}
      <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-white overflow-hidden">
        {file ? (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <Upload className="text-gray-400" size={28} />
        )}
      </div>

      <p className="text-xs mt-2 text-gray-500 text-center">
        Click to upload image
      </p>

      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {file && (
        <p className="text-xs text-gray-600 truncate mt-2">{file.name}</p>
      )}
    </div>
  )
}

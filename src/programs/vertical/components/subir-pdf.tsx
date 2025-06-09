'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAtom } from 'jotai'
import { FileText, Trash2, Upload } from 'lucide-react'
import { pdfAtom } from '../store/pdf'
import { pdfStateAtom } from '../store/pdf/input_pdf'
import { useDropzone } from 'react-dropzone'

interface Signature {
  id: string
  name: string
  imageUrl: string
}

interface AppliedSignature extends Signature {
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
  configured: boolean
}

interface PDFFile {
  name: string
  size: string
  pages: number
}

export default function SubirPdf() {
  const [pdfState, setPdfState] = useAtom(pdfStateAtom)

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Crear URL para previsualización
    const fileUrl = URL.createObjectURL(file)

    // Actualizar el estado del PDF
    setPdfState({
      file: file,
      url: fileUrl,
      name: file.name,
      size: file.size,
      pageCount: null, // Se actualizará después con pdf.js
      loaded: false,
      error: null,
      uploadDate: new Date(),
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            1
          </div>
          Subir documento PDF
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!pdfState?.file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {isDragActive
                ? 'Suelta el archivo aquí...'
                : 'Arrastra tu PDF aquí o haz clic para seleccionar'}
            </p>
            <Button type="button">Seleccionar PDF</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-green-900">{pdfState.name}</p>
                <p className="text-sm text-green-700">
                  {(pdfState.size / 1024 / 1024).toFixed(2)} MB
                  {pdfState.pageCount && ` • ${pdfState.pageCount} páginas`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Button variant="outline" size="sm">
                  Cambiar
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPdfState({
                    file: null,
                    url: null,
                    name: '',
                    size: 0,
                    pageCount: null,
                    loaded: false,
                    error: null,
                    uploadDate: null,
                  })
                }
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

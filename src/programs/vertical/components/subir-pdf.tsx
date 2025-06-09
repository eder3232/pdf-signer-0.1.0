'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAtom } from 'jotai'
import { FileText, Trash2, Upload } from 'lucide-react'
import { pdfAtom } from '../store/pdf'
import { pdfStateAtom } from '../store/pdf/input_pdf'

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
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
        {!pdfState ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Arrastra tu PDF aquí o haz clic para seleccionar
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload">
              <Button className="cursor-pointer">Seleccionar PDF</Button>
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-green-900">{pdfState.name}</p>
                <p className="text-sm text-green-700">
                  {pdfState.size} • {pdfState.pageCount} páginas
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById('pdf-upload-change')?.click()
                }
              >
                Cambiar
              </Button>
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
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-upload-change"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

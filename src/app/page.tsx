import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Table } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ¿Cómo deseas firmar tu documento?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Elige el modo de firma que mejor se adapte a tu tipo de documento
            PDF
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Modo 1 - Firmar todas las hojas */}
          <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
            <CardHeader className="text-center pb-4">
              {/* Ilustración Modo 1 */}
              <div className="mx-auto mb-4 relative">
                <div className="w-24 h-32 bg-white border-2 border-gray-300 rounded-lg shadow-sm relative">
                  {/* Líneas de texto simuladas */}
                  <div className="p-3 space-y-1">
                    <div className="h-1 bg-gray-200 rounded w-full"></div>
                    <div className="h-1 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-1 bg-gray-200 rounded w-full"></div>
                    <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  {/* Estrella en esquina */}
                  <div className="absolute bottom-2 right-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Firmar todas las hojas
              </CardTitle>
              <CardDescription className="text-gray-600">
                Aplica una misma firma a todas las hojas A4 verticales del PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  ✅ Firma única
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  ✅ Ideal para informes simples
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  ✅ Solo hojas A4 verticales
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/modo/vertical" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Seleccionar modo
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Modo 2 - Firmar intermedias + última hoja diferente */}
          <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white relative">
            {/* Badge recomendado */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-3 py-1">
                ⭐ Recomendado
              </Badge>
            </div>
            <CardHeader className="text-center pb-4 pt-8">
              {/* Ilustración Modo 2 */}
              <div className="mx-auto mb-4 flex gap-2">
                {/* Primera hoja - con líneas y firma discreta */}
                <div className="w-20 h-28 bg-white border-2 border-gray-300 rounded-lg shadow-sm relative">
                  <div className="p-2 space-y-1">
                    <div className="h-1 bg-gray-200 rounded w-full"></div>
                    <div className="h-1 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-1 bg-gray-200 rounded w-full"></div>
                    <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  {/* Firma discreta en el medio */}
                  <div className="absolute top-1/2 right-1 transform -translate-y-1/2">
                    <div className="w-2 h-1 bg-blue-400 rounded"></div>
                  </div>
                </div>
                {/* Segunda hoja - casi vacía con firma visible */}
                <div className="w-20 h-28 bg-white border-2 border-gray-300 rounded-lg shadow-sm relative">
                  <div className="p-2">
                    <div className="h-1 bg-gray-100 rounded w-3/4 mb-1"></div>
                    <div className="h-1 bg-gray-100 rounded w-1/2"></div>
                  </div>
                  {/* Firma más visible abajo */}
                  <div className="absolute bottom-2 right-2">
                    <div className="w-4 h-2 bg-blue-600 rounded"></div>
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Firmar intermedias + última hoja
              </CardTitle>
              <CardDescription className="text-gray-600">
                Aplica una firma simple en todas las hojas excepto la última,
                que se firma con sello completo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  ✅ Firma doble configuración
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  ✅ Ideal para expedientes oficiales
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  ✅ Solo hojas A4 verticales
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/modo/intermedio-final" className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Seleccionar modo
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Modo 3 - Firmar hojas horizontales */}
          <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
            <CardHeader className="text-center pb-4">
              {/* Ilustración Modo 3 */}
              <div className="mx-auto mb-4">
                <div className="w-32 h-24 bg-white border-2 border-gray-300 rounded-lg shadow-sm relative">
                  {/* Líneas tipo tabla */}
                  <div className="p-2 space-y-1">
                    <div className="flex gap-1">
                      <div className="h-1 bg-gray-300 rounded flex-1"></div>
                      <div className="h-1 bg-gray-300 rounded flex-1"></div>
                      <div className="h-1 bg-gray-300 rounded flex-1"></div>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-1 bg-gray-200 rounded flex-1"></div>
                      <div className="h-1 bg-gray-200 rounded flex-1"></div>
                      <div className="h-1 bg-gray-200 rounded flex-1"></div>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-1 bg-gray-200 rounded flex-1"></div>
                      <div className="h-1 bg-gray-200 rounded flex-1"></div>
                      <div className="h-1 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                  {/* Firma en esquina */}
                  <div className="absolute bottom-1 right-2">
                    <Table className="w-3 h-3 text-blue-500" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Firmar hojas horizontales
              </CardTitle>
              <CardDescription className="text-gray-600">
                Aplica la misma firma a todas las hojas A4 horizontales del PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  ✅ Firmas en planos técnicos
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  ✅ Compatible con tablas
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  ✅ Solo hojas A4 horizontales
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/modo/horizontal" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Seleccionar modo
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Footer info */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            PDFSigner - Firma digital profesional para todos tus documentos
          </p>
        </div>
      </div>
    </div>
  )
}

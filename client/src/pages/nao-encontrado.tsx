import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NaoEncontrado() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: "hsl(152, 30%, 97%)" }}>
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardContent className="pt-8 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">404</h1>
              <p className="text-xl font-semibold text-gray-700 mt-1">Página não encontrada</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            A página que você está tentando acessar não existe ou foi movida.
          </p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Voltar ao início
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

import { Layout } from "@/components/layout";
import { useUsers } from "@/hooks/use-users";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TechniciansPage() {
  const { data: users, isLoading } = useUsers();

  const technicians = users?.filter(u => u.role === 'technician' || u.role === 'almoxarifado') || [];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Equipe e Técnicos</h1>
        <p className="text-muted-foreground mt-1">Servidores disponíveis para escalação nos Itinerantes.</p>
      </div>

      <Card className="shadow-lg border-border/50 overflow-hidden bg-card">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : technicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-20" />
            <p>Nenhum técnico cadastrado no sistema.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="font-semibold text-foreground">Nome do Servidor</TableHead>
                <TableHead className="font-semibold text-foreground">Usuário de Rede</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Lotação / Cargo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((user) => (
                <TableRow key={user.id} className="hover:bg-secondary/10 transition-colors">
                  <TableCell className="font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    {user.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.username}</TableCell>
                  <TableCell className="text-right">
                    {user.role === 'technician' ? (
                      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Técnico de TI</Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">Almoxarifado</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </Layout>
  );
}

import { Layout } from "@/components/layout";
import { useUsers } from "@/hooks/use-users";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TechniciansPage() {
  const { data: users, isLoading } = useUsers();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createUser = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDialogOpen(false);
      toast({ title: "Sucesso", description: "Técnico cadastrado com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Ocorreu um erro ao cadastrar.", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createUser.mutate({
      name: formData.get("name") as string,
      username: formData.get("username") as string,
      password: "password", // default password
      role: formData.get("role") as string,
    });
  };

  const technicians = users?.filter(u => ['technician', 'defender', 'advisor', 'almoxarifado'].includes(u.role)) || [];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipe e Técnicos</h1>
          <p className="text-muted-foreground mt-1">Servidores disponíveis para escalação nos Itinerantes.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Servidor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Novo Servidor</DialogTitle>
                <DialogDescription>
                  Adicione um novo técnico ou servidor de almoxarifado à equipe.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-5 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" name="name" placeholder="Ex: Carlos Silva" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Usuário de Rede</Label>
                  <Input id="username" name="username" placeholder="Ex: carlos.silva" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Lotação / Cargo</Label>
                  <Select name="role" defaultValue="technician">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technician">Técnico de TI</SelectItem>
                      <SelectItem value="defender">Defensor(a)</SelectItem>
                      <SelectItem value="advisor">Assessor(a)</SelectItem>
                      <SelectItem value="almoxarifado">Almoxarifado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                    {user.role === 'technician' && (
                      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Técnico de TI</Badge>
                    )}
                    {user.role === 'defender' && (
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">Defensor(a)</Badge>
                    )}
                    {user.role === 'advisor' && (
                      <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">Assessor(a)</Badge>
                    )}
                    {user.role === 'almoxarifado' && (
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

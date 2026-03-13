import { Layout } from "@/components/layout";
import { useUsers } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, Plus, Pencil, Trash2, ShieldCheck, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TablePager, usePagination } from "@/components/table-pager";
import type { User } from "@shared/schema";

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; className: string }> = {
    technician: { label: "Técnico de TI", className: "border-blue-200 text-blue-700 bg-blue-50" },
    defender: { label: "Defensor(a)", className: "border-emerald-200 text-emerald-700 bg-emerald-50" },
    advisor: { label: "Assessor(a)", className: "border-purple-200 text-purple-700 bg-purple-50" },
    almoxarifado: { label: "Almoxarifado", className: "border-amber-200 text-amber-700 bg-amber-50" },
  };
  const info = map[role] ?? { label: role, className: "" };
  return <Badge variant="outline" className={info.className}>{info.label}</Badge>;
}

function UserRow({ user, onEdit, onDelete }: { user: User; onEdit: (u: User) => void; onDelete: (id: number) => void }) {
  return (
    <TableRow className="hover:bg-secondary/10 transition-colors">
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          {user.name}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">{user.username}</TableCell>
      <TableCell><RoleBadge role={user.role} /></TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(user)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover servidor?</AlertDialogTitle>
                <AlertDialogDescription>
                  {user.name} será removido do sistema. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(user.id)}
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

function TeamTable({ 
  users, title, description, icon: Icon, headerClass, emptyMsg,
  page, pageSize, setPage, setPageSize
}: {
  users: User[];
  title: string;
  description: string;
  icon: any;
  headerClass: string;
  emptyMsg: string;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;
}) {
  const [editUser, setEditUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateUser = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditUser(null);
      toast({ title: "Atualizado", description: "Servidor atualizado." });
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/users/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Removido", description: "Servidor removido." });
    }
  });

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateUser.mutate({ id: editUser!.id, name: fd.get("name") as string, username: fd.get("username") as string, role: fd.get("role") as string });
  };

  const start = (page - 1) * pageSize;
  const pagedUsers = users.slice(start, start + pageSize);

  return (
    <Card className="shadow-lg border-border/50 overflow-hidden">
      <CardHeader className={`${headerClass} border-b pb-4`}>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 text-muted-foreground">
            <Users className="h-7 w-7 mb-2 opacity-20" />
            <p className="text-sm italic">{emptyMsg}</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Usuário de Rede</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedUsers.map(u => (
                  <UserRow key={u.id} user={u} onEdit={setEditUser} onDelete={(id) => deleteUser.mutate(id)} />
                ))}
              </TableBody>
            </Table>
            <TablePager total={users.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
          </>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <form onSubmit={handleEdit} key={editUser?.id}>
            <DialogHeader>
              <DialogTitle>Editar Servidor</DialogTitle>
              <DialogDescription>Atualize as informações do servidor.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" defaultValue={editUser?.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Usuário de Rede</Label>
                <Input id="username" name="username" defaultValue={editUser?.username} required />
              </div>
              <div className="grid gap-2">
                <Label>Cargo</Label>
                <Select name="role" defaultValue={editUser?.role}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function TechniciansPage() {
  const { data: users, isLoading } = useUsers();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const legalPager = usePagination(10);
  const techPager = usePagination(10);

  const createUser = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateOpen(false);
      toast({ title: "Cadastrado", description: "Servidor adicionado com sucesso." });
    },
    onError: () => toast({ title: "Erro", description: "Não foi possível cadastrar.", variant: "destructive" })
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createUser.mutate({
      name: fd.get("name") as string,
      username: fd.get("username") as string,
      password: "password",
      role: fd.get("role") as string,
    });
  };

  const legalTeam = users?.filter(u => ['defender', 'advisor'].includes(u.role)) || [];
  const techTeam = users?.filter(u => ['technician', 'almoxarifado'].includes(u.role)) || [];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipe e Servidores</h1>
          <p className="text-muted-foreground mt-1">Defensores, assessores e técnicos disponíveis para escalação.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Servidor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Novo Servidor</DialogTitle>
                <DialogDescription>Adicione um defensor, assessor ou técnico à equipe.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nome Completo</Label>
                  <Input name="name" placeholder="Ex: Carlos Silva" required />
                </div>
                <div className="grid gap-2">
                  <Label>Usuário de Rede</Label>
                  <Input name="username" placeholder="Ex: carlos.silva" required />
                </div>
                <div className="grid gap-2">
                  <Label>Cargo</Label>
                  <Select name="role" defaultValue="technician">
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          <TeamTable
            users={legalTeam}
            title="Defensores e Assessores"
            description="Membros jurídicos da Defensoria Pública."
            icon={({ className }: any) => <ShieldCheck className={`${className} text-emerald-600`} />}
            headerClass="bg-emerald-50/30"
            emptyMsg="Nenhum defensor ou assessor cadastrado."
            page={legalPager.page} pageSize={legalPager.pageSize}
            setPage={legalPager.setPage} setPageSize={legalPager.setPageSize}
          />
          <TeamTable
            users={techTeam}
            title="Equipe de TI e Apoio"
            description="Técnicos e responsáveis pelo Almoxarifado."
            icon={({ className }: any) => <Cpu className={`${className} text-blue-600`} />}
            headerClass="bg-blue-50/20"
            emptyMsg="Nenhum técnico cadastrado."
            page={techPager.page} pageSize={techPager.pageSize}
            setPage={techPager.setPage} setPageSize={techPager.setPageSize}
          />
        </div>
      )}
    </Layout>
  );
}

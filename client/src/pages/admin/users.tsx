import { Layout } from "@/components/layout";
import { useUsers } from "@/hooks/use-users";
import { useAuth, roleLabel } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, ShieldCheck, UserCog, Users } from "lucide-react";
import type { User } from "@shared/schema";

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "technician", label: "Suporte TI" },
  { value: "almoxarifado", label: "Almoxarifado" },
  { value: "defender", label: "Defensor(a)" },
  { value: "advisor", label: "Assessor(a)" },
];

function roleBadge(role: string) {
  const map: Record<string, string> = {
    admin: "bg-purple-100 text-purple-800 border-purple-200",
    technician: "bg-blue-100 text-blue-800 border-blue-200",
    almoxarifado: "bg-amber-100 text-amber-800 border-amber-200",
    defender: "bg-green-100 text-green-800 border-green-200",
    advisor: "bg-teal-100 text-teal-800 border-teal-200",
  };
  return (
    <Badge variant="outline" className={`${map[role] ?? ""} font-medium`}>
      {roleLabel(role)}
    </Badge>
  );
}

function iniciais(name: string) {
  return name.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
}

type UserFormData = {
  name: string;
  username: string;
  password: string;
  role: string;
};

export default function AdminUsersPage() {
  const { data: users, isLoading } = useUsers();
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<UserFormData>({ name: "", username: "", password: "", role: "technician" });
  const [editForm, setEditForm] = useState<Partial<UserFormData>>({});

  const createUser = useMutation({
    mutationFn: async (data: UserFormData) => {
      const res = await apiRequest("POST", "/api/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateOpen(false);
      setCreateForm({ name: "", username: "", password: "", role: "technician" });
      toast({ title: "Usuário criado", description: "Acesso liberado com sucesso." });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<UserFormData> }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      toast({ title: "Usuário atualizado", description: "Dados salvos com sucesso." });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Usuário removido", description: "Acesso revogado." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível remover o usuário.", variant: "destructive" });
    }
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name || !createForm.username || !createForm.password) return;
    createUser.mutate(createForm);
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    const payload: Partial<UserFormData> = { ...editForm };
    if (!payload.password) delete payload.password;
    updateUser.mutate({ id: editingUser.id, data: payload });
  }

  function openEdit(u: User) {
    setEditingUser(u);
    setEditForm({ name: u.name, username: u.username, password: "", role: u.role });
  }

  const totals = {
    total: users?.length ?? 0,
    admins: users?.filter(u => u.role === "admin").length ?? 0,
    suporte: users?.filter(u => ["technician", "almoxarifado"].includes(u.role)).length ?? 0,
    juridico: users?.filter(u => ["defender", "advisor"].includes(u.role)).length ?? 0,
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-muted-foreground mt-1">Cadastre e gerencie os acessos ao sistema.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="button-new-user"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Cadastrar Usuário</DialogTitle>
                <DialogDescription>Defina os dados de acesso do novo servidor.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-5">
                <div className="grid gap-2">
                  <Label htmlFor="create-name">Nome completo</Label>
                  <Input
                    id="create-name"
                    data-testid="input-create-name"
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: João da Silva"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-username">Login</Label>
                  <Input
                    id="create-username"
                    data-testid="input-create-username"
                    value={createForm.username}
                    onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))}
                    placeholder="Ex: joao.silva"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-password">Senha</Label>
                  <Input
                    id="create-password"
                    data-testid="input-create-password"
                    type="password"
                    value={createForm.password}
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-role">Perfil de acesso</Label>
                  <Select
                    value={createForm.role}
                    onValueChange={v => setCreateForm(f => ({ ...f, role: v }))}
                  >
                    <SelectTrigger data-testid="select-create-role">
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button type="submit" data-testid="button-save-user" disabled={createUser.isPending}>
                  {createUser.isPending ? "Salvando..." : "Criar Usuário"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: totals.total, icon: Users, color: "text-foreground" },
          { label: "Administradores", value: totals.admins, icon: ShieldCheck, color: "text-purple-700" },
          { label: "Suporte / TI", value: totals.suporte, icon: UserCog, color: "text-blue-700" },
          { label: "Defensores / Assessores", value: totals.juridico, icon: Users, color: "text-green-700" },
        ].map(card => (
          <Card key={card.label} className="p-4 flex items-center gap-3">
            <card.icon size={20} className={card.color} />
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Servidor</TableHead>
              <TableHead>Login</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead className="text-right w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Carregando usuários...
                </TableCell>
              </TableRow>
            ) : (users ?? []).map(u => (
              <TableRow key={u.id} data-testid={`row-user-${u.id}`} className="hover:bg-secondary/10">
                <TableCell className="text-muted-foreground text-sm">{u.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-semibold text-green-800" style={{ backgroundColor: "hsl(152, 60%, 85%)" }}>
                        {iniciais(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {u.name}
                      {u.id === me?.id && (
                        <span className="ml-2 text-xs text-muted-foreground italic">(você)</span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">{u.username}</TableCell>
                <TableCell>{roleBadge(u.role)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      data-testid={`button-edit-user-${u.id}`}
                      onClick={() => openEdit(u)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          data-testid={`button-delete-user-${u.id}`}
                          disabled={u.id === me?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O acesso de <strong>{u.name}</strong> será revogado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteUser.mutate(u.id)}
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog de edição */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>Altere os dados de {editingUser?.name}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-5">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome completo</Label>
                <Input
                  id="edit-name"
                  value={editForm.name ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-username">Login</Label>
                <Input
                  id="edit-username"
                  value={editForm.username ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">
                  Nova senha
                  <span className="text-muted-foreground font-normal ml-1 text-xs">(deixe em branco para manter)</span>
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editForm.password ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Perfil de acesso</Label>
                <Select
                  value={editForm.role ?? "technician"}
                  onValueChange={v => setEditForm(f => ({ ...f, role: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

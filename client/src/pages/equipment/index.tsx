import { Layout } from "@/components/layout";
import { useEquipmentList, useCreateEquipment, useUpdateEquipment } from "@/hooks/use-equipment";
import { Card, CardContent } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Search, Monitor, Package, Pencil, Trash2, Upload, FileSpreadsheet } from "lucide-react";
import { useRef, useState } from "react";
import { GlobalEquipmentStatusBadge } from "@/components/status-badges";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TablePager, usePagination } from "@/components/table-pager";
import type { Equipment } from "@shared/schema";

export default function EquipmentPage() {
  const { data: equipment, isLoading } = useEquipmentList();
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { page, pageSize, setPage, setPageSize, paginate } = usePagination(10);

  const deleteEquipment = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/equipment/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({ title: "Removido", description: "Equipamento excluído do inventário." });
    }
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createEquipment.mutate({
      name: fd.get("name") as string,
      serialNumber: fd.get("serialNumber") as string,
      status: 'available',
      isBorrowed: false,
      currentLocation: (fd.get("currentLocation") as string) || 'Almoxarifado TI'
    }, { onSuccess: () => setIsCreateOpen(false) });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateEquipment.mutate({
      id: editItem!.id,
      name: fd.get("name") as string,
      serialNumber: fd.get("serialNumber") as string,
      currentLocation: fd.get("currentLocation") as string,
      status: fd.get("status") as any,
    }, { onSuccess: () => setEditItem(null) });
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const text = await file.text();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const dataLines = lines[0]?.toLowerCase().includes("nome") || lines[0]?.toLowerCase().includes("name")
      ? lines.slice(1) : lines;
    let success = 0, errors = 0;
    for (const line of dataLines) {
      const cols = line.split(/[,;]/).map(c => c.trim().replace(/^"|"$/g, ""));
      const [name, serialNumber, currentLocation] = cols;
      if (!name || !serialNumber) { errors++; continue; }
      try {
        await apiRequest("POST", "/api/equipment", { name, serialNumber, status: "available", isBorrowed: false, currentLocation: currentLocation || "Almoxarifado TI" });
        success++;
      } catch { errors++; }
    }
    queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
    setIsImporting(false);
    e.target.value = "";
    toast({ title: "Importação concluída", description: `${success} equipamentos importados.${errors > 0 ? ` ${errors} com erro foram ignorados.` : ""}` });
  };

  const filteredEquipment = (equipment || []).filter(eq => 
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pagedEquipment = paginate(filteredEquipment);

  const equipFields = (defaults?: Equipment) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Descrição / Nome</Label>
        <Input name="name" placeholder="Ex: Notebook Dell Latitude 3420" defaultValue={defaults?.name} required />
      </div>
      <div className="grid gap-2">
        <Label>Número de Série / Patrimônio</Label>
        <Input name="serialNumber" placeholder="Ex: DELL-X8C9D" defaultValue={defaults?.serialNumber} required />
      </div>
      <div className="grid gap-2">
        <Label>Localização Atual</Label>
        <Input name="currentLocation" placeholder="Ex: Almoxarifado TI" defaultValue={defaults?.currentLocation ?? ""} />
      </div>
      {defaults && (
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select name="status" defaultValue={defaults.status}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Disponível</SelectItem>
              <SelectItem value="in_use">Em Uso</SelectItem>
              <SelectItem value="maintenance">Em Manutenção</SelectItem>
              <SelectItem value="borrowed">Emprestado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventário de Equipamentos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os notebooks, impressoras e periféricos.</p>
        </div>

        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCSVImport} />
          <Button variant="outline" className="gap-2" disabled={isImporting} onClick={() => fileInputRef.current?.click()}>
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            {isImporting ? "Importando..." : "Importar CSV"}
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Cadastrar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Novo Equipamento</DialogTitle>
                  <DialogDescription>Insira os dados do equipamento no inventário global.</DialogDescription>
                </DialogHeader>
                {equipFields()}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createEquipment.isPending}>
                    {createEquipment.isPending ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <form onSubmit={handleEdit} key={editItem?.id}>
            <DialogHeader>
              <DialogTitle>Editar Equipamento</DialogTitle>
              <DialogDescription>Atualize os dados do equipamento selecionado.</DialogDescription>
            </DialogHeader>
            {equipFields(editItem ?? undefined)}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditItem(null)}>Cancelar</Button>
              <Button type="submit" disabled={updateEquipment.isPending}>
                {updateEquipment.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSV hint */}
      <Card className="mb-5 border-dashed border-blue-200 bg-blue-50/30 shadow-none">
        <CardContent className="p-3 flex items-center gap-3">
          <Upload className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-600/80">
            Importe sua planilha como <strong>.csv</strong> com colunas: <code className="bg-blue-100 px-1 rounded">Nome, NúmeroDeSérie, Localização</code> (vírgula ou ponto-e-vírgula). A primeira linha pode ser cabeçalho.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Disponíveis", count: equipment?.filter(e => e.status === 'available').length || 0, cls: "bg-emerald-50/50 border-emerald-100 text-emerald-700 bg-emerald-100" },
          { label: "Em Uso", count: equipment?.filter(e => e.status === 'in_use').length || 0, cls: "bg-blue-50/50 border-blue-100 text-blue-700 bg-blue-100" },
          { label: "Manutenção", count: equipment?.filter(e => e.status === 'maintenance').length || 0, cls: "bg-amber-50/50 border-amber-100 text-amber-700 bg-amber-100" },
          { label: "Total", count: equipment?.length || 0, cls: "bg-secondary/30 border-border text-foreground bg-secondary" },
        ].map(item => (
          <div key={item.label} className={`rounded-xl border p-3 flex items-center gap-3 ${item.cls.split(' ').slice(0, 2).join(' ')}`}>
            <div className={`p-2 rounded-full ${item.cls.split(' ').slice(2, 4).join(' ')}`}>
              <Monitor className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold">{item.count}</p>
              <p className="text-xs font-medium opacity-75">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="shadow-lg border-border/50 overflow-hidden bg-card">
        <div className="p-4 border-b bg-secondary/10 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou serial..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-9 bg-background/50 border-transparent focus-visible:border-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Monitor className="h-12 w-12 mb-4 opacity-20" />
            <p>Nenhum equipamento encontrado.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead className="font-semibold text-foreground">Equipamento</TableHead>
                  <TableHead className="font-semibold text-foreground">Serial / Patrimônio</TableHead>
                  <TableHead className="font-semibold text-foreground">Localização</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedEquipment.map((eq) => (
                  <TableRow key={eq.id} className="hover:bg-secondary/10 transition-colors">
                    <TableCell className="font-medium">{eq.name}</TableCell>
                    <TableCell>
                      <span className="bg-secondary px-2 py-1 rounded text-xs font-mono border">{eq.serialNumber}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{eq.currentLocation || "—"}</TableCell>
                    <TableCell>
                      <GlobalEquipmentStatusBadge status={eq.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditItem(eq)}>
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
                              <AlertDialogTitle>Excluir equipamento?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Este equipamento será removido permanentemente do inventário. Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteEquipment.mutate(eq.id)}
                              >
                                Excluir
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
            <TablePager
              total={filteredEquipment.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </Card>
    </Layout>
  );
}

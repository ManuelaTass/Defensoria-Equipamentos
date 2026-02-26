import { Layout } from "@/components/layout";
import { useEquipmentList, useCreateEquipment, useUpdateEquipment } from "@/hooks/use-equipment";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Search, Monitor, Package } from "lucide-react";
import { useState } from "react";
import { GlobalEquipmentStatusBadge } from "@/components/status-badges";

export default function EquipmentPage() {
  const { data: equipment, isLoading } = useEquipmentList();
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createEquipment.mutate({
      name: formData.get("name") as string,
      serialNumber: formData.get("serialNumber") as string,
      status: 'available',
      isBorrowed: false,
      currentLocation: 'Almoxarifado TI'
    }, {
      onSuccess: () => setIsDialogOpen(false)
    });
  };

  const filteredEquipment = equipment?.filter(eq => 
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventário de Equipamentos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os notebooks, impressoras e kits biométricos.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Novo Equipamento</DialogTitle>
                <DialogDescription>
                  Insira os dados do equipamento no inventário global.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-5 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Descrição / Nome do Equipamento</Label>
                  <Input id="name" name="name" placeholder="Ex: Notebook Dell Latitude 3420" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="serialNumber">Número de Série / Patrimônio</Label>
                  <Input id="serialNumber" name="serialNumber" placeholder="Ex: DELL-X8C9D" required />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createEquipment.isPending}>
                  {createEquipment.isPending ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-4 bg-emerald-50/50 border-emerald-100 shadow-sm">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><Monitor className="h-5 w-5"/></div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{equipment?.filter(e => e.status === 'available').length || 0}</p>
            <p className="text-sm font-medium text-emerald-600/80">Disponíveis</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-blue-50/50 border-blue-100 shadow-sm">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Package className="h-5 w-5"/></div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{equipment?.filter(e => e.status === 'in_use').length || 0}</p>
            <p className="text-sm font-medium text-blue-600/80">Em Uso</p>
          </div>
        </Card>
      </div>

      <Card className="shadow-lg border-border/50 overflow-hidden bg-card">
        <div className="p-4 border-b bg-secondary/10 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou serial..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="font-semibold text-foreground">Equipamento</TableHead>
                <TableHead className="font-semibold text-foreground">Serial / Patrimônio</TableHead>
                <TableHead className="font-semibold text-foreground">Status Geral</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Ações Rápida</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.map((eq) => (
                <TableRow key={eq.id} className="hover:bg-secondary/10 transition-colors">
                  <TableCell className="font-medium">{eq.name}</TableCell>
                  <TableCell>
                    <span className="bg-secondary px-2 py-1 rounded text-xs font-mono border">{eq.serialNumber}</span>
                  </TableCell>
                  <TableCell>
                    <GlobalEquipmentStatusBadge status={eq.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Select 
                      value={eq.status} 
                      onValueChange={(val) => updateEquipment.mutate({ id: eq.id, status: val as any })}
                      disabled={updateEquipment.isPending}
                    >
                      <SelectTrigger className="w-[140px] ml-auto h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Marcar Disponível</SelectItem>
                        <SelectItem value="in_use">Marcar Em Uso</SelectItem>
                        <SelectItem value="maintenance">Enviar p/ Manutenção</SelectItem>
                        <SelectItem value="borrowed">Emprestar a Terceiro</SelectItem>
                      </SelectContent>
                    </Select>
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

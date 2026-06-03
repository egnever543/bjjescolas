"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: { name: string };
  branch: { name: string } | null;
};

type Branch = {
  id: string;
  name: string;
};

const addAvisoSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  content: z.string().min(1, "Conteúdo obrigatório"),
  branchId: z.string().optional(),
});

type AddAvisoForm = z.infer<typeof addAvisoSchema>;

function AddAvisoDialog({
  branches,
  onSuccess,
}: {
  branches: Branch[];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddAvisoForm>({
    resolver: zodResolver(addAvisoSchema),
  });

  async function onSubmit(data: AddAvisoForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/avisos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        reset();
        setOpen(false);
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transition-colors z-40">
          <Plus className="w-6 h-6 text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Novo Aviso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-gray-300">Título</Label>
            <Input
              {...register("title")}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Título do aviso"
            />
            {errors.title && (
              <p className="text-red-400 text-xs">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-gray-300">Conteúdo</Label>
            <textarea
              {...register("content")}
              rows={4}
              className="w-full rounded-md border border-gray-700 bg-gray-800 text-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Conteúdo do aviso..."
            />
            {errors.content && (
              <p className="text-red-400 text-xs">{errors.content.message}</p>
            )}
          </div>

          {branches.length > 0 && (
            <div className="space-y-1">
              <Label className="text-gray-300">Filial (opcional — vazio = todas)</Label>
              <Select onValueChange={(v) => setValue("branchId", v === "all" ? undefined : v)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Todas as filiais" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white">
                    Todas as filiais
                  </SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-white">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Publicando..." : "Publicar Aviso"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AvisosPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAnnouncements() {
    setLoading(true);
    const res = await fetch("/api/avisos");
    if (res.ok) setAnnouncements(await res.json());
    setLoading(false);
  }

  async function loadBranches() {
    const res = await fetch("/api/filiais");
    if (res.ok) setBranches(await res.json());
  }

  useEffect(() => {
    loadAnnouncements();
    loadBranches();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-red-400" />
        <h1 className="text-2xl font-black text-white">Avisos</h1>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">Carregando...</p>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum aviso publicado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-bold text-sm">{a.title}</h3>
                  {a.branch && (
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">
                      {a.branch.name}
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{a.content}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                  <span className="text-gray-500 text-xs">{a.createdBy.name}</span>
                  <span className="text-gray-500 text-xs">
                    {format(new Date(a.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddAvisoDialog branches={branches} onSuccess={loadAnnouncements} />
    </div>
  );
}

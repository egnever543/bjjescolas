"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Camera } from "lucide-react";
import { BELT_LABELS, MODALITY_LABELS } from "@/types";
import type { Belt, Modality } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  belt: z.string().optional(),
  modality: z.string().optional(),
  branchId: z.string().min(1, "Filial obrigatória"),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  bloodType: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Branch {
  id: string;
  name: string;
}

export function AddAlunoDialog({ branches }: { branches: Branch[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { belt: "BRANCA", modality: "BJJ", branchId: branches[0]?.id ?? "" },
  });

  const uploadPhoto = async (file: File) => {
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const body = await res.json();
      if (res.ok) setImageUrl(body.url);
      else setUploadError(body.error ?? "Falha ao enviar a foto");
    } catch {
      setUploadError("Falha ao enviar a foto");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setError("");
    const res = await fetch("/api/alunos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, image: imageUrl || undefined }),
    });
    if (res.ok) {
      setOpen(false);
      reset();
      setImageUrl("");
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? "Erro ao cadastrar aluno");
    }
  };

  const belts = Object.keys(BELT_LABELS) as Belt[];
  const modalities = Object.keys(MODALITY_LABELS) as Modality[];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
          aria-label="Adicionar aluno"
        >
          <Plus className="w-6 h-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Novo Aluno</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Foto do aluno" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <div>
                <label className="inline-block cursor-pointer text-sm text-red-400 hover:text-red-300 font-medium">
                  {uploading ? "Enviando..." : imageUrl ? "Trocar foto" : "Escolher foto"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadPhoto(f);
                    }}
                  />
                </label>
                {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Nome *</Label>
              <Input {...register("name")} className="bg-gray-800 border-gray-700 text-white mt-1" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label className="text-gray-300">Email *</Label>
              <Input {...register("email")} type="email" className="bg-gray-800 border-gray-700 text-white mt-1" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label className="text-gray-300">Senha *</Label>
              <Input {...register("password")} type="password" className="bg-gray-800 border-gray-700 text-white mt-1" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <Label className="text-gray-300">Telefone</Label>
              <Input {...register("phone")} className="bg-gray-800 border-gray-700 text-white mt-1" />
            </div>

            <div>
              <Label className="text-gray-300">Data de Nascimento</Label>
              <Input {...register("birthDate")} type="date" className="bg-gray-800 border-gray-700 text-white mt-1" />
            </div>

            <div>
              <Label className="text-gray-300">Filial *</Label>
              <Select
                defaultValue={branches[0]?.id ?? ""}
                onValueChange={(v) => setValue("branchId", v)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                  <SelectValue placeholder="Selecione a filial" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-white focus:bg-gray-700">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.branchId && <p className="text-red-400 text-xs mt-1">{errors.branchId.message}</p>}
            </div>

            <div>
              <Label className="text-gray-300">Modalidade</Label>
              <Select defaultValue="BJJ" onValueChange={(v) => setValue("modality", v)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {modalities.map((m) => (
                    <SelectItem key={m} value={m} className="text-white focus:bg-gray-700">
                      {MODALITY_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Faixa</Label>
              <Select defaultValue="BRANCA" onValueChange={(v) => setValue("belt", v)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {belts.map((b) => (
                    <SelectItem key={b} value={b} className="text-white focus:bg-gray-700">
                      {BELT_LABELS[b]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Contato de Emergência</Label>
              <Input {...register("emergencyContact")} placeholder="Nome" className="bg-gray-800 border-gray-700 text-white mt-1" />
            </div>

            <div>
              <Label className="text-gray-300">Telefone de Emergência</Label>
              <Input {...register("emergencyPhone")} className="bg-gray-800 border-gray-700 text-white mt-1" />
            </div>

            <div>
              <Label className="text-gray-300">Tipo Sanguíneo</Label>
              <Input {...register("bloodType")} placeholder="Ex: A+" className="bg-gray-800 border-gray-700 text-white mt-1" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Aluno"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

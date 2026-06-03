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
import { Plus } from "lucide-react";
import { BELT_LABELS } from "@/types";
import type { Belt } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  branchId: z.string().min(1, "Filial obrigatória"),
  belt: z.string().optional(),
  bio: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Branch {
  id: string;
  name: string;
}

export function AddProfessorDialog({ branches }: { branches: Branch[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { belt: "PRETA", branchId: branches[0]?.id ?? "" },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    const res = await fetch("/api/professores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setOpen(false);
      reset();
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? "Erro ao cadastrar professor");
    }
  };

  const belts = Object.keys(BELT_LABELS) as Belt[];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
          aria-label="Adicionar professor"
        >
          <Plus className="w-6 h-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Novo Professor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
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
            <Label className="text-gray-300">Faixa</Label>
            <Select defaultValue="PRETA" onValueChange={(v) => setValue("belt", v)}>
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
            <Label className="text-gray-300">Bio</Label>
            <Input {...register("bio")} placeholder="Breve descrição..." className="bg-gray-800 border-gray-700 text-white mt-1" />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Professor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

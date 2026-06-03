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
import { Plus } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function AddFilialDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    const res = await fetch("/api/filiais", {
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
      setError(body.error ?? "Erro ao cadastrar filial");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
          aria-label="Adicionar filial"
        >
          <Plus className="w-6 h-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Nova Filial</DialogTitle>
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
            <Label className="text-gray-300">Endereço</Label>
            <Input {...register("address")} className="bg-gray-800 border-gray-700 text-white mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300">Cidade</Label>
              <Input {...register("city")} className="bg-gray-800 border-gray-700 text-white mt-1" />
            </div>
            <div>
              <Label className="text-gray-300">Estado</Label>
              <Input {...register("state")} placeholder="SP" className="bg-gray-800 border-gray-700 text-white mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-gray-300">Telefone</Label>
            <Input {...register("phone")} className="bg-gray-800 border-gray-700 text-white mt-1" />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Salvando..." : "Cadastrar Filial"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

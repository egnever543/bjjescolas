"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const registerSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  academyName: z.string().min(2, "Mínimo 2 caracteres"),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Erro ao cadastrar");
        setLoading(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Erro de conexão");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600 mb-4">
            <span className="text-2xl font-black text-white">BJJ</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">BJJ Escolas</h1>
          <p className="text-gray-400 text-sm mt-1">Cadastre sua academia</p>
        </div>

        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Nova Academia</CardTitle>
            <CardDescription className="text-gray-400">
              Preencha os dados para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-gray-300">Seu nome</Label>
                <Input
                  id="name"
                  placeholder="João Silva"
                  {...register("name")}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-300">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
              </div>

              <div className="border-t border-gray-800 pt-4">
                <p className="text-gray-400 text-xs mb-3 uppercase tracking-wider font-semibold">Dados da Academia</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="academyName" className="text-gray-300">Nome da academia</Label>
                <Input
                  id="academyName"
                  placeholder="Gracie Barra SP"
                  {...register("academyName")}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                {errors.academyName && <p className="text-red-400 text-xs">{errors.academyName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-gray-300">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="São Paulo"
                    {...register("city")}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-gray-300">Estado</Label>
                  <Input
                    id="state"
                    placeholder="SP"
                    maxLength={2}
                    {...register("state")}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-gray-300">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  {...register("phone")}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-800 rounded-md px-3 py-2">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-10"
                disabled={loading}
              >
                {loading ? "Cadastrando..." : "Cadastrar Academia"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-4">
              Já tem conta?{" "}
              <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

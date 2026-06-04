"use client";

import { useState } from "react";
import { Smartphone, Share, Plus, MoreVertical, Globe, ChevronDown, ChevronUp } from "lucide-react";

type Section = "ios" | "android" | "other";

function detectOS(): Section {
  if (typeof navigator === "undefined") return "ios";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

export default function InstalarPage() {
  const os = detectOS();
  const [open, setOpen] = useState<Section | null>(os);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-start px-4 py-10">
      {/* Logo / Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-900/40">
          <Smartphone className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white">BJJ Escolas</h1>
        <p className="text-gray-400 text-center mt-2 max-w-xs">
          Instale o app na tela inicial do seu celular para acesso rápido
        </p>
      </div>

      {/* Benefits */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-3 mb-10">
        {[
          { label: "Acesso rápido", icon: "⚡" },
          { label: "Funciona offline", icon: "📶" },
          { label: "Tela cheia", icon: "📱" },
        ].map((b) => (
          <div key={b.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{b.icon}</div>
            <p className="text-gray-400 text-xs">{b.label}</p>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="w-full max-w-sm space-y-3">

        {/* iOS */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <button
            onClick={() => setOpen(open === "ios" ? null : "ios")}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍎</span>
              <div className="text-left">
                <p className="text-white font-semibold">iPhone / iPad</p>
                <p className="text-gray-500 text-xs">Safari</p>
              </div>
            </div>
            {open === "ios" ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {open === "ios" && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
              <Step n={1} icon={<Share className="w-5 h-5 text-blue-400" />}>
                Toque no botão <strong className="text-white">Compartilhar</strong> (quadrado com seta para cima) na barra inferior do Safari
              </Step>
              <Step n={2} icon={<Plus className="w-5 h-5 text-blue-400" />}>
                Role para baixo e toque em <strong className="text-white">"Adicionar à Tela de Início"</strong>
              </Step>
              <Step n={3} icon={<Smartphone className="w-5 h-5 text-blue-400" />}>
                Toque em <strong className="text-white">Adicionar</strong> no canto superior direito
              </Step>
            </div>
          )}
        </div>

        {/* Android */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <button
            onClick={() => setOpen(open === "android" ? null : "android")}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div className="text-left">
                <p className="text-white font-semibold">Android</p>
                <p className="text-gray-500 text-xs">Globe</p>
              </div>
            </div>
            {open === "android" ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {open === "android" && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
              <Step n={1} icon={<MoreVertical className="w-5 h-5 text-green-400" />}>
                Toque no menu <strong className="text-white">⋮</strong> (três pontos) no canto superior direito do Globe
              </Step>
              <Step n={2} icon={<Plus className="w-5 h-5 text-green-400" />}>
                Toque em <strong className="text-white">"Adicionar à tela inicial"</strong>
              </Step>
              <Step n={3} icon={<Smartphone className="w-5 h-5 text-green-400" />}>
                Toque em <strong className="text-white">Adicionar</strong> na confirmação
              </Step>
            </div>
          )}
        </div>

        {/* Other */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <button
            onClick={() => setOpen(open === "other" ? null : "other")}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-7 h-7 text-gray-400" />
              <div className="text-left">
                <p className="text-white font-semibold">Outros navegadores</p>
                <p className="text-gray-500 text-xs">Desktop / outros</p>
              </div>
            </div>
            {open === "other" ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {open === "other" && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
              <Step n={1} icon={<Globe className="w-5 h-5 text-gray-400" />}>
                No Globe desktop, clique no ícone de <strong className="text-white">instalar</strong> na barra de endereço (seta para cima com círculo)
              </Step>
              <Step n={2} icon={<Plus className="w-5 h-5 text-gray-400" />}>
                Clique em <strong className="text-white">"Instalar"</strong> na janela que aparecer
              </Step>
            </div>
          )}
        </div>
      </div>

      {/* Link to app */}
      <a
        href="/login"
        className="mt-8 w-full max-w-sm bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-center text-lg transition-colors"
      >
        Acessar o App
      </a>

      <p className="text-gray-600 text-xs mt-6 text-center max-w-xs">
        Após instalar, o app ficará disponível na sua tela inicial como qualquer outro aplicativo.
      </p>
    </div>
  );
}

function Step({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xs font-bold">
        {n}
      </div>
      <div className="flex items-start gap-2 text-gray-400 text-sm">
        <span className="flex-shrink-0 mt-0.5">{icon}</span>
        <span>{children}</span>
      </div>
    </div>
  );
}

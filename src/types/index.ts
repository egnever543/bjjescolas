export type Role = "MASTER" | "ACADEMY_OWNER" | "PROFESSOR" | "STUDENT";

export type Belt =
  | "BRANCA"
  | "CINZA"
  | "AMARELA"
  | "LARANJA"
  | "VERDE"
  | "AZUL"
  | "ROXA"
  | "MARROM"
  | "PRETA"
  | "CORAL"
  | "VERMELHA";

export type Modality =
  | "BJJ"
  | "MUAY_THAI"
  | "JUDO"
  | "WRESTLING"
  | "BOXE"
  | "MMA"
  | "KARATE"
  | "OUTRO";

export type DayOfWeek =
  | "SEGUNDA"
  | "TERCA"
  | "QUARTA"
  | "QUINTA"
  | "SEXTA"
  | "SABADO"
  | "DOMINGO";

export const BELT_LABELS: Record<Belt, string> = {
  BRANCA: "Branca",
  CINZA: "Cinza",
  AMARELA: "Amarela",
  LARANJA: "Laranja",
  VERDE: "Verde",
  AZUL: "Azul",
  ROXA: "Roxa",
  MARROM: "Marrom",
  PRETA: "Preta",
  CORAL: "Coral",
  VERMELHA: "Vermelha",
};

export const BELT_COLORS: Record<Belt, string> = {
  BRANCA: "bg-gray-100 text-gray-800 border border-gray-300",
  CINZA: "bg-gray-400 text-white",
  AMARELA: "bg-yellow-400 text-yellow-900",
  LARANJA: "bg-orange-500 text-white",
  VERDE: "bg-green-600 text-white",
  AZUL: "bg-blue-600 text-white",
  ROXA: "bg-purple-700 text-white",
  MARROM: "bg-amber-800 text-white",
  PRETA: "bg-gray-900 text-white",
  CORAL: "bg-red-400 text-white",
  VERMELHA: "bg-red-600 text-white",
};

export const MODALITY_LABELS: Record<Modality, string> = {
  BJJ: "BJJ",
  MUAY_THAI: "Muay Thai",
  JUDO: "Judô",
  WRESTLING: "Wrestling",
  BOXE: "Boxe",
  MMA: "MMA",
  KARATE: "Karatê",
  OUTRO: "Outro",
};

export const DAY_LABELS: Record<DayOfWeek, string> = {
  SEGUNDA: "Seg",
  TERCA: "Ter",
  QUARTA: "Qua",
  QUINTA: "Qui",
  SEXTA: "Sex",
  SABADO: "Sáb",
  DOMINGO: "Dom",
};

export const DAY_FULL_LABELS: Record<DayOfWeek, string> = {
  SEGUNDA: "Segunda-feira",
  TERCA: "Terça-feira",
  QUARTA: "Quarta-feira",
  QUINTA: "Quinta-feira",
  SEXTA: "Sexta-feira",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

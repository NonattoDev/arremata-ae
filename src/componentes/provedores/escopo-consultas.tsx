"use client";

import { createContext } from "react";

// Cada usuário recebe chaves próprias: carteira e posição nunca reaproveitam dados de outra sessão.
export const EscopoConsultas = createContext<string | null>(null);

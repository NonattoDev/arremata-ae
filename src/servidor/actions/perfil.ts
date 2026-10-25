"use server";
import {
  salvarAvatar,
  salvarNome,
  salvarCpf,
  salvarDadosPerfil,
} from "../comandos/perfil";
import { alterarSenha } from "../comandos/alterar-senha";
import { salvarFotoPerfil } from "../comandos/foto-perfil";
import { contextoAcao, resultadoAcao } from "./suporte";

export async function salvarNomeAcao(entrada: unknown) {
  return resultadoAcao(async () => salvarNome(await contextoAcao(), entrada));
}
export async function alterarSenhaAcao(entrada: unknown) {
  return resultadoAcao(async () => alterarSenha(await contextoAcao(), entrada));
}

export async function salvarAvatarAcao(entrada: unknown) {
  return resultadoAcao(async () => salvarAvatar(await contextoAcao(), entrada));
}

export async function salvarFotoPerfilAcao(entrada: unknown) {
  return resultadoAcao(async () =>
    salvarFotoPerfil(await contextoAcao(), entrada),
  );
}

export async function salvarCpfAcao(entrada: unknown) {
  return resultadoAcao(async () => salvarCpf(await contextoAcao(), entrada));
}

export async function salvarDadosPerfilAcao(entrada: unknown) {
  return resultadoAcao(async () =>
    salvarDadosPerfil(await contextoAcao(), entrada),
  );
}

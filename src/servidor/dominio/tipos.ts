export class ErroDominio extends Error {
  constructor(
    mensagem: string,
    public status = 400,
  ) {
    super(mensagem);
  }
}
export type ItemCatalogo = {
  externalId: string;
  title: string;
  artist: string;
  date: string;
  image: string;
  sourceUrl: string;
};
export type DadosNovoLote = {
  item: ItemCatalogo;
  initial: number;
  increment: number;
  startsAt: string;
  endsAt: string;
};

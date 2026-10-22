export class DomainError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export type Item = {
  externalId: string;
  title: string;
  artist: string;
  date: string;
  image: string;
  sourceUrl: string;
};
export type LotInput = {
  item: Item;
  initial: number;
  increment: number;
  startsAt: string;
  endsAt: string;
};

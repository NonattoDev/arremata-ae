"use client";

import type { Bid } from "@/types/auction";
import { brl } from "@/lib/format";
import { date } from "@/lib/format";
import { Empty } from "@/components/ui/empty";
export function BidTable({ bids }: { bids: Bid[] }) {
  return bids.length ? (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Lance</th>
            <th>Participante</th>
            <th>Valor</th>
            <th>Data e hora</th>
          </tr>
        </thead>
        <tbody>
          {[...bids].reverse().map((b) => (
            <tr key={b.sequence}>
              <td>#{String(b.sequence).padStart(3, "0")}</td>
              <td>{b.alias}</td>
              <td>
                <strong>{brl(b.amount)}</strong>
              </td>
              <td>{date(b.placedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty title="A história deste lote está começando.">
      Seja a primeira pessoa a dar um lance.
    </Empty>
  );
}

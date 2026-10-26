"use client";

import { Accordion, Card } from "@heroui/react";
import { Icone, type NomeIcone } from "@/componentes/ui/icone";

const etapas: [NomeIcone, string, string][] = [
  [
    "leilao",
    "Você está na frente",
    "Ao liderar um lote, o valor do lance fica reservado.",
  ],
  [
    "restaurar",
    "Alguém superou seu lance",
    "O valor reservado volta ao saldo disponível.",
  ],
  [
    "comprovante",
    "O leilão terminou",
    "Só o vencedor é debitado. O leiloeiro recebe o mesmo valor.",
  ],
];

export function AjudaReservaSaldo() {
  return (
    <Card className="p-3 sm:p-4">
      <Accordion>
        <Accordion.Item id="reserva">
          <Accordion.Heading>
            <Accordion.Trigger className="gap-3 text-sm">
              <Icone nome="informacao" className="text-accent" />
              Como funciona a reserva de saldo
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>
              <Card.Content className="gap-3 pt-3">
                {etapas.map(([icone, titulo, texto]) => (
                  <Card key={titulo} variant="secondary" className="gap-2 p-4">
                    <Card.Title className="flex items-center gap-2 text-sm">
                      <Icone nome={icone} className="text-accent" />
                      {titulo}
                    </Card.Title>
                    <Card.Description>{texto}</Card.Description>
                  </Card>
                ))}
              </Card.Content>
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Card>
  );
}

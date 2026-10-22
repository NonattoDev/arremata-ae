"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Spinner } from "@heroui/react";
import {
  ArrowUpRight,
  ArrowRight,
  Gavel,
  ShieldCheck,
  Wallet,
  Clock3,
  Search,
  Check,
  ArrowLeft,
  Plus,
  Copy,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Radio,
  Sun,
  Moon,
} from "lucide-react";
import type { Item } from "@/server/auction";

type User = {
  id: string;
  name: string;
  email: string;
  alias: string;
  role: "seller" | "bidder";
};
type Lot = {
  id: string;
  item: Item;
  initial: number;
  increment: number;
  currentAmount: number;
  bidCount: number;
  startsAt: string;
  endsAt: string;
  status: string;
  isLeader: boolean;
  isOwner: boolean;
  hasWinner: boolean;
};
type Bid = {
  alias: string;
  amount: number;
  sequence: number;
  placedAt: string;
  hash: string;
};
type Room = Lot & {
  bids: Bid[];
  intact: boolean;
  position: number;
  serverTime: string;
};
const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
const date = (value: string) => new Date(value).toLocaleString("pt-BR");
const labels: Record<string, string> = {
  live: "Ao vivo",
  scheduled: "Em breve",
  closed: "Encerrado",
  cancelled: "Cancelado",
};
async function api<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/${url}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Não foi possível carregar os dados.");
  return data;
}
function useResource<T>(url: string | null, poll = false) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState("");
  const revision = useRef(0),
    loading = useRef(false);
  const refresh = useCallback(async () => {
    if (!url) return;
    const current = ++revision.current;
    loading.current = true;
    try {
      const next = await api<T>(url);
      if (current === revision.current) {
        setData(next);
        setError("");
      }
    } catch (e) {
      if (current === revision.current) setError((e as Error).message);
    } finally {
      if (current === revision.current) loading.current = false;
    }
  }, [url]);
  useEffect(() => {
    setData(null);
    setError("");
    void refresh();
    const timer = poll
      ? setInterval(() => {
          if (!document.hidden && !loading.current) void refresh();
        }, 2000)
      : undefined;
    return () => {
      revision.current++;
      loading.current = false;
      clearInterval(timer);
    };
  }, [refresh, poll]);
  return { data, error, refresh };
}
function Notice({
  children,
  good = false,
}: {
  children: ReactNode;
  good?: boolean;
}) {
  return (
    <div
      className={`notice ${good ? "good" : ""}`}
      role={good ? "status" : "alert"}
    >
      {good ? <Check size={18} /> : <AlertCircle size={18} />}
      <span>{children}</span>
    </div>
  );
}
function Loading() {
  return (
    <div className="loading">
      <Spinner />
      <span>Preparando tudo por aqui…</span>
    </div>
  );
}
function Field({
  label,
  name,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} {...rest} />
    </label>
  );
}
function Empty({
  title = "Ainda não há lotes por aqui.",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Gavel size={32} />
      <h3>{title}</h3>
      <p>{children || "Volte em breve para descobrir novas obras."}</p>
    </div>
  );
}
function Countdown({ end, serverTime }: { end: string; serverTime?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const offset = serverTime ? new Date(serverTime).getTime() - Date.now() : 0;
    const tick = () => setNow(Date.now() + offset);
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [serverTime]);
  if (now === null) return <span>—</span>;
  const seconds = Math.max(
    0,
    Math.floor((new Date(end).getTime() - now) / 1000),
  );
  if (seconds === 0) return <span>Encerrando</span>;
  const days = Math.floor(seconds / 86400),
    hours = Math.floor(seconds / 3600) % 24,
    minutes = Math.floor(seconds / 60) % 60;
  return (
    <span>
      {days ? `${days}d ` : ""}
      {hours ? `${hours}h ` : ""}
      {minutes}m {!days && !hours ? `${seconds % 60}s` : ""}
    </span>
  );
}
function LotCard({ lot }: { lot: Lot }) {
  return (
    <Link href={`/lotes/${lot.id}`} className="lot-card">
      <div className="art-wrap">
        <img src={lot.item.image} alt={lot.item.title} loading="lazy" />
        <span className={`badge ${lot.status}`}>
          <i />
          {labels[lot.status]}
        </span>
        <span className="art-arrow">
          <ArrowUpRight size={20} />
        </span>
      </div>
      <div className="card-meta">
        <span>{lot.item.artist}</span>
        <span>{lot.item.date}</span>
      </div>
      <h3>{lot.item.title}</h3>
      <div className="card-bottom">
        <div>
          <span>{lot.bidCount ? "Lance atual" : "Lance inicial"}</span>
          <strong>{brl(lot.currentAmount || lot.initial)}</strong>
        </div>
        <div className="card-time">
          <Clock3 size={14} />
          {lot.status === "live" ? (
            <Countdown end={lot.endsAt} />
          ) : lot.status === "scheduled" ? (
            <span>{new Date(lot.startsAt).toLocaleDateString("pt-BR")}</span>
          ) : (
            <span>{lot.bidCount} lances</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function AuctionApp() {
  const path = usePathname(),
    router = useRouter();
  const auth = useResource<{ user: User | null }>("me");
  const user = auth.data?.user || null;
  const [menu, setMenu] = useState(false),
    [dark, setDark] = useState(false);
  useEffect(() => {
    const value = localStorage.getItem("theme") === "dark";
    setDark(value);
    document.documentElement.classList.toggle("dark", value);
  }, []);
  useEffect(() => {
    setMenu(false);
    void auth.refresh();
  }, [path]); // Re-read cookie-backed identity after navigation.
  const logout = async () => {
    await api("auth/logout", {});
    await auth.refresh();
    router.push("/");
  };
  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark", !dark);
    localStorage.setItem("theme", dark ? "light" : "dark");
  };
  const parts = path.split("/").filter(Boolean);
  return (
    <>
      <div className="announcement">
        <span className="live-dot" /> Uma nova história começa com um lance.
        <span className="announcement-right">
          Arte em domínio público · Experiência demonstrativa
        </span>
      </div>
      <header className="header">
        <Link href="/" className="brand" aria-label="Arremata aê, início">
          arremata
          <span>
            aê<small>↗</small>
          </span>
        </Link>
        <nav
          className={menu ? "nav open" : "nav"}
          aria-label="Navegação principal"
        >
          <Link className={path === "/" ? "active" : ""} href="/">
            Explorar leilões
          </Link>
          {user && (
            <>
              <Link href="/meus-lotes">
                {user.role === "seller"
                  ? "Painel do leiloeiro"
                  : "Meus arremates"}
              </Link>
              <Link href="/carteira">
                {user.role === "seller" ? "Recebimentos" : "Minha carteira"}
              </Link>
            </>
          )}
        </nav>
        <div className="header-actions">
          <Button
            variant="ghost"
            isIconOnly
            aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
            onPress={toggleTheme}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </Button>
          {user ? (
            <>
              <span className="user-name">Olá, {user.name.split(" ")[0]}</span>
              <Button
                variant="ghost"
                isIconOnly
                aria-label="Sair"
                onPress={logout}
              >
                <LogOut size={18} />
              </Button>
            </>
          ) : (
            <Link className="button-link dark-button" href="/entrar">
              Entrar <ArrowUpRight size={16} />
            </Link>
          )}
          <Button
            className="menu-toggle"
            variant="ghost"
            isIconOnly
            aria-label="Abrir menu"
            onPress={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </Button>
        </div>
      </header>
      <main>
        {parts.length === 0 ? (
          <Explore />
        ) : parts[0] === "entrar" ? (
          <Auth onLogin={auth.refresh} />
        ) : parts[0] === "lotes" && parts[1] ? (
          <LotRoom id={parts[1]} user={user} />
        ) : parts[0] === "auditoria" && parts[1] ? (
          <Audit id={parts[1]} />
        ) : parts[0] === "comprovante" && parts[1] ? (
          <Receipt id={parts[1]} />
        ) : parts[0] === "carteira" ? (
          <Protected auth={auth}>
            <WalletPage user={user!} />
          </Protected>
        ) : parts[0] === "meus-lotes" ? (
          <Protected auth={auth}>
            <MyLots user={user!} />
          </Protected>
        ) : parts[0] === "novo-lote" ? (
          <Protected auth={auth}>
            <CreateLot user={user!} />
          </Protected>
        ) : (
          <Empty title="Página não encontrada.">
            <Link href="/">Voltar ao início</Link>
          </Empty>
        )}
      </main>
      <footer>
        <Link href="/" className="brand small">
          arremata<span>aê</span>
        </Link>
        <p>Obras com história. Lances com transparência.</p>
        <span>Projeto demonstrativo · Sem dinheiro ou vendas reais.</span>
      </footer>
    </>
  );
}
function Protected({
  auth,
  children,
}: {
  auth: ReturnType<typeof useResource<{ user: User | null }>>;
  children: ReactNode;
}) {
  if (auth.error) return <Notice>{auth.error}</Notice>;
  if (!auth.data) return <Loading />;
  if (!auth.data.user)
    return (
      <section className="page narrow">
        <h1>Entre para continuar.</h1>
        <p>Sua carteira e seus lances ficam na sua conta.</p>
        <Link className="button-link dark-button" href="/entrar">
          Entrar na minha conta <ArrowRight size={18} />
        </Link>
      </section>
    );
  return children;
}

function Explore() {
  const { data: lots, error } = useResource<Lot[]>("lots", true);
  const [tab, setTab] = useState("live"),
    [query, setQuery] = useState("");
  const visible =
    lots?.filter(
      (l) =>
        l.status === tab &&
        `${l.item.title} ${l.item.artist}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    ) || [];
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" /> O EXTRAORDINÁRIO PODE SER SEU
          </span>
          <h1>
            Dê seu lance.
            <br />
            Leve uma <em>história.</em>
          </h1>
          <p>
            Descubra obras que atravessam o tempo.
            <br />
            Acompanhe cada lance e encontre a sua próxima conquista.
          </p>
          <a className="button-link orange-button" href="#leiloes">
            Explorar leilões <ArrowUpRight size={20} />
          </a>
          <div className="hero-trust">
            <ShieldCheck size={18} />
            <span>Lances transparentes. Histórico verificável.</span>
          </div>
        </div>
        <div className="hero-art">
          {lots?.[0] ? (
            <>
              <img src={lots[0].item.image} alt={lots[0].item.title} />
              <div className="hero-caption">
                <div>
                  <span>EM DESTAQUE</span>
                  <strong>{lots[0].item.artist}</strong>
                </div>
                <Link
                  href={`/lotes/${lots[0].id}`}
                  aria-label="Ver lote em destaque"
                >
                  <ArrowUpRight />
                </Link>
              </div>
              <div className="art-label">
                UMA OBRA.
                <br />
                INFINITAS HISTÓRIAS.
              </div>
            </>
          ) : (
            <div className="art-placeholder">
              <Gavel size={60} />
              <span>Seu próximo encontro com a arte.</span>
            </div>
          )}
        </div>
      </section>
      <section className="benefits">
        <div>
          <Radio />
          <span>
            <strong>Disputa ao vivo</strong>Novos lances sem recarregar
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            <strong>Histórico auditável</strong>Transparência em cada lance
          </span>
        </div>
        <div>
          <Wallet />
          <span>
            <strong>Carteira simulada</strong>Explore sem dinheiro real
          </span>
        </div>
      </section>
      <section className="catalog-section" id="leiloes">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ENCONTRE O QUE TE MOVE</span>
            <h2>O próximo lance é seu.</h2>
          </div>
          <label className="search-box">
            <Search size={18} />
            <input
              aria-label="Buscar obra ou artista"
              placeholder="Busque uma obra ou artista"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="tabs" role="tablist" aria-label="Status dos leilões">
          {["live", "scheduled", "closed"].map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={tab === t ? "selected" : ""}
            >
              {t === "live" && <span className="live-dot" />}
              {labels[t]}
              <span className="count">
                {lots?.filter((l) => l.status === t).length || 0}
              </span>
            </button>
          ))}
        </div>
        {error && <Notice>{error}</Notice>}
        {!lots && !error ? (
          <Loading />
        ) : visible.length ? (
          <div className="lot-grid">
            {visible.map((l) => (
              <LotCard key={l.id} lot={l} />
            ))}
          </div>
        ) : (
          <Empty
            title={
              query
                ? "Nenhuma obra encontrada."
                : "Nenhum lote nesta categoria."
            }
          />
        )}
      </section>
      <section className="how">
        <span className="eyebrow">SIMPLES ASSIM</span>
        <h2>Da descoberta ao arremate.</h2>
        <div className="steps">
          {[
            [
              "01",
              "Encontre sua obra",
              "Explore o acervo e escolha a história que combina com você.",
            ],
            [
              "02",
              "Entre na disputa",
              "Adicione saldo simulado e acompanhe seus lances ao vivo.",
            ],
            [
              "03",
              "Celebre a conquista",
              "Venceu? Seu comprovante fica disponível para compartilhar.",
            ],
          ].map(([n, t, d]) => (
            <div key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Auth({ onLogin }: { onLogin: () => Promise<void> }) {
  const [register, setRegister] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api(`auth/${register ? "register" : "login"}`, values);
      await onLogin();
      router.push("/");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="page auth-page">
      <div className="auth-story">
        <span className="eyebrow">SEU PRÓXIMO CAPÍTULO</span>
        <h1>
          Grandes histórias
          <br />
          começam com
          <br />
          um <em>encontro.</em>
        </h1>
        <p>
          Arte, descobertas e a emoção de um lance.
          <br />
          Tudo isso te espera aqui.
        </p>
        <ShieldCheck size={40} />
        <p className="muted">
          Seu histórico é verificável.
          <br />
          Seus dados pessoais ficam protegidos.
        </p>
      </div>
      <div className="panel auth-panel">
        <span className="eyebrow">BEM-VINDO AO ARREMATA AÊ</span>
        <h2>{register ? "Crie sua conta." : "Bom te ver por aqui."}</h2>
        <p>
          {register
            ? "Escolha como você quer participar."
            : "Entre para acompanhar suas próximas conquistas."}
        </p>
        <form onSubmit={submit}>
          {register && (
            <>
              <Field
                name="name"
                label="Seu nome"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
              />
              <label className="field">
                <span>Quero participar como</span>
                <select name="role">
                  <option value="bidder">Licitante — dar lances</option>
                  <option value="seller">Leiloeiro — publicar lotes</option>
                </select>
              </label>
            </>
          )}
          <Field
            name="email"
            label="E-mail"
            type="email"
            placeholder="voce@exemplo.com"
            required
            autoComplete="email"
          />
          <Field
            name="password"
            label="Senha"
            type="password"
            minLength={12}
            maxLength={128}
            required
            autoComplete={register ? "new-password" : "current-password"}
            placeholder="Pelo menos 12 caracteres"
          />
          {error && <Notice>{error}</Notice>}
          <Button
            type="submit"
            className="orange-button"
            fullWidth
            isPending={busy}
          >
            {register ? "Criar minha conta" : "Entrar"}
            <ArrowRight size={18} />
          </Button>
        </form>
        <p className="switch-auth">
          {register ? "Já tem conta?" : "Primeira vez aqui?"}{" "}
          <button
            onClick={() => {
              setRegister(!register);
              setError("");
            }}
          >
            {register ? "Entrar" : "Criar conta"}
          </button>
        </p>
        <div className="demo-note">
          Ambiente demonstrativo. Depósitos e arremates são simulados.
        </div>
      </div>
    </section>
  );
}

function LotRoom({ id, user }: { id: string; user: User | null }) {
  const resource = useResource<Room>(`lots/${id}`, true);
  const lot = resource.data;
  const wallet = useResource<{ available: number }>(
    user?.role === "bidder" ? "wallet" : null,
    true,
  );
  const [amount, setAmount] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const sendBid = async (e: FormEvent) => {
    e.preventDefault();
    if (!lot) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await api(`lots/${id}/bids`, {
        amount: Math.round(Number(amount || minimum / 100) * 100),
      });
      setMessage("Lance aceito! Acompanhe a disputa.");
      setAmount("");
      await resource.refresh();
      await wallet.refresh();
    } catch (e) {
      setError((e as Error).message);
      await resource.refresh();
    } finally {
      setBusy(false);
    }
  };
  if (!lot)
    return (
      <section className="page">
        {resource.error ? <Notice>{resource.error}</Notice> : <Loading />}
      </section>
    );
  const minimum = lot.bidCount
    ? lot.currentAmount + lot.increment
    : lot.initial;
  return (
    <section className="page">
      <Link href="/" className="back">
        <ArrowLeft size={16} /> Explorar leilões
      </Link>
      {resource.error && (
        <Notice>Atualização interrompida: {resource.error}</Notice>
      )}
      <div className="room-grid">
        <div>
          <div className="room-art">
            <img src={lot.item.image} alt={lot.item.title} />
            <span className={`badge ${lot.status}`}>
              <i />
              {labels[lot.status]}
            </span>
          </div>
          <div className="art-credit">
            <span>Acervo Cleveland Museum of Art · Domínio público</span>
            <a href={lot.item.sourceUrl} target="_blank" rel="noreferrer">
              Ver origem <ArrowUpRight size={15} />
            </a>
          </div>
          <h2>Uma obra, muitos detalhes.</h2>
          <dl className="details">
            <div>
              <dt>Artista</dt>
              <dd>{lot.item.artist}</dd>
            </div>
            <div>
              <dt>Data da obra</dt>
              <dd>{lot.item.date}</dd>
            </div>
            <div>
              <dt>Início</dt>
              <dd>{date(lot.startsAt)}</dd>
            </div>
            <div>
              <dt>Encerramento previsto</dt>
              <dd>{date(lot.endsAt)}</dd>
            </div>
          </dl>
        </div>
        <div className="bid-panel panel">
          <span className="eyebrow">{lot.item.artist}</span>
          <h1>{lot.item.title}</h1>
          <div className="bid-value">
            <span>{lot.bidCount ? "Lance atual" : "Lance inicial"}</span>
            <strong>{brl(lot.currentAmount || lot.initial)}</strong>
            <small>
              {lot.bidCount} lance{lot.bidCount !== 1 ? "s" : ""} registrado
              {lot.bidCount !== 1 ? "s" : ""}
            </small>
          </div>
          <div className="time-box">
            <Clock3 size={19} />
            <div>
              <small>
                {lot.status === "scheduled"
                  ? "Começa em"
                  : lot.status === "live"
                    ? "Encerra em"
                    : "Disputa finalizada"}
              </small>
              {["live", "scheduled"].includes(lot.status) && (
                <strong>
                  <Countdown
                    end={lot.status === "scheduled" ? lot.startsAt : lot.endsAt}
                    serverTime={lot.serverTime}
                  />
                </strong>
              )}
            </div>
          </div>
          {!lot.intact && (
            <Notice>
              Histórico adulterado. Este lote está bloqueado para sua segurança.
            </Notice>
          )}
          {user?.role === "bidder" && lot.position > 0 && (
            <Notice good={lot.isLeader}>
              {lot.isLeader
                ? lot.status === "closed"
                  ? "Você arrematou esta obra!"
                  : "Você está ganhando!"
                : "Você foi superado."}{" "}
              Sua posição: {lot.position}º.
            </Notice>
          )}
          {lot.status === "live" &&
            lot.intact &&
            (user?.role === "bidder" ? (
              <form onSubmit={sendBid}>
                <Field
                  name="amount"
                  label="Seu lance (R$)"
                  type="number"
                  min={minimum / 100}
                  step="0.01"
                  value={amount}
                  placeholder={(minimum / 100).toFixed(2)}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={lot.isLeader}
                />
                <div className="bid-help">
                  <span>Mínimo: {brl(minimum)}</span>
                  <span>Incremento: {brl(lot.increment)}</span>
                </div>
                <Button
                  type="submit"
                  className="orange-button"
                  fullWidth
                  isPending={busy}
                  isDisabled={lot.isLeader || !!resource.error}
                >
                  <Gavel size={18} />
                  {lot.isLeader ? "Você está na liderança" : "Confirmar lance"}
                </Button>
                <p className="available">
                  Disponível: {wallet.data ? brl(wallet.data.available) : "…"}{" "}
                  <Link href="/carteira">Adicionar saldo</Link>
                </p>
              </form>
            ) : user ? (
              <Notice>Leiloeiros não podem dar lances.</Notice>
            ) : (
              <Link className="button-link orange-button full" href="/entrar">
                Entre para dar seu lance <ArrowRight size={18} />
              </Link>
            ))}
          {error && <Notice>{error}</Notice>}
          {message && <Notice good>{message}</Notice>}
          {lot.hasWinner && (
            <Link
              className="button-link dark-button full"
              href={`/comprovante/${id}`}
            >
              Ver comprovante <ArrowUpRight size={17} />
            </Link>
          )}
          <p className="fine-print">
            Lances aceitos nos últimos 2 minutos prorrogam a disputa para 2
            minutos após o lance. Seu saldo fica reservado enquanto você
            liderar.
          </p>
          <Link className="audit-link" href={`/auditoria/${id}`}>
            <ShieldCheck size={18} /> Verificar histórico deste lote{" "}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <section className="history">
        <div className="section-heading">
          <h2>Cada lance conta.</h2>
          <span className="muted">Histórico atualizado automaticamente</span>
        </div>
        <BidTable bids={lot.bids} />
      </section>
    </section>
  );
}
function BidTable({ bids }: { bids: Bid[] }) {
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

function WalletPage({ user }: { user: User }) {
  const resource = useResource<{
    total: number;
    committed: number;
    available: number;
  }>("wallet", true);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const deposit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api("wallet", {
        amount: Math.round(Number(new FormData(form).get("amount")) * 100),
      });
      form.reset();
      setSuccess("Saldo simulado adicionado à sua carteira.");
      await resource.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="page">
      <span className="eyebrow">TUDO SOB CONTROLE</span>
      <h1>
        {user.role === "seller"
          ? "Seus recebimentos."
          : "Sua próxima conquista começa aqui."}
      </h1>
      <p className="lead">
        {user.role === "seller"
          ? "Valores creditados pelos lotes arrematados."
          : "Adicione saldo simulado e entre na disputa pelas suas obras favoritas."}
      </p>
      {resource.error && <Notice>{resource.error}</Notice>}
      <div className="balance-grid">
        {[
          ["Saldo total", "total"],
          ["Saldo comprometido", "committed"],
          ["Saldo disponível", "available"],
        ].map(([label, key]) => (
          <div
            className={`balance-card ${key === "available" ? "highlight" : ""}`}
            key={key}
          >
            <Wallet size={22} />
            <span>{label}</span>
            <strong>
              {resource.data ? brl(resource.data[key as "total"]) : "—"}
            </strong>
          </div>
        ))}
      </div>
      <div className="wallet-bottom">
        {user.role === "bidder" && (
          <div className="panel">
            <h2>Um impulso para o próximo lance.</h2>
            <p>Depósito simulado. Nenhuma cobrança será realizada.</p>
            <form onSubmit={deposit}>
              <Field
                name="amount"
                label="Valor do depósito (R$)"
                type="number"
                min="0.01"
                max="10000000"
                step="0.01"
                placeholder="500,00"
                required
              />
              <Button type="submit" className="orange-button" isPending={busy}>
                <Plus size={18} />
                Adicionar saldo
              </Button>
            </form>
            {error && <Notice>{error}</Notice>}
            {success && <Notice good>{success}</Notice>}
          </div>
        )}
        <div className="wallet-explanation">
          <ShieldCheck size={30} />
          <h2>Seu saldo acompanha a disputa.</h2>
          <p>
            Ao liderar um lote, o valor do lance fica comprometido. Se outra
            pessoa superar você, ele volta imediatamente ao disponível.
          </p>
          <p>
            Quando o lote encerra, somente o vencedor é debitado. O leiloeiro
            recebe o mesmo valor.
          </p>
        </div>
      </div>
    </section>
  );
}

function MyLots({ user }: { user: User }) {
  const { data: lots, error, refresh } = useResource<Lot[]>("mine", true);
  const [actionError, setActionError] = useState(""),
    [busy, setBusy] = useState("");
  const cancel = async (id: string) => {
    setBusy(id);
    setActionError("");
    try {
      await api(`lots/${id}/cancel`, {});
      await refresh();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  return (
    <section className="page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {user.role === "seller"
              ? "PAINEL DO LEILOEIRO"
              : "SUA COLEÇÃO DE HISTÓRIAS"}
          </span>
          <h1>
            {user.role === "seller"
              ? "Seus lotes, de perto."
              : "Meus arremates."}
          </h1>
        </div>
        {user.role === "seller" && (
          <Link href="/novo-lote" className="button-link orange-button">
            <Plus size={18} />
            Criar lote
          </Link>
        )}
      </div>
      {user.role === "seller" && (
        <p className="lead">
          Total arrematado:{" "}
          <strong>
            {brl(
              lots
                ?.filter((l) => l.hasWinner)
                .reduce((sum, l) => sum + l.currentAmount, 0) || 0,
            )}
          </strong>
        </p>
      )}
      {(error || actionError) && <Notice>{error || actionError}</Notice>}
      {!lots && !error ? (
        <Loading />
      ) : lots?.length ? (
        <div className="lot-grid">
          {lots.map((l) => (
            <div key={l.id}>
              <LotCard lot={l} />
              <div className="lot-actions">
                {l.hasWinner ? (
                  <Link href={`/comprovante/${l.id}`}>
                    {l.isLeader ? "Você arrematou! " : ""}Ver comprovante{" "}
                    <ArrowUpRight size={14} />
                  </Link>
                ) : l.status === "closed" ? (
                  <span>Encerrado sem vencedor</span>
                ) : l.isLeader ? (
                  <span className="winning">Você está ganhando</span>
                ) : null}
                {user.role === "seller" &&
                  ["live", "scheduled"].includes(l.status) &&
                  l.bidCount === 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      isPending={busy === l.id}
                      onPress={() => cancel(l.id)}
                    >
                      Cancelar lote
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title={
            user.role === "seller"
              ? "Sua primeira obra merece um palco."
              : "Sua coleção começa com um lance."
          }
        >
          {user.role === "seller"
            ? "Busque uma obra no catálogo e publique seu primeiro lote."
            : "Os lotes em que você participar aparecerão aqui."}
        </Empty>
      )}
    </section>
  );
}

function CreateLot({ user }: { user: User }) {
  const router = useRouter();
  const [query, setQuery] = useState("Monet"),
    [results, setResults] = useState<
      { id: string; title: string; artist: string; image: string }[]
    >([]),
    [selected, setSelected] = useState(""),
    [busy, setBusy] = useState(false),
    [searching, setSearching] = useState(false),
    [error, setError] = useState("");
  const search = async (e: FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setError("");
    setSelected("");
    setResults([]);
    try {
      const r = await api<typeof results>(
        `catalog?q=${encodeURIComponent(query)}`,
      );
      setResults(r);
      if (!r.length)
        setError("Nenhuma obra com imagem disponível. Tente outro artista.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  };
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) {
      setError("Escolha uma obra no catálogo.");
      return;
    }
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await api<{ id: string }>("lots", {
        externalId: selected,
        initial: Math.round(Number(values.initial) * 100),
        increment: Math.round(Number(values.increment) * 100),
        startsAt: new Date(String(values.start)).toISOString(),
        endsAt: new Date(String(values.end)).toISOString(),
      });
      router.push(`/lotes/${r.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (user.role !== "seller")
    return (
      <section className="page">
        <Notice>Apenas leiloeiros podem criar lotes.</Notice>
      </section>
    );
  return (
    <section className="page">
      <Link href="/meus-lotes" className="back">
        <ArrowLeft size={16} /> Meus lotes
      </Link>
      <span className="eyebrow">UM NOVO ENCONTRO COM A ARTE</span>
      <h1>Coloque uma história em disputa.</h1>
      <p className="lead">
        Escolha uma obra em domínio público do Cleveland Museum of Art.
      </p>
      <form onSubmit={search} className="catalog-search">
        <label className="search-box">
          <Search size={18} />
          <input
            aria-label="Buscar no catálogo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome da obra ou artista"
            maxLength={80}
          />
        </label>
        <Button type="submit" className="dark-button" isPending={searching}>
          Buscar obras
        </Button>
      </form>
      {error && <Notice>{error}</Notice>}
      <div className="import-grid">
        {results.map((r) => (
          <button
            type="button"
            aria-pressed={selected === r.id}
            className={selected === r.id ? "import-card chosen" : "import-card"}
            key={r.id}
            onClick={() => setSelected(r.id)}
          >
            <img src={r.image} alt={r.title} />
            <strong>{r.title}</strong>
            <span>{r.artist}</span>
            {selected === r.id && (
              <span className="chosen-label">
                <Check size={14} />
                Selecionada
              </span>
            )}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="panel lot-form">
        <h2>Defina as regras do lote.</h2>
        <div className="form-grid">
          <Field
            name="initial"
            label="Lance inicial (R$)"
            type="number"
            min="0.01"
            max="10000000"
            step="0.01"
            defaultValue="100"
            required
          />
          <Field
            name="increment"
            label="Incremento mínimo (R$)"
            type="number"
            min="0.01"
            max="10000000"
            step="0.01"
            defaultValue="10"
            required
          />
          <Field
            name="start"
            label="Início (seu horário local)"
            type="datetime-local"
            required
          />
          <Field
            name="end"
            label="Encerramento (seu horário local)"
            type="datetime-local"
            required
          />
        </div>
        <p className="fine-print">
          Ao publicar, salvamos os dados e a imagem da obra. Seu lote continuará
          disponível mesmo se a API do museu estiver fora do ar. Lotes com
          lances não podem ser cancelados.
        </p>
        <Button
          type="submit"
          className="orange-button"
          isDisabled={!selected}
          isPending={busy}
        >
          Publicar lote <ArrowUpRight size={18} />
        </Button>
      </form>
    </section>
  );
}

function Share({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      onPress={async () => {
        try {
          await navigator.clipboard.writeText(
            `${window.location.origin}${path}`,
          );
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      <Copy size={16} />
      {copied ? "Link copiado" : "Copiar link público"}
    </Button>
  );
}
function Audit({ id }: { id: string }) {
  const { data, error } = useResource<{
    title: string;
    intact: boolean;
    bids: Bid[];
    checkpoint: string;
  }>(`audit/${id}`, true);
  if (!data)
    return (
      <section className="page">
        {error ? <Notice>{error}</Notice> : <Loading />}
      </section>
    );
  return (
    <section className="page">
      <Link href={`/lotes/${id}`} className="back">
        <ArrowLeft size={16} /> Voltar ao lote
      </Link>
      <span className="eyebrow">TRANSPARÊNCIA, SEM PRECISAR DE LOGIN</span>
      <h1>Histórico aberto. Confiança verificada.</h1>
      <p className="lead">{data.title}</p>
      {error && <Notice>{error}</Notice>}
      <div className={`audit-result ${data.intact ? "" : "broken"}`}>
        <ShieldCheck size={36} />
        <div>
          <h2>{data.intact ? "Histórico íntegro" : "Adulteração detectada"}</h2>
          <p>
            {data.intact
              ? "Os lances e o checkpoint correspondem aos registros autenticados pelo servidor."
              : "Há registros alterados, inseridos ou removidos. As operações deste lote estão bloqueadas."}
          </p>
        </div>
        <Share path={`/auditoria/${id}`} />
      </div>
      <BidTable bids={data.bids} />
      <div className="panel audit-explanation">
        <h2>Como verificamos?</h2>
        <p>
          Cada lance tem uma assinatura HMAC que inclui o lance anterior. Um
          checkpoint autenticado registra a quantidade e o último lance,
          permitindo detectar também a remoção do final do histórico. A chave
          fica fora do banco de dados.
        </p>
        <p>
          Os participantes aparecem com identificadores públicos, sem nomes ou
          e-mails. Esta verificação é feita pelo servidor; não é uma
          certificação externa nem protege contra comprometimento da chave ou
          restauração integral de um snapshot válido.
        </p>
        <label>Checkpoint atual</label>
        <code>{data.checkpoint}</code>
      </div>
    </section>
  );
}
function Receipt({ id }: { id: string }) {
  const { data, error } = useResource<{
    item: Item;
    winner: string;
    amount: number;
    settledAt: string;
    checkpoint: string;
  }>(`receipts/${id}`);
  if (!data)
    return (
      <section className="page">
        {error ? <Notice>{error}</Notice> : <Loading />}
      </section>
    );
  return (
    <section className="page narrow">
      <Link href={`/lotes/${id}`} className="back">
        <ArrowLeft size={16} /> Voltar ao lote
      </Link>
      <div className="panel receipt">
        <ShieldCheck size={40} />
        <span className="eyebrow">COMPROVANTE DE ARREMATE</span>
        <h1>
          Uma nova história
          <br />
          foi arrematada.
        </h1>
        <img src={data.item.image} alt={data.item.title} />
        <h2>{data.item.title}</h2>
        <p>{data.item.artist}</p>
        <dl className="details">
          <div>
            <dt>Arrematante</dt>
            <dd>{data.winner}</dd>
          </div>
          <div>
            <dt>Valor</dt>
            <dd>{brl(data.amount)}</dd>
          </div>
          <div>
            <dt>Liquidado em</dt>
            <dd>{date(data.settledAt)}</dd>
          </div>
        </dl>
        <Share path={`/comprovante/${id}`} />
        <Link className="audit-link" href={`/auditoria/${id}`}>
          Verificar histórico <ArrowUpRight size={16} />
        </Link>
        <p className="fine-print">
          Comprovante demonstrativo. Não representa venda de obra física nem
          transação com dinheiro real.
        </p>
      </div>
    </section>
  );
}

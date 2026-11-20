"use client";

import { useEffect, useRef, useState } from "react";
import {
  drawTeams,
  formatWhatsApp,
  parseList,
  whatsAppShareUrl,
  type DrawMode,
  type Player,
  type Team,
} from "@racha/core";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Dices,
  Hand,
  MessageCircle,
  Minus,
  Plus,
  RefreshCw,
  Scale,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { cn } from "@/lib/utils";

type Step = "lista" | "config" | "resultado";

interface StoredNote {
  skill: number;
  gk: boolean;
}

const NOTES_KEY = "racha:notas";
const CONFIG_KEY = "racha:config";

const PLACEHOLDER = [
  "Cola aqui a lista, do jeito que ela está no grupo:",
  "",
  "1. Carlão (g)",
  "2. João",
  "3. Pedro - 4",
  "4. Lucas",
  "5. Rafa",
].join("\n");

function loadNotes(): Record<string, StoredNote> {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveNote(player: Player) {
  const notes = loadNotes();
  notes[player.name.toLowerCase()] = {
    skill: player.skill,
    gk: player.isGoalkeeper,
  };
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function SorteioFlow() {
  const [step, setStep] = useState<Step>("lista");
  const [rawText, setRawText] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamCount, setTeamCount] = useState(2);
  const [mode, setMode] = useState<DrawMode>("balanced");
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [newName, setNewName] = useState("");
  const idCounter = useRef(0);

  useEffect(() => {
    try {
      const config = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? "null");
      if (config?.teamCount >= 2) setTeamCount(config.teamCount);
      if (config?.mode === "random" || config?.mode === "balanced") {
        setMode(config.mode);
      }
    } catch {
      // config corrompida: segue com defaults
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ teamCount, mode }));
  }, [teamCount, mode]);

  function readList() {
    const parsed = parseList(rawText);
    const notes = loadNotes();
    setPlayers(
      parsed.map((p) => {
        const note = notes[p.name.toLowerCase()];
        if (!note) return p;
        return {
          ...p,
          skill: p.skillExplicit ? p.skill : note.skill,
          isGoalkeeper: p.isGoalkeeper || note.gk,
        };
      }),
    );
  }

  function updatePlayer(id: string, patch: Partial<Player>) {
    setPlayers((current) =>
      current.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...patch };
        saveNote(updated);
        return updated;
      }),
    );
  }

  function addPlayer() {
    const name = newName.trim();
    if (!name) return;
    const note = loadNotes()[name.toLowerCase()];
    setPlayers((current) => [
      ...current,
      {
        id: `manual-${idCounter.current++}`,
        name,
        skill: note?.skill ?? 3,
        isGoalkeeper: note?.gk ?? false,
      },
    ]);
    setNewName("");
  }

  function sortear() {
    setTeams(drawTeams(players, { teamCount, mode }));
    setStep("resultado");
    setCopied(false);
  }

  async function copyResult() {
    if (!teams) return;
    try {
      await navigator.clipboard.writeText(formatWhatsApp(teams));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard bloqueado (http/permissão): o usuário ainda tem o botão do WhatsApp
    }
  }

  const maxTeams = Math.min(8, Math.max(2, Math.floor(players.length / 2)));
  const stepIndex = step === "lista" ? 0 : step === "config" ? 1 : 2;

  return (
    <div className="flex flex-col gap-4">
      <StepNav current={stepIndex} />

      {step === "lista" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Cola a lista do grupo</CardTitle>
              <CardDescription>
                Números, seções de goleiro, ✅ de confirmação — pode colar do
                jeito que estiver.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                onBlur={readList}
                placeholder={PLACEHOLDER}
                rows={8}
                className="resize-none font-mono text-[13px] leading-5"
              />
            </CardContent>
          </Card>

          {players.length > 0 && (
            <Card size="sm">
              <CardHeader>
                <CardTitle>
                  {players.length} jogadores
                  <Badge variant="secondary" className="ml-2 align-middle">
                    {players.filter((p) => p.isGoalkeeper).length} no gol
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Ajusta as notas (só você vê) e marca quem é goleiro.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {players.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 py-1.5">
                      <Button
                        variant={p.isGoalkeeper ? "default" : "ghost"}
                        size="icon-sm"
                        aria-label={`${p.name}: alternar goleiro`}
                        onClick={() =>
                          updatePlayer(p.id, { isGoalkeeper: !p.isGoalkeeper })
                        }
                      >
                        <Hand
                          className={cn(!p.isGoalkeeper && "stroke-zinc-400")}
                        />
                      </Button>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {p.name}
                      </span>
                      <StarRating
                        value={p.skill}
                        onChange={(skill) => updatePlayer(p.id, { skill })}
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remover ${p.name}`}
                        className="text-zinc-400 hover:text-destructive"
                        onClick={() =>
                          setPlayers((cur) => cur.filter((x) => x.id !== p.id))
                        }
                      >
                        <X />
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                    placeholder="Chegou mais um? Nome…"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Adicionar jogador"
                    onClick={addPlayer}
                  >
                    <Plus />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            size="lg"
            className="h-11 w-full text-[15px]"
            disabled={players.length < 4}
            onClick={() => setStep("config")}
          >
            Continuar
            <ArrowRight data-icon="inline-end" />
          </Button>
        </>
      )}

      {step === "config" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Quantos times?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-6 py-2">
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="rounded-full"
                  aria-label="Menos um time"
                  onClick={() => setTeamCount((n) => Math.max(2, n - 1))}
                >
                  <Minus />
                </Button>
                <span className="w-12 text-center text-4xl font-semibold tracking-tight tabular-nums">
                  {teamCount}
                </span>
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="rounded-full"
                  aria-label="Mais um time"
                  onClick={() => setTeamCount((n) => Math.min(maxTeams, n + 1))}
                >
                  <Plus />
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {teamSummary(players.length, teamCount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipo de sorteio</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <ModeOption
                active={mode === "balanced"}
                onClick={() => setMode("balanced")}
                icon={<Scale className="size-4" />}
                title="Equilibrado"
                subtitle="usa as notas"
              />
              <ModeOption
                active={mode === "random"}
                onClick={() => setMode("random")}
                icon={<Dices className="size-4" />}
                title="Aleatório"
                subtitle="pura sorte"
              />
            </CardContent>
          </Card>

          <Button size="lg" className="h-11 w-full text-[15px]" onClick={sortear}>
            Sortear times
          </Button>
          <Button variant="ghost" onClick={() => setStep("lista")}>
            <ArrowLeft data-icon="inline-start" />
            Voltar pra lista
          </Button>
        </>
      )}

      {step === "resultado" && (
        <>
          {teams?.map((team) => (
            <Card key={team.vest.name} size="sm" className="pt-0">
              <div className="h-1.5" style={{ background: team.vest.hex }} />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span
                    className="size-3.5 rounded-full border border-black/15"
                    style={{ background: team.vest.hex }}
                  />
                  Time {team.vest.name}
                  <Badge variant="secondary" className="ml-auto">
                    {team.players.length} jogadores
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="divide-y divide-border">
                  {team.players.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-3 py-1.5 text-sm">
                      <span className="w-4 text-right text-xs text-muted-foreground tabular-nums">
                        {i + 1}
                      </span>
                      <span className="font-medium">{p.name}</span>
                      {p.isGoalkeeper && (
                        <Badge variant="outline" className="ml-auto gap-1">
                          <Hand className="size-3" />
                          goleiro
                        </Badge>
                      )}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="lg"
              className="h-11"
              onClick={copyResult}
            >
              {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
            <a
              href={teams ? whatsAppShareUrl(formatWhatsApp(teams)) : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 bg-[#1daa61] text-white hover:bg-[#1daa61]/90",
              )}
            >
              <MessageCircle data-icon="inline-start" />
              Mandar no zap
            </a>
          </div>
          <Button variant="outline" onClick={sortear}>
            <RefreshCw data-icon="inline-start" />
            Sortear de novo
          </Button>
          <Button variant="ghost" onClick={() => setStep("config")}>
            <ArrowLeft data-icon="inline-start" />
            Mudar times
          </Button>
        </>
      )}
    </div>
  );
}

function StepNav({ current }: { current: number }) {
  const steps = ["Lista", "Times", "Resultado"];
  return (
    <nav className="flex items-center gap-1.5" aria-label="Etapas">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5">
          {i > 0 && <div className="h-px w-4 bg-border" />}
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              i === current ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-[11px] tabular-nums",
                i < current
                  ? "bg-primary text-primary-foreground"
                  : i === current
                    ? "border border-primary text-foreground"
                    : "border border-border",
              )}
            >
              {i < current ? <Check className="size-3" /> : i + 1}
            </span>
            {label}
          </span>
        </div>
      ))}
    </nav>
  );
}

function teamSummary(playerCount: number, teamCount: number): string {
  const base = Math.floor(playerCount / teamCount);
  const leftover = playerCount % teamCount;
  if (leftover === 0) {
    return `${playerCount} jogadores → ${teamCount} times de ${base}`;
  }
  return `${playerCount} jogadores → ${teamCount} times de ${base} (${leftover} ${
    leftover > 1 ? "times ficam" : "time fica"
  } com ${base + 1})`;
}

function ModeOption({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
        active
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:bg-muted",
      )}
    >
      <span className="flex items-center gap-1.5 text-sm font-medium">
        {icon}
        {title}
      </span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </button>
  );
}

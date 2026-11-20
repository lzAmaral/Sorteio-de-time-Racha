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
import { StarRating } from "./star-rating";

type Step = "lista" | "config" | "resultado";

interface StoredNote {
  skill: number;
  gk: boolean;
}

const NOTES_KEY = "racha:notas";
const CONFIG_KEY = "racha:config";

const EXAMPLE = [
  "1. Carlão (g)",
  "2. João",
  "3. Pedro - 4",
  "4. Lucas",
  "5. Rafa ⭐⭐",
  "6. Zé",
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

  if (step === "lista") {
    return (
      <section className="flex flex-col gap-4">
        <StepBadge current={1} label="Cola a lista do grupo" />
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          onBlur={readList}
          placeholder={`Cola aqui a lista do zap, do jeito que estiver:\n\n${EXAMPLE}`}
          rows={8}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 font-mono text-sm placeholder:text-zinc-600 focus:border-green-600 focus:outline-none"
        />
        {rawText.trim() !== "" && players.length === 0 && (
          <button
            type="button"
            onClick={readList}
            className="rounded-xl bg-zinc-800 py-3 font-semibold"
          >
            Ler lista
          </button>
        )}

        {players.length > 0 && (
          <>
            <p className="text-sm text-zinc-400">
              <strong className="text-zinc-200">{players.length} jogadores</strong>{" "}
              — ajusta as notas (só você vê) e marca os goleiros:
            </p>
            <ul className="flex flex-col gap-1.5">
              {players.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() =>
                      updatePlayer(p.id, { isGoalkeeper: !p.isGoalkeeper })
                    }
                    aria-label={`${p.name}: alternar goleiro`}
                    className={`rounded-lg px-1.5 py-1 text-base ${
                      p.isGoalkeeper
                        ? "bg-green-900/60"
                        : "opacity-30 grayscale"
                    }`}
                  >
                    🧤
                  </button>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {p.name}
                  </span>
                  <StarRating
                    value={p.skill}
                    onChange={(skill) => updatePlayer(p.id, { skill })}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPlayers((cur) => cur.filter((x) => x.id !== p.id))
                    }
                    aria-label={`Remover ${p.name}`}
                    className="px-1 text-zinc-600 hover:text-red-400"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                placeholder="Chegou mais um? Nome…"
                className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm placeholder:text-zinc-600 focus:border-green-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={addPlayer}
                className="rounded-xl bg-zinc-800 px-4 text-sm font-semibold"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => setStep("config")}
              disabled={players.length < 4}
              className="rounded-xl bg-green-600 py-3.5 text-base font-bold text-white disabled:opacity-40"
            >
              Continuar →
            </button>
          </>
        )}
      </section>
    );
  }

  if (step === "config") {
    const perTeam = Math.floor(players.length / teamCount);
    const leftover = players.length % teamCount;
    return (
      <section className="flex flex-col gap-5">
        <StepBadge current={2} label="Define os times" />
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="mb-3 text-sm font-semibold text-zinc-300">
            Quantos times?
          </p>
          <div className="flex items-center justify-center gap-6">
            <Stepper
              onClick={() => setTeamCount((n) => Math.max(2, n - 1))}
              label="−"
            />
            <span className="w-10 text-center text-4xl font-black">
              {teamCount}
            </span>
            <Stepper
              onClick={() => setTeamCount((n) => Math.min(maxTeams, n + 1))}
              label="+"
            />
          </div>
          <p className="mt-3 text-center text-sm text-zinc-400">
            {players.length} jogadores → {teamCount} times de {perTeam}
            {leftover > 0 && ` (${leftover} time${leftover > 1 ? "s" : ""} com ${perTeam + 1})`}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="mb-3 text-sm font-semibold text-zinc-300">Sorteio</p>
          <div className="grid grid-cols-2 gap-2">
            <ModeButton
              active={mode === "balanced"}
              onClick={() => setMode("balanced")}
              title="⚖️ Equilibrado"
              subtitle="usa as notas"
            />
            <ModeButton
              active={mode === "random"}
              onClick={() => setMode("random")}
              title="🎲 Aleatório"
              subtitle="pura sorte"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={sortear}
          className="rounded-xl bg-green-600 py-4 text-lg font-black text-white"
        >
          ⚽ Sortear times
        </button>
        <button
          type="button"
          onClick={() => setStep("lista")}
          className="text-sm text-zinc-500"
        >
          ← Voltar pra lista
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <StepBadge current={3} label="Resultado — bora pro jogo!" />
      <div className="flex flex-col gap-3">
        {teams?.map((team) => (
          <article
            key={team.vest.name}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60"
          >
            <header
              className="flex items-center gap-2 px-4 py-2.5 font-bold"
              style={{ background: team.vest.hex, color: team.vest.textHex }}
            >
              <span>{team.vest.emoji}</span>
              <span>TIME {team.vest.name.toUpperCase()}</span>
              <span className="ml-auto text-sm font-semibold opacity-70">
                {team.players.length}
              </span>
            </header>
            <ul className="px-4 py-3 text-sm">
              {team.players.map((p, i) => (
                <li key={p.id} className="flex gap-2 py-0.5">
                  <span className="w-5 text-zinc-500">{i + 1}.</span>
                  <span className="font-medium">{p.name}</span>
                  {p.isGoalkeeper && <span>🧤</span>}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={copyResult}
          className="rounded-xl bg-zinc-800 py-3.5 font-bold"
        >
          {copied ? "✅ Copiado!" : "📋 Copiar"}
        </button>
        <a
          href={teams ? whatsAppShareUrl(formatWhatsApp(teams)) : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-green-600 py-3.5 text-center font-bold text-white"
        >
          💬 Mandar no zap
        </a>
      </div>
      <button
        type="button"
        onClick={sortear}
        className="rounded-xl border border-zinc-700 py-3 font-semibold text-zinc-300"
      >
        🔁 Sortear de novo
      </button>
      <button
        type="button"
        onClick={() => setStep("config")}
        className="text-sm text-zinc-500"
      >
        ← Mudar times
      </button>
    </section>
  );
}

function StepBadge({ current, label }: { current: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-400">
      <span className="flex gap-1">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1.5 w-6 rounded-full ${
              n <= current ? "bg-green-500" : "bg-zinc-800"
            }`}
          />
        ))}
      </span>
      <span className="font-semibold text-zinc-200">{label}</span>
    </div>
  );
}

function Stepper({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 w-12 rounded-full border border-zinc-700 text-2xl font-bold active:bg-zinc-800"
    >
      {label}
    </button>
  );
}

function ModeButton({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left ${
        active
          ? "border-green-600 bg-green-950/40"
          : "border-zinc-800 bg-zinc-900/40"
      }`}
    >
      <span className="block font-bold">{title}</span>
      <span className="block text-xs text-zinc-400">{subtitle}</span>
    </button>
  );
}

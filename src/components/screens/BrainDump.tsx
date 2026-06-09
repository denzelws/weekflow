import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui";
import { parseTaskTitles } from "@/utils";
import { useApp } from "@/store/AppContext";

const MAX_ITEMS = 21;
const PLACEHOLDER = "Uma tarefa por linha, vírgula ou ponto e vírgula...";

type BrainDumpStep = "capture" | "review" | "saved";

const countRawItems = (text: string): number =>
  text
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3).length;

export function BrainDump() {
  const store = useApp();
  const [step, setStep] = useState<BrainDumpStep>("capture");
  const [text, setText] = useState("");
  const [draftItems, setDraftItems] = useState<string[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(
    () => new Set(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const submittingRef = useRef(false);

  const itemCount = countRawItems(text);
  const overLimit = itemCount > MAX_ITEMS;
  const canContinue = itemCount > 0 && !overLimit;
  const selectedCount = selectedIndexes.size;
  const backlogCount = draftItems.length - selectedCount;

  useEffect(() => {
    if (step === "capture") {
      ref.current?.focus();
    }
  }, [step]);

  const handleContinue = () => {
    if (!canContinue) return;

    const parsedItems = parseTaskTitles(text);
    if (parsedItems.length === 0) return;

    setDraftItems(parsedItems);
    setSelectedIndexes(new Set());
    setStep("review");
  };

  const toggleItem = (index: number) => {
    setSelectedIndexes((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIndexes(new Set(draftItems.map((_, index) => index)));
  };

  const handleClearSelection = () => {
    setSelectedIndexes(new Set());
  };

  const handleBack = () => {
    setStep("capture");
    submittingRef.current = false;
    setIsSubmitting(false);
  };

  const handleConfirm = () => {
    if (submittingRef.current || draftItems.length === 0) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    store.buildWeekFromDraft(draftItems, Array.from(selectedIndexes));

    if (selectedIndexes.size === 0) {
      setText("");
      setDraftItems([]);
      setSelectedIndexes(new Set());
      submittingRef.current = false;
      setIsSubmitting(false);
      setStep("saved");
    }
  };

  if (step === "saved") {
    return (
      <div className="screen px-8 justify-between">
        <div className="flex items-center gap-2 pt-2 animate-fade-in">
          <span className="w-2 h-2 rounded-sm bg-primary rotate-45 inline-block" />
          <span className="font-display text-xs font-bold tracking-widest text-on-muted uppercase">
            WeekFlow
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-5">
          <div
            className="anim-hidden animate-slide-up"
            style={{ animationFillMode: "forwards" }}
          >
            <h1 className="text-h1 mb-3 leading-tight">
              Tarefas salvas
              <br />
              <span className="text-gradient">no backlog.</span>
            </h1>
            <p className="text-body text-muted">
              Você pode montar sua semana quando quiser.
            </p>
          </div>
        </div>

        <div
          className="anim-hidden animate-slide-up delay-200 pb-safe"
          style={{ animationFillMode: "forwards" }}
        >
          <Button
            fullWidth
            size="lg"
            onClick={() => setStep("capture")}
            iconRight={<span className="text-lg">→</span>}
          >
            Capturar mais
          </Button>
        </div>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="screen px-6 justify-between">
        <div className="flex items-center gap-2 pt-2 animate-fade-in">
          <span className="w-2 h-2 rounded-sm bg-primary rotate-45 inline-block" />
          <span className="font-display text-xs font-bold tracking-widest text-on-muted uppercase">
            WeekFlow
          </span>
        </div>

        <div className="pt-8 pb-4">
          <div
            className="anim-hidden animate-slide-up"
            style={{ animationFillMode: "forwards" }}
          >
            <h1 className="text-h2 mb-3 leading-tight">
              O que merece entrar
              <br />
              <span className="text-gradient">nesta semana?</span>
            </h1>
            <p className="text-body-sm text-muted">
              Selecione apenas o que você já quer assumir agora. O restante
              ficará salvo no backlog.
            </p>
          </div>

          <div
            className="grid grid-cols-2 gap-3 mt-5 anim-hidden animate-slide-up delay-100"
            style={{ animationFillMode: "forwards" }}
          >
            <div className="card-low p-3">
              <p className="text-h3 text-primary">{selectedCount}</p>
              <p className="text-label text-muted">para esta semana</p>
            </div>
            <div className="card-low p-3">
              <p className="text-h3 text-secondary">{backlogCount}</p>
              <p className="text-label text-muted">salvas para depois</p>
            </div>
          </div>

          <div
            className="flex gap-2 mt-4 anim-hidden animate-slide-up delay-150"
            style={{ animationFillMode: "forwards" }}
          >
            <Button size="sm" variant="ghost" onClick={handleSelectAll}>
              Selecionar todas
            </Button>
            <Button size="sm" variant="ghost" onClick={handleClearSelection}>
              Limpar seleção
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-6">
          {draftItems.map((title, index) => {
            const selected = selectedIndexes.has(index);

            return (
              <label
                key={`${title}-${index}`}
                className={`card-low flex items-center gap-3 p-4 cursor-pointer anim-hidden animate-slide-up
                  ${selected ? "border-primary/50 bg-primary-muted" : ""}`}
                style={{
                  animationDelay: `${200 + index * 30}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selected}
                  onChange={() => toggleItem(index)}
                />
                <span
                  className={`checkbox ${selected ? "checked" : ""}`}
                  aria-hidden="true"
                >
                  {selected && (
                    <svg
                      className="w-3 h-3 text-on-primary"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </span>
                <span className="text-body-sm text-on-surface">{title}</span>
              </label>
            );
          })}
        </div>

        <div
          className="grid grid-cols-[auto_1fr] gap-3 pb-safe anim-hidden animate-slide-up"
          style={{ animationFillMode: "forwards" }}
        >
          <Button size="lg" variant="ghost" onClick={handleBack}>
            Voltar
          </Button>
          <Button
            fullWidth
            size="lg"
            onClick={handleConfirm}
            disabled={isSubmitting}
            iconRight={<span className="text-lg">→</span>}
          >
            Montar minha semana
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen px-8 justify-between">
      <div className="flex items-center gap-2 pt-2 animate-fade-in">
        <span className="w-2 h-2 rounded-sm bg-primary rotate-45 inline-block" />
        <span className="font-display text-xs font-bold tracking-widest text-on-muted uppercase">
          WeekFlow
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-8">
        <div
          className="anim-hidden animate-slide-up delay-100"
          style={{ animationFillMode: "forwards" }}
        >
          <h1 className="text-h1 mb-3 leading-tight">
            O que está na
            <br />
            <span className="text-gradient">sua cabeça?</span>
          </h1>
          <p className="text-body text-muted">
            Jogue tudo aqui. Sem filtrar agora.
          </p>
          <p className="text-body-sm text-muted mt-3">
            Capture primeiro. Priorize depois.
          </p>
        </div>

        <div
          className="anim-hidden animate-slide-up delay-200"
          style={{ animationFillMode: "forwards" }}
        >
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={6}
            className="textarea w-full"
            aria-label="Lista de tarefas capturadas"
          />

          <div className="flex justify-between mt-2 px-1">
            <span className="text-label">
              {itemCount > 0
                ? `${itemCount} item${itemCount > 1 ? "s" : ""}`
                : ""}
            </span>
            <span
              className={`text-label ${overLimit ? "text-secondary" : "text-on-muted"}`}
            >
              {itemCount}/{MAX_ITEMS} máx
            </span>
          </div>

          {overLimit && (
            <p className="text-body-sm text-secondary mt-2 animate-fade-in">
              Limite inicial de {MAX_ITEMS} itens por captura. Remova{" "}
              {itemCount - MAX_ITEMS} para continuar.
            </p>
          )}
        </div>
      </div>

      <div
        className="anim-hidden animate-slide-up delay-300 pb-safe"
        style={{ animationFillMode: "forwards" }}
      >
        <Button
          fullWidth
          size="lg"
          disabled={!canContinue}
          onClick={handleContinue}
          iconRight={<span className="text-lg">→</span>}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}

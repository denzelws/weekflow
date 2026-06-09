import { useState, type FormEvent } from "react";
import { Badge, Button } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppShell, Header, BottomNav } from "@/components/layout";
import { formatDate } from "@/utils";
import { useApp } from "@/store/AppContext";

const createdDate = (createdAt: string): string => {
  const [date] = createdAt.split("T");
  return date ? formatDate(date) : "";
};

export function ObligationsBacklog() {
  const store = useApp();
  const { state, backlogObligations, scheduledObligations } = store;
  const [title, setTitle] = useState("");

  const trimmedTitle = title.trim();
  const hasActiveWeek = Boolean(state.currentWeek);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedTitle) return;

    store.addObligation(trimmedTitle);
    setTitle("");
  };

  return (
    <AppShell
      header={<Header profile={state.profile} />}
      showNav
      className="px-6"
    >
      <div
        className="pt-6 mb-6 anim-hidden animate-slide-up"
        style={{ animationFillMode: "forwards" }}
      >
        <p className="section-label mb-2">Nem tudo precisa entrar na semana agora.</p>
        <h2 className="text-h3 mb-2">Backlog de Obrigações</h2>
        <p className="text-body-sm text-muted">
          Guarde aqui tarefas importantes que ainda não precisam entrar na
          semana atual.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card-low p-4 mb-6 anim-hidden animate-slide-up delay-100"
        style={{ animationFillMode: "forwards" }}
      >
        <label htmlFor="obligation-title" className="sr-only">
          Adicionar obrigação
        </label>
        <div className="flex flex-col gap-3">
          <input
            id="obligation-title"
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Melhorar atributos dos spans"
            autoComplete="off"
          />
          <Button type="submit" disabled={!trimmedTitle} fullWidth>
            Adicionar obrigação
          </Button>
        </div>
      </form>

      <section className="mb-8">
        <div className="mb-2">
          <p className="section-label">Pendentes</p>
        </div>

        {!hasActiveWeek && (
          <p className="text-body-sm text-muted mb-3">
            Inicie uma semana para adicionar tarefas ao planejamento atual.
          </p>
        )}

        {backlogObligations.length === 0 ? (
          <EmptyState
            icon="☰"
            title="Nenhuma obrigação pendente"
            body="Adicione tarefas futuras sem sobrecarregar sua semana atual."
            className="card-low py-12"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {backlogObligations.map((obligation, index) => (
              <article
                key={obligation.id}
                className="card-low p-4 anim-hidden animate-slide-up"
                style={{
                  animationDelay: `${index * 35}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <div className="mb-4">
                <h3 className="text-label text-on-surface mb-1">
                    {obligation.title}
                  </h3>
                  <p className="text-caption text-muted">
                    Criada em {createdDate(obligation.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="sm"
                    onClick={() => store.addObligationToWeek(obligation.id)}
                    disabled={!hasActiveWeek}
                    fullWidth
                  >
                    Adicionar à semana
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => store.discardObligation(obligation.id)}
                    fullWidth
                  >
                    Descartar
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {scheduledObligations.length > 0 && (
        <section className="mb-8">
          <div className="mb-2">
            <p className="section-label">Na semana atual</p>
          </div>

          <div className="flex flex-col gap-3">
            {scheduledObligations.map((obligation) => (
              <article
                key={obligation.id}
                className="card-low p-4 flex items-start justify-between gap-4"
              >
                <h3 className="text-label text-on-surface min-w-0 flex-1">
                  {obligation.title}
                </h3>
                <Badge variant="muted" className="shrink-0">
                  Adicionada à semana
                </Badge>
              </article>
            ))}
          </div>
        </section>
      )}

      <BottomNav current={state.screen} onNavigate={store.navigateTo} />
    </AppShell>
  );
}

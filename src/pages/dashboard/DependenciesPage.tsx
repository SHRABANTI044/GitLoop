import { useEffect, useState } from "react";
import { PackageSearch, FolderGit2, Plus, ShieldCheck, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { EmptyState, LoadingBlock } from "../../components/dashboard/widgets";
import { useAuth } from "../../context/AuthContext";
import { DashboardAPI, langColor } from "../../lib/dashboard";
import type { Repository } from "../../lib/auth";

interface Dep {
  name: string;
  kind: string;
  status: "detected" | "review";
  note: string;
}

/** Dependencies inferred from repo language + description keywords (evidence-based). */
function depsFor(repo: Repository): Dep[] {
  const d = (repo.description ?? "").toLowerCase();
  const deps: Dep[] = [];
  const lang = repo.language ?? "";

  if (lang === "Python") {
    deps.push({ name: "Python runtime", kind: "Language", status: "detected", note: "Primary language from GitHub metadata" });
    deps.push({ name: "pip", kind: "Package manager", status: "detected", note: "Standard for Python projects" });
  }
  if (lang === "TypeScript" || lang === "JavaScript") {
    deps.push({ name: lang, kind: "Language", status: "detected", note: "Primary language from GitHub metadata" });
    deps.push({ name: "npm", kind: "Package manager", status: "detected", note: "Standard for JS/TS projects" });
  }
  if (lang === "Go") {
    deps.push({ name: "Go modules", kind: "Package manager", status: "detected", note: "Standard for Go projects" });
  }
  if (/react/.test(d)) deps.push({ name: "React", kind: "Framework", status: "detected", note: "Mentioned in repository description" });
  if (/node\.?js|express/.test(d)) deps.push({ name: "Node.js", kind: "Runtime", status: "detected", note: "Mentioned in repository description" });
  if (/fastapi/.test(d)) deps.push({ name: "FastAPI", kind: "Framework", status: "detected", note: "Mentioned in repository description" });
  if (/flask/.test(d)) deps.push({ name: "Flask", kind: "Framework", status: "detected", note: "Mentioned in repository description" });
  if (/postgres/.test(d)) deps.push({ name: "PostgreSQL", kind: "Database", status: "detected", note: "Mentioned in repository description" });
  if (/machine learning|ml\b|tensorflow|scikit/.test(d)) deps.push({ name: "ML stack", kind: "Library", status: "review", note: "ML mentioned — verify pinned versions in your manifest" });

  if (deps.length === 0) {
    deps.push({ name: "No dependencies detected", kind: "—", status: "review", note: "Not enough metadata to infer dependencies. Add a description or language info on GitHub." });
  }
  return deps;
}

export default function DependenciesPage() {
  const { user } = useAuth();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    DashboardAPI.repositories(user.id).then((rs) => { setRepos(rs); setLoading(false); });
  }, [user]);

  const createReviewTask = async (repo: Repository, dep: Dep) => {
    if (!user) return;
    const key = `${repo.id}:${dep.name}`;
    setCreating(key);
    try {
      await DashboardAPI.createTask(user.id, {
        title: `Review ${dep.name} in ${repo.name}`,
        repositoryId: repo.id,
        priority: "medium",
        dueDate: null,
        description: `Verify pinned versions and manifest for ${dep.name} (${dep.kind}). ${dep.note}.`,
      });
      setDone((s) => new Set(s).add(key));
    } finally {
      setCreating(null);
    }
  };

  if (loading) return <LoadingBlock label="Analyzing dependencies…" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-extrabold tracking-tight">Dependency <span className="text-gradient">Analyzer</span></h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#94A3B8]">
          Dependencies detected from your repositories&apos; GitHub metadata. GitLoop never claims vulnerabilities without a verified advisory source — instead it flags items for your review.
        </p>
      </div>

      {repos.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No repositories to analyze"
          message="Select repositories first — the analyzer works from your authorized GitHub metadata."
        />
      ) : (
        <div className="space-y-5">
          {repos.map((repo) => {
            const deps = depsFor(repo);
            return (
              <section key={repo.id} className="rounded-[22px] border border-[#252D43] bg-[#10182A]/80 p-5 backdrop-blur sm:p-6">
                <header className="flex flex-wrap items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#252D43] bg-[#151D32] text-[#94A3B8]">
                    <FolderGit2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-white">{repo.fullName}</p>
                    <p className="flex items-center gap-2 text-[12px] text-[#64748B]">
                      {repo.language && <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: langColor(repo.language) }} />{repo.language}</span>}
                      <span>{deps.length} item{deps.length > 1 ? "s" : ""} detected</span>
                    </p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#22D3EE]/25 bg-[#22D3EE]/10 px-3 py-1 text-[11px] font-bold text-[#67E8F9]">
                    <ShieldCheck className="h-3.5 w-3.5" /> Metadata-based
                  </span>
                </header>

                <ul className="mt-4 divide-y divide-[#252D43]/60">
                  {deps.map((dep) => {
                    const key = `${repo.id}:${dep.name}`;
                    const isDone = done.has(key);
                    return (
                      <li key={dep.name} className="flex flex-wrap items-center gap-3 py-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${dep.status === "review" ? "border-[#FBBF24]/35 bg-[#FBBF24]/10 text-[#FCD34D]" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"}`}>
                          {dep.status === "review" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-semibold text-white">{dep.name} <span className="ml-1 text-[11px] font-medium text-[#64748B]">{dep.kind}</span></p>
                          <p className="text-[12px] text-[#94A3B8]">{dep.note}</p>
                        </div>
                        {isDone ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" /> Task created
                          </span>
                        ) : (
                          <button
                            onClick={() => createReviewTask(repo, dep)}
                            disabled={creating === key}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#252D43] px-3 py-2 text-[12px] font-semibold text-[#CBD5E1] transition-colors hover:border-[#8B5CF6]/45 hover:text-white disabled:opacity-60"
                          >
                            {creating === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                            Create review task
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-[#64748B]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#22D3EE]" />
        For full manifest parsing (package.json, requirements.txt, go.mod) and verified vulnerability scanning, connect the backend analyzer — GitLoop will never guess versions or invent CVEs.
      </p>
    </div>
  );
}

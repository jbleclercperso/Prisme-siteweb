// Deux ordinateurs au plus par licence (décision du fondateur, 18/10/2026).
//
// POST /api/activation  { "key": "PRISME1-…", "machine": "<empreinte>", "nom": "PC-SALON" }
//   → 200 { "activation": "PRISMEA1-…" }                cet ordinateur est (ou était déjà) activé
//   → 200 { "error": "limite", "machines": ["PC-1", …] }  déjà deux ordinateurs actifs
// POST /api/activation  { "action": "liberer", "key": …, "machine": … }
//   → 200 { "ok": true }                                  cet ordinateur ne compte plus
//   → 400 clé illisible ou pas de nous · 503 pas configuré · 502 base injoignable
//
// Prisme n'envoie que sa clé, une empreinte anonyme de l'ordinateur et son nom (pour que le
// client reconnaisse ses machines) : rien de la collection. La liste des ordinateurs vit dans
// le Supabase de ConchyPro (migration 0048_prisme_activations.sql).
import { MAX_ORDINATEURS, licenceId, makeActivation, privateKey, readKey } from "../lib/licence.mjs";
import { appelerBase } from "../lib/paiements.mjs";
import { json } from "../lib/stripe.mjs";

const MACHINE = /^[0-9a-f]{16,64}$/;

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "method" });
  const key = privateKey();
  if (!key) return json(503, { error: "not_configured" });

  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const payload = readKey(body.key, key);
  const machine = String(body.machine || "").toLowerCase();
  if (!payload || !MACHINE.test(machine)) return json(400, { error: "key" });
  const now = Math.floor(Date.now() / 1000);
  const lid = licenceId(payload);

  try {
    if (body.action === "liberer") {
      await appelerBase("prisme_liberer", { p_licence: lid, p_machine: machine });
      return json(200, { ok: true });
    }
    if (payload.expires && payload.expires <= now) return json(200, { error: "expiree" });
    const nom = String(body.nom || "").replace(/[^\p{L}\p{N} ._'-]/gu, "").slice(0, 60);
    const r = await appelerBase("prisme_activer", {
      p_licence: lid,
      p_machine: machine,
      p_nom: nom,
      p_email: payload.email || "",
      p_max: MAX_ORDINATEURS,
    });
    if (!r || r.ok !== true) {
      return json(200, { error: "limite", machines: Array.isArray(r?.machines) ? r.machines.slice(0, 5) : [] });
    }
    return json(200, { activation: makeActivation({ lid, machine, issued: now }, key) });
  } catch (err) {
    console.error("activation", err.message);
    return json(502, { error: "base" });
  }
};

export const config = { path: "/api/activation" };

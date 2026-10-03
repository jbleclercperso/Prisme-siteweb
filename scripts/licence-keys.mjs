// Les clés de licence de Prisme.
//
//   npm run licence:keys
//     Fabrique la paire de clés, une fois pour toutes :
//     - la clé privée, à mettre dans Netlify (variable PRISME_LICENCE_PRIVATE),
//       et nulle part ailleurs : qui l'a peut fabriquer des licences ;
//     - la clé publique, à coller dans Prisme (videosorter/licence.py, PUBLIC_KEY).
//
//   PRISME_LICENCE_PRIVATE=… npm run licence:issue -- --email vous@exemple.fr [--plan lifetime]
//     Émet une licence à la main : pour vous, un testeur, un geste commercial.
//     Seule la licence à vie s'émet ainsi (un abonnement naît d'un paiement).
import crypto from "node:crypto";
import { makeKey, privateKey, publicKeyBase64 } from "../netlify/lib/licence.mjs";

const [command, ...args] = process.argv.slice(2);
const option = (name) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : undefined;
};

if (command === "issue") {
  const key = privateKey();
  if (!key) {
    console.error("Il manque PRISME_LICENCE_PRIVATE (la clé privée donnée par `npm run licence:keys`).");
    process.exit(1);
  }
  const plan = option("plan") || "lifetime";
  if (plan !== "lifetime") {
    console.error("Seule la licence à vie s'émet à la main : --plan lifetime.");
    process.exit(1);
  }
  console.log(makeKey({ plan: "vie", expires: 0, email: option("email") || "", issued: Math.floor(Date.now() / 1000) }, key));
} else {
  if (process.env.PRISME_LICENCE_PRIVATE) {
    console.error("PRISME_LICENCE_PRIVATE existe déjà : changer de paire invaliderait toutes les licences vendues.");
    console.error("Clé publique correspondante :", publicKeyBase64(privateKey()));
    process.exit(1);
  }
  const { privateKey: priv } = crypto.generateKeyPairSync("ed25519");
  console.log("Clé privée : dans Netlify, variable PRISME_LICENCE_PRIVATE (à garder secrète) :");
  console.log("  " + priv.export({ format: "der", type: "pkcs8" }).toString("base64"));
  console.log("\nClé publique : dans Prisme, videosorter/licence.py :");
  console.log(`  PUBLIC_KEY = "${publicKeyBase64(priv)}"`);
  console.log("\nGardez aussi une copie de la clé privée hors de Netlify (gestionnaire de mots de passe) :");
  console.log("la perdre obligerait à changer de paire, et donc à renvoyer une clé à chaque client.");
}

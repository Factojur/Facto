import { notFound } from "next/navigation";
import { DevAreasRedeClient } from "./client";

/** Preview local do grafo/híbrido — 404 em produção. */
export default function DevAreasRedePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <DevAreasRedeClient />;
}

"use client";

import React from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-2">Ocorreu um erro no servidor</h1>
        <p className="mb-4 text-sm text-gray-600">Desculpe — algo deu errado ao processar sua requisição.</p>
        {process.env.NODE_ENV !== "production" ? (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto mb-4">{String(error?.message)}</pre>
        ) : null}
        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Tentar novamente
          </button>
          <Link href="/login" className="px-4 py-2 border rounded text-sm">
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}

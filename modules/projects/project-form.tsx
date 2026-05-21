"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function ProjectForm() {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Novo projeto</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={(fd) =>
            startTransition(async () => {
              const res = await fetch("/api/projects", {
                method: "POST",
                body: fd,
              });
              const data = await res.json();
              if (data.success) toast.success("Projeto criado!");
              else toast.error(data.error);
            })
          }
          className="grid gap-4 md:grid-cols-3"
        >
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" name="name" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="clientName">Cliente</Label>
            <Input id="clientName" name="clientName" className="mt-1" />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Criando..." : "Criar projeto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

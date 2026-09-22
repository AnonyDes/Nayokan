"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Page } from "@/admin/ui/Page";
import { Notice } from "@/admin/ui/Notice";
import { createArticle } from "@/admin/content/articles/actions";

/** /admin/content/articles/new — creates a draft on the corporate site
 *  (insights live there) and routes straight into the editor. */
export default function NewArticlePage() {
  const router = useRouter();
  useEffect(() => {
    void createArticle({ site: "corporate" }).then((res) => {
      router.replace(res.ok && res.id ? `/admin/content/articles/${res.id}` : "/admin/content/articles");
    });
  }, [router]);
  return (
    <Page width="narrow">
      <Notice tone="info">Creating a draft article…</Notice>
    </Page>
  );
}

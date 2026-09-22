"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Page } from "@/admin/ui/Page";
import { Notice } from "@/admin/ui/Notice";
import { createStory } from "@/admin/content/articles/actions";

/** /admin/content/stories/new — creates a draft story (VTI owns most impact
 *  stories; the editor's world selector refines it) and routes to the editor. */
export default function NewStoryPage() {
  const router = useRouter();
  useEffect(() => {
    void createStory({ site: "vti" }).then((res) => {
      router.replace(res.ok && res.id ? `/admin/content/stories/${res.id}` : "/admin/content/stories");
    });
  }, [router]);
  return (
    <Page width="narrow">
      <Notice tone="info">Creating a draft story…</Notice>
    </Page>
  );
}

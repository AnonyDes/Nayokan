"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/admin/ui/Button";
import type { SiteId } from "@/platform/content/types";
import { createArticle, createStory } from "./actions";

const plusIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/** Creates a draft via the server action and routes straight into the editor. */
export function NewArticleButton({ site }: { site: SiteId }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      icon={plusIcon}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await createArticle({ site });
          if (res.ok && res.id) router.push(`/admin/content/articles/${res.id}`);
        })
      }
    >
      Create article
    </Button>
  );
}

export function NewStoryButton({ site }: { site: SiteId }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      icon={plusIcon}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await createStory({ site });
          if (res.ok && res.id) router.push(`/admin/content/stories/${res.id}`);
        })
      }
    >
      Add story
    </Button>
  );
}

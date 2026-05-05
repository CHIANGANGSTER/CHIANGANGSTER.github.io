# Adding a Knowledge Base Entry

1. Pick a stable slug, for example `mj-product-shoot-prompt`.
2. Add one object to `/assets/data/kb.json`.
3. Include all required fields: `id`, `title`, `domain`, `type`, `tags`, `status`, `owner`, `updated`, `summary`, and `url`.
4. If the entry is only planned, set `status` to `planned` and `url` to `#`.
5. If the entry is published, create `/{domain}/{id}.html` using `/docs/templates/article-template.html`.
6. If you add a new tag string, also add it to `/assets/data/tags.json`.
7. Preview locally and check the browser console for `[validate-kb]` messages.

Valid domains: `workflows`, `prompts`, `research`, `marketing`, `resources`.

Valid statuses: `published`, `testing`, `planned`, `archived`.

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Route all browser report printing through the shared Chrome preview utility; this keeps page settings and A4 containment consistent.
- Route PDF downloads through src/lib/reportPdf.ts with measured row pagination and isolated document styles; this preserves Arabic, report colors, and paper dimensions across tabs.

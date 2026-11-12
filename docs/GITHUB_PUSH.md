# GitHub preparation

Prepared on 2026-11-12. No commit, push, remote change or history rewrite was performed.

## What belongs in Git

Keep `src/`, `tests/`, `scripts/`, `docs/`, `public/`, project/agent instructions, package configuration and `pnpm-lock.yaml`. In particular, keep all prepared GLBs, textures, audio, video, Ammo and credits in `public/`: the game needs them after a fresh clone. The catalogue and preparation manifest are reproducibility and attribution records, not disposable build output. Project `.agents/skills/` and `.claude/skills/` are tracked contributor guidance and remain versioned.

Keep raw originals, source packs, offline tools and archives outside Git under ignored `asset-library/`, `New FIles/`, `Sign-login/` and the reserved `items/`/`downloads/` directories. Also ignored: dependencies, builds (`dist`, `dist-*`), verification captures/builds (`verification.local/`), caches, logs, temporary directories and `.env` files. Back up raw assets separately before moving machines. A fresh clone can build and test, but cannot regenerate optimized models without those originals and offline tools.

The formatting ignore file now excludes preserved raw assets and generated evidence as well, so formatting does not traverse the offline tool installations. The pnpm-generated lockfile is excluded from Prettier to preserve its native formatting; its content remains unchanged.

## Size and history review

The initial eligible-tree audit found approximately **89.6 MB / 85.5 MiB** across 383 files before the final documentation edits. Largest current file: `public/assets/models/pickup.glb`, **8,768,292 bytes / 8.36 MiB**; next is `skullPlanes.glb`, **6,265,092 bytes / 5.97 MiB**. Both are required runtime assets and remain versioned. Ignoring every GLB or every file over 5 MB would break the game.

The reachable-history audit found no file above GitHub's 50 MiB warning threshold or 100 MiB hard limit. Largest reachable historical blob: `asset-library/environments/comfy_cafe_4k.exr`, **18,681,569 bytes / 17.82 MiB**. Some previously committed source assets remain in history even though they are now ignored. `.git` itself contains about 760 MiB of loose local objects; that folder is not a working-tree upload and its size does not mean a 760 MiB current checkout is being committed. History was not rewritten.

GitHub's current limits are documented at [About large files on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github). Git LFS is not required for the currently eligible individual files. GitHub account, remote permissions, remote branch protection and the actual network push were not tested.

`git ls-files -ci --exclude-standard` returned no currently tracked ignored files. `git check-ignore -v` confirmed representative raw model, archive, environment, dependency, temporary-build and screenshot paths are excluded. `.npmrc` has no authentication settings. This is repository hygiene review, not a formal secret-security audit.

## Review and push

Use Node >=22.23.2 (verification used portable 22.23.4) and pnpm. Run the documented checks in TASKS before staging. Review all incoming LW-A004 work as well as the later neighborhood changes: this session deliberately preserved that existing worktree.

```powershell
git status --short
git add .
git diff --cached --stat
git diff --cached --check
git commit -m "feat: enrich neighborhood and Halloween entrance"
git push
```

Run the last command only after confirming the intended GitHub remote and branch. For a first push, use your normal `git push -u origin main` after configuring the repository remote. Never add tokens to source/config or publish the ignored raw source library as a substitute for the prepared runtime folder.

Commercial deployment remains separate from GitHub source hosting. Build with `VITE_ASSET_POLICY=commercial` to substitute and exclude the five NC models; retain source attribution and licence records. The house/shop set's recorded licences are CC BY 4.0, as detailed in ASSET_LICENSES.

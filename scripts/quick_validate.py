#!/usr/bin/env python3
"""Release gate for element-motion-video.
Usage: python3 scripts/quick_validate.py <skill_dir> [--zip path.zip]
Checks structure, frontmatter, versions, openai.yaml, UTF-8, temp files, absolute paths,
seek-safety (static scan), semantic landing of v0.1.0 capabilities, and ZIP layout."""
import re, sys, json, zipfile, pathlib

VERSION = "v0.1.0"
NAME = "element-motion-video"
errors, notes = [], []

def need(cond, msg):
    if not cond:
        errors.append(msg)

def main():
    args = sys.argv[1:]
    root = pathlib.Path(args[0] if args and not args[0].startswith("--") else ".").resolve()
    zpath = args[args.index("--zip") + 1] if "--zip" in args else None

    required = ["SKILL.md", "README.md", "VERSION.md", "CHANGELOG.md", "RELEASE_REPORT.md", "agents/openai.yaml",
        "references/semantic-routing.md", "references/motion-principles.md", "references/layout-and-captions.md",
        "references/integration.md", "references/quality-checklist.md", "references/failure-modes.md",
        "references/research-notes.md", "styles/handnote.md", "styles/editorial.md", "styles/tech.md",
        "templates/motion-plan.template.json", "templates/motion-plan-review.md", "templates/project.config.example.json",
        "components/index.ts", "components/core/timing.ts", "components/core/number.ts", "components/core/clock.ts",
        "components/WordReveal.tsx", "components/CountUp.tsx", "components/RollingNumber.tsx", "components/ClockRoll.tsx",
        "components/ProgressBar.tsx", "components/DrawArrow.tsx", "components/FlowSteps.tsx", "components/Checklist.tsx",
        "components/Move.tsx", "components/Captions.tsx", "components/theme.ts", "components/RoughDefs.tsx", "components/Probe.tsx",
        "examples/sample-12s/index.ts", "examples/sample-12s/Root.tsx", "examples/sample-12s/Sample.tsx",
        "examples/sample-12s/ClockTest.tsx", "examples/sample-12s/motion-plan.json", "examples/sample-12s/project.config.json",
        "scripts/motion_logic_test.ts", "scripts/render_check.mjs", "scripts/render_sample.mjs", "scripts/webpack-override.mjs"]
    for r in required:
        need((root / r).is_file(), f"missing file: {r}")

    skill = (root / "SKILL.md").read_text(encoding="utf-8") if (root / "SKILL.md").exists() else ""
    m = re.match(r"^---\nname: (.+)\ndescription: (.+?)\n---\n", skill, re.S)
    need(bool(m), "SKILL.md frontmatter missing name/description")
    if m:
        need(m.group(1).strip() == NAME, "frontmatter name != element-motion-video")
        need(root.name == NAME, f"folder name {root.name} != {NAME}")
    for f in ["SKILL.md", "VERSION.md", "CHANGELOG.md", "RELEASE_REPORT.md"]:
        p = root / f
        need(p.exists() and VERSION in p.read_text(encoding="utf-8"), f"{f} does not mention {VERSION}")

    y = (root / "agents/openai.yaml").read_text(encoding="utf-8") if (root / "agents/openai.yaml").exists() else ""
    for k in ["interface:", "display_name:", "short_description:", "default_prompt:", "policy:", "allow_implicit_invocation:"]:
        need(k in y, f"openai.yaml missing {k}")
    need(f"${NAME}" in y, "default_prompt must contain $element-motion-video")

    # semantic landing of v0.1.0 capabilities
    sem = {
        "SKILL.md": ["先决定这段要解释什么", "字幕与主画面分离", "seek-safe", "00:59 → 01:00", "Style Lock", "冻结模块", "render_check"],
        "references/semantic-routing.md": ["explain", "device", "ClockRoll", "Move"],
        "references/integration.md": ["logo", "voice", "冻结"],
        "templates/motion-plan.template.json": ["explain", "device", "then", "checks"],
        "components/core/clock.ts": ["00:59 -> 01:00"],
        "components/core/number.ts": ["EXACTLY"],
        "scripts/render_check.mjs": ["seek", "safe", "overflow"],
    }
    for f, keys in sem.items():
        p = root / f
        t = p.read_text(encoding="utf-8") if p.exists() else ""
        for k in keys:
            need(k in t, f"semantic: {f} lacks '{k}'")
    for st in ["handnote", "editorial", "tech"]:
        p = root / f"styles/{st}.md"
        need(p.exists() and "## Style Lock" in p.read_text(encoding="utf-8"), f"styles/{st}.md lacks Style Lock")

    # seek-safety static scan + no hard-coded brand/voice
    banned = [(r"\btransition\s*:", "CSS transition"), (r"@keyframes", "@keyframes"), (r"Math\.random", "Math.random"),
              (r"Date\.now", "Date.now"), (r"setTimeout|setInterval", "timers")]
    for p in list((root / "components").rglob("*.ts*")) + list((root / "examples").rglob("*.tsx")):
        t = p.read_text(encoding="utf-8")
        for pat, label in banned:
            need(not re.search(pat, t), f"seek-unsafe {label} in {p.relative_to(root)}")
    cfg = json.loads((root / "examples/sample-12s/project.config.json").read_text(encoding="utf-8"))
    need(cfg.get("voice") in (None, "") and cfg.get("logo") in (None, ""), "sample config must not ship voice/logo")
    for p in root.rglob("*"):
        if p.suffix.lower() in {".mp3", ".wav", ".m4a", ".flac"}:
            errors.append(f"audio file shipped (no private voices allowed): {p.relative_to(root)}")

    # plan sanity
    plan = json.loads((root / "examples/sample-12s/motion-plan.json").read_text(encoding="utf-8"))
    for b in plan["beats"]:
        need(b.get("explain") and b.get("device"), f"beat {b.get('id')} lacks explain/device")
    need(all(0 <= c["frame"] < plan["durationInFrames"] for c in plan["checks"]), "check frame outside duration")

    # hygiene
    for p in root.rglob("*"):
        rel = str(p.relative_to(root))
        if any(x in rel for x in [".DS_Store", "__MACOSX", ".git/", "node_modules", "__pycache__", ".tmp"]) or rel.endswith("~"):
            errors.append(f"temp/cache file: {rel}")
        if p.is_file() and p.suffix in {".md", ".ts", ".tsx", ".mjs", ".py", ".json", ".yaml"}:
            try:
                t = p.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                errors.append(f"not UTF-8: {rel}"); continue
            if p.name != "quick_validate.py" and re.search(r"(/vercel/|/data/|/Users/|[A-Z]:\\\\)", t):
                errors.append(f"absolute path in {rel}")

    if zpath:
        with zipfile.ZipFile(zpath) as z:
            tops = {n.split("/")[0] for n in z.namelist()}
            need(tops == {NAME}, f"zip must have single root {NAME}, got {tops}")
            need(f"{NAME}/SKILL.md" in z.namelist(), "zip lacks SKILL.md")

    n = sum(1 for p in root.rglob("*") if p.is_file())
    print(f"quick_validate {VERSION}: {len(errors)} blocking, {len(notes)} notes, {n} files")
    for e in errors:
        print("BLOCK " + e)
    sys.exit(1 if errors else 0)

if __name__ == "__main__":
    main()

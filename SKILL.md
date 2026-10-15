---
name: element-motion-video
description: >-
  Use this skill when a script, voiceover, or caption file must become an explainer video where elements move WITH the narration instead of slides flipping — word-group text reveals, keyword highlights, counters, odometer digits, clocks and countdowns, progress bars, arrows, flows, checklists, and items moving between layout slots (e.g. email items becoming todos). Triggers: 元素级图文动画, 图文动画, 数字滚动, 计数动画, 时钟翻动, 倒计时, 流程动画, 清单勾选, 信息图解动画, kinetic explainer, element motion. It plugs into an existing Remotion video pipeline as a component layer; it does not rebuild the pipeline.
---

# 元素级图文动画 element-motion-video · v0.1.0

把文案 / 配音变成「内容正在被讲解」的连续画面：元素跟着话出现、变化、移动、落位，而不是一句话换一张图。

## 什么时候用

- 已有文案或配音，要做讲解型短视频（默认 9:16，1080×1920，30fps）。
- 内容里有：关键词、数字、比例、时间、步骤、因果、清单、"从 A 变成 B" 的搬移。
- 现有视频流程（如 xingchen-kinetic-film）需要一层「元素级动画」能力时，作为组件层接入。

不适合：纯情绪大片、实拍剪辑、需要逐帧手绘的角色动画。

## 铁律（先读）

1. **先决定这段要解释什么，再选动画。** 每个节拍（beat）先写 `explain`（这段让观众明白什么），再从 `references/semantic-routing.md` 选一种 `device`。没有解释目的的元素不上屏。
2. **不是所有文字都弹，也不是所有数字都滚。** 一个节拍只有一个主动画；其余元素静止或让位。
3. **字幕与主画面分离。** 完整字幕走独立字幕带（`Captions`）；主画面只留关键词、数字、关系图解，不重复整句。
4. **主画面稳定，元素承接。** 旧元素缩成角标（chip）、移到锚点或让位，不硬切；`Move` 负责在版位之间搬运。
5. **数字必须准确落地。** 计数在终点帧精确等于目标值；进度条与百分比共用同一个进度值。
6. **时间不是普通数字。** 用 `ClockRoll`：混合进制进位，`00:59 → 01:00`，倒计时 `01:00 → 00:59`，绝不出现 `:60`。
7. **任意一帧可单独渲染（seek-safe）。** 所有动画只由 `useCurrentFrame()` 推导；禁止 CSS transition / @keyframes / Math.random / Date.now。
8. **风格是数据，不写死。** 手写笔记 / 编辑风 / 科技风由项目配置选 `styles/*.md` 中的一个 Style Lock；Logo、片尾、声线来自当前项目配置，技能包里不放任何私人声线或品牌。
9. **不改冻结模块。** 只新增组件与合成，不修改上游流程里已冻结的文件（见 `references/integration.md`）。
10. **用真实渲染验收。** 说明文档不能代替成品；交付前跑三道门禁（见下）。

## 工作流（6 步）

1. **读稿定拍**：按配音/字幕时间戳把稿子切成节拍（通常 2–4 秒一拍）。无配音时按每秒约 4–5 个汉字估时长。
2. **写动画方案** `motion-plan.json`（模板：`templates/motion-plan.template.json`）：每拍写 `explain` → `device` → `then`（下一拍如何承接），加 `captions` 和 `checks`（需要验收的帧与期望值）。
3. **选风格**：从项目配置读 `style`；没有就按内容推荐一个，并说明理由（`styles/`）。
4. **搭画面**：用 `components/` 组件拼合成；版位遵守 `references/layout-and-captions.md`（安全区、字幕带、字号下限）。
5. **跑门禁**：
   - `npx tsx scripts/motion_logic_test.ts` —— 计数终值、里程表进位、时钟进位/借位、搬运落位、乱序求值一致。
   - `node scripts/render_check.mjs --entry <entry> --plan <motion-plan.json>` —— 在真实渲染帧上核对 `checks` 的值；随机抽帧正序/倒序各渲一次比对像素哈希；检查元素越界、横向溢出、主画面侵入字幕带；倒计时回归。
   - 抽帧看片：关键帧拼成联系表，人工确认构图与承接。
6. **渲染交付**：`node scripts/render_sample.mjs --entry <entry> --out <mp4>`；交付 MP4 + 联系表 + 门禁报告。

## 组件（components/）

| 组件 | 用途 |
| --- | --- |
| `WordReveal` | 词组入场（pop / slide / fade），关键词在说完后划出荧光底 |
| `CountUp` | 计数增长，ease-out 减速落地，终帧精确，可带小数/后缀/千分位/万亿 |
| `RollingNumber` | 里程表逐位滚动，高位只在进位时翻转，等宽不跳版 |
| `ClockRoll` | 时钟 / 倒计时，只滚动发生变化的位，混合进制进位 |
| `ProgressBar` | 进度条 + 百分比同源同步 |
| `DrawArrow` | 箭头沿路径绘制，到达后出箭头 |
| `FlowSteps` | 流程节点依次点亮，连接线绘制 |
| `Checklist` | 清单逐条出现，勾选在被说到时绘制 |
| `Move` / `pose` | 版位间搬运（让位、缩成角标、邮件事项飞入待办） |
| `Captions` | 独立字幕带 |
| `ThemeContext` / `THEMES` | 风格数据；`RoughDefs` 提供确定性手绘抖动 |
| `Probe` | 仅测试：把元素的显示值与包围盒打到日志，供门禁读取 |

## 需要时读取

- `references/semantic-routing.md` —— 内容类型 → 动画手法 决策表（必读）
- `references/motion-principles.md` —— 时长、缓动、错峰、承接
- `references/layout-and-captions.md` —— 安全区、字号、字幕分离
- `references/integration.md` —— 接入现有流程、项目配置、冻结模块边界
- `references/quality-checklist.md` / `references/failure-modes.md` —— 验收与常见失败
- `references/research-notes.md` —— 调研来源与吸收点
- `styles/handnote.md` · `styles/editorial.md` · `styles/tech.md` —— Style Lock
- `examples/sample-12s/` —— 可运行小样（12.5 秒：文字 → 数字 → 时间 → 流程）

## 输出

- `motion-plan.json`（动画方案）
- 渲染好的 MP4（无配音时可静音或用项目铺底）
- 联系表 PNG（关键帧）
- `render_check_report.json`（门禁报告）

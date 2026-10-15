# CHANGELOG

## v0.1.0 · 2026-10-15

首个版本。

### 新增
- 语义先行工作流：每拍先写 explain，再选 device，再写 then（承接）。
- 10 个可复用 Remotion 组件：WordReveal、CountUp、RollingNumber、ClockRoll、ProgressBar、DrawArrow、FlowSteps、Checklist、Move、Captions；外加 Theme、RoughDefs、Probe。
- 纯逻辑核心：counter 精确落地、odometer 进位、clock 混合进制进位/借位（components/core/）。
- 3 个 Style Lock：handnote / editorial / tech；风格、Logo、片尾、声线全部由项目配置决定。
- 可运行小样 examples/sample-12s（12.5s，文字 → 数字 → 时间 → 流程，含连续构图与独立字幕）。
- 三道门禁：quick_validate.py（结构 + 语义 + seek-safe 静态扫描）、motion_logic_test.ts（纯逻辑）、render_check.mjs（真实渲染帧取值 + 随机跳帧一致性 + 越界/溢出）。

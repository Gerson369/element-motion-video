# RELEASE_REPORT · element-motion-video v0.1.0

- Version: v0.1.0（2026-10-15，首个版本）
- Root: `element-motion-video/`（ZIP 单根目录）

## 本版新增能力清单
1. 语义先行工作流（explain → device → then），落在 SKILL.md、references/semantic-routing.md、templates/motion-plan.template.json。
2. 10 个动画组件 + 纯逻辑核心（components/、components/core/）。
3. 时间混合进制进位/借位（ClockRoll、core/clock.ts），计数精确落地（core/number.ts）。
4. 字幕独立层与安全区规则（Captions、references/layout-and-captions.md）。
5. 3 个 Style Lock（styles/），风格 / Logo / 片尾 / 声线由项目配置决定。
6. 可运行小样 examples/sample-12s（12.5s：文字 → 数字 → 时间 → 流程）+ 回归合成 EMV-ClockTest。
7. 三道门禁：quick_validate.py、motion_logic_test.ts、render_check.mjs。

## Validation results
| 门禁 | 结果 |
| --- | --- |
| quick_validate.py（打包前 / 解压反查后） | 0 blocking |
| motion_logic_test.ts | 1470 passed, 0 failed |
| render_check.mjs（seed 20261015，8 个随机帧） | 8/8 取值正确，8/8 跳帧像素一致，88 个元素框 0 越界 0 溢出 |

取值检查：128封（f179）、76%（f179）、00:59（f236）、01:00（f238）、3/3（f374）；倒计时 01:02→00:58 经过 01:00→00:59，12.5% 精确落地，hh:mm 09:58→10:01。

## Known notes
- 需要本地 `remotion` v4、`@remotion/paths`、`@remotion/bundler`、`@remotion/renderer`；中文字体默认 Noto 系列。
- hh:mm 时钟按秒推进，分钟进位的滚动很短；需要明显翻页时把时长拉长或改用 mm:ss。
- 小样数据为演示假设，画面与字幕已标"示例 / 假设"。

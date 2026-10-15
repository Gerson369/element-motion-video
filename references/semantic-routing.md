# 语义路由：内容要解释什么 → 用什么动画

先写 `explain`（这一拍让观众明白什么），再查表选 `device`。一拍一个主动画。

| 内容在说什么 | 解释目标 | device | 组件 | 不要这样做 |
| --- | --- | --- | --- | --- |
| 一个处境 / 观点 | 让人抓住关键词 | text.word-reveal + marker | WordReveal（hl 只给 1–2 个词） | 整句每个字都弹；所有词都高亮 |
| 一个量有多大 | 感知数量级 | number.rolling 或 number.count | RollingNumber（整数、3–6 位）/ CountUp（小数、千分位、万/亿） | 小数用里程表；终值靠"差不多"停住 |
| 一个比例 / 完成度 | 部分与整体 | number.progress | ProgressBar（与百分比同源） | 条和数字各算各的 |
| 一段时间 / 时刻 | 时间流逝、截止 | time.clock-roll / time.countdown | ClockRoll | 把 00:59 当 59 → 60 滚动 |
| 先后步骤 | 顺序与推进 | diagram.flow | FlowSteps（≤4 步一屏） | 一次全亮 |
| A 导致 B / 去向 | 关系与方向 | diagram.arrow | DrawArrow | 箭头先出现再画线 |
| 事项被处理掉 | 进度感、完成感 | diagram.checklist | Checklist（勾选对准"做完"那句话） | 列表出现即全部勾上 |
| 东西从 A 变成 B | 转化、归档、整理 | layout.transfer | Move + 目标组件交接 | 原处消失、目标处凭空出现 |
| 新信息要进场 | 保留上下文 | layout.give-way / chip | Move（旧元素缩成角标或上移） | 整屏硬切 |
| 情绪 / 转折句 | 停顿 | none（只走字幕） | Captions | 为了"有动效"硬加动画 |

## 判断顺序
1. 这句话里有没有**数字 / 时间 / 关系 / 转化**？有 → 用对应 device；没有 → 只取关键词或只走字幕。
2. 这一拍的主元素是谁？其余元素必须静止、缩小或让位。
3. 下一拍怎么承接（`then`）：缩成角标 / 上移让位 / 搬运到新版位 / 退场。
4. 主画面上的文字 ≤ 12 个字；完整句子交给字幕。

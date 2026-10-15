# 调研吸收（2026-10-15）

| 来源 | 吸收点 | 落到哪里 |
| --- | --- | --- |
| Remotion 文档 · Animating properties | 动画必须由 useCurrentFrame 驱动；CSS 动画在渲染时会闪 | 铁律 7、quick_validate 静态扫描 |
| Remotion 官方 skills · timing.md | interpolate + 明确帧区间 + clamp；入场 ease-out、退场 ease-in；时序与映射分离 | core/timing.ts、motion-principles.md |
| Remotion 官方 skills · video-layout.md | 每个场景先定观众第一眼看什么；1080 宽安全边距 80/100px；字号下限 84/44/32；拥挤用时间解决 | layout-and-captions.md、render_check 安全区 |
| Remotion Elements · Number Counter | ease-out(exp) 计数 + tabular-nums | CountUp |
| RemotionUI · Counter | 里程表：最低位连续转、高位进位才翻；落地 settle；预留宽度 | RollingNumber、core/number.ts |
| @remotion/paths · evolvePath | 路径绘制用 strokeDasharray/offset | DrawArrow、Checklist 勾 |
| @remotion/captions · createTikTokStyleCaptions | 逐词时间戳分页；字幕独立组件 | Captions、integration.md |
| 社区 TIPS（remotion-video） | clamp 每个 interpolate；单帧 still 先验；@remotion/noise 固定种子 | render_check、RoughDefs |
| Motion Canvas · tweening | 布局属性补间 → 元素在版位间移动 | Move（magic move） |

后续可吸收（未进 v0.1.0）：@remotion/transitions 镜头转场、@remotion/noise 有机抖动、逐词卡拉 OK 高亮、Lottie 图标。

# 接入现有流程

## 定位
本技能是**组件层**：提供动画组件、方案模板和门禁脚本。不负责选题、写稿、配音、剪辑和发布，也不替换上游视频流程。

## 冻结模块边界
- 只新增：`components/`、你自己的合成目录（复制 `examples/sample-12s/`）、`motion-plan.json`。
- 不修改上游项目里已冻结的文件（渲染脚本、声音层、定位档案、片头片尾模块等）。
- 需要上游改动时，先列出改动点交给用户确认，不在本技能内顺手改。

## 项目配置（project.config.json）
```json
{"style": "handnote | editorial | tech", "width": 1080, "height": 1920, "fps": 30,
 "logo": null, "outro": null, "voice": null, "captions": true}
```
- `logo` / `outro` / `voice` 由当前项目提供；为 null 时不渲染、不猜测。
- 技能包内不得放任何私人声线文件、声线 ID 或品牌素材。

## 与 xingchen-kinetic-film 配合
- kinetic-film 负责导演方案、声音层与交付；当某个镜头需要"元素级讲解"时，在该镜头内引用本技能的组件。
- 时间戳来源相同：字幕 cue 的 from/to 用帧号，按 fps 从配音时间戳换算（ms × fps / 1000，四舍五入）。

## 字幕时间戳
- 有逐词时间戳（Whisper / TTS）：先合并成句，再写入 `captions`；需要逐词高亮时可用 `@remotion/captions` 的 createTikTokStyleCaptions 分页。
- 无配音：按每秒 4–5 个汉字估时长，渲染后再对口型微调。

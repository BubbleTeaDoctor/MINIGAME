arena_studio v0.8.7 patch from v0.8.6

本次更新：
1. 编辑器保存逻辑修正
   - 默认规则不允许直接修改
   - 第一次编辑或保存时，会先自动复制默认规则，再在副本上编辑
   - “保存当前条目”和“保存整个规则副本”都会把当前编辑内容真正写入副本

2. 编辑器补更多下拉选项
   - consumeOn
   - tickTiming
   - rounding
   - controlType
   - stackRule
   - triggerCondition
   - timing
   - checkAt
   - rewardType
   - thresholdType
   - attackType
   - onDrawEffect
   - bonusType
   - target

3. 游戏模式增加返回主菜单按钮
   - 游戏内工具栏可直接回 index.html

建议测试：
- 打开 editor.html
- 选择默认规则，直接修改任意卡牌字段
- 应自动复制出副本，而不是改默认规则
- 点击“保存当前条目”或“保存整个规则副本”后，重新切换 ruleset 验证是否已保存
- 进入 game.html 后，确认工具栏能返回主页

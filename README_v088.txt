arena studio v0.8.8 编辑器补丁说明

这版继续基于 v087 稳定线，只修编辑器问题：

1. 明确规则副本存储位置
- 当前浏览器 LocalStorage
- rulesets key: arena_studio_rulesets_v080
- active key: arena_studio_active_ruleset_v080

2. 默认规则不能直接编辑
- 一旦开始编辑，系统会自动复制默认规则
- 修改只会写入可编辑副本

3. 规则副本现在可以删除
- 仅可删除 editable=true 的副本
- 默认规则不能删除

4. 新建条目现在真正生效
- 可以直接用“条目 Key / Entry Key”输入框指定 key
- 新建后会立即写入当前副本并刷新下拉列表

5. 条目现在可以重命名
- 修改“条目 Key / Entry Key”
- 点击“重命名条目 / Rename Entry”

6. 规则副本名称可直接保存
- 修改“规则副本名称 / Ruleset Name”
- 点击保存整个规则副本

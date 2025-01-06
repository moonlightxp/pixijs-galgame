# UI系统重构规则

## 重构目标
将所有UI元素包装在Container中，实现显示和布局的职责分离。

## 开发顺序
1. 创建container并设置尺寸（从style.js 的 DEFAULT_STYLES 获取）
2. 创建UI元素并设置其专属属性
3. 将UI元素添加到container并定位
4. 设置container的适配相关属性

## 属性分配
1. Container负责的属性：
   - width/height：容器尺寸，从style获取
   - posAdapt：位置适配类型
   - sizeAdapt：尺寸适配类型
   - pivot：轴心点
   - offset：位置偏移

2. UI元素负责的属性：
   - 颜色类：background, textColor, alpha
   - 样式类：textSize, lineAlign, radius

## 各UI类型实现规则
1. Rect类型：
   - rect尺寸 = container尺寸
   - 位置固定在(0,0)
   - 填充整个container区域

2. Text类型：
   - text保持自身尺寸不变
   - 在container中心对齐
   - 文本样式由style指定

3. Sprite类型：
   - sprite保持原始尺寸
   - 在container中心对齐
   - 可以设置sprite的颜色和透明度

4. Button类型：
   - 背景rect填充整个container
   - 文本在container中心对齐
   - 背景和文本样式分别设置

## 适配规则
1. 适配操作：
   - 只对container进行适配
   - UI元素位置保持相对container固定
   - updateUI函数只处理container

2. 位置计算：
   - container根据posAdapt确定位置
   - UI元素位置相对container计算

## 强制遵守事项
1. 不改变现有style结构
2. 保持原有适配效果
3. 确保功能正确性优先
4. 注意test.js是用于测试各种createUI函数的
5. 使用pixiJS v8+ API

## 待处理功能
以下功能暂不处理，后续完善：
1. 事件处理机制
2. 动画效果实现
3. 性能优化
4. 特殊情况处理 
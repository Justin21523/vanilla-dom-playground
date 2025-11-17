# 成就系統整合指南

## 快速開始

### 方法 1：自動初始化（推薦）

在任何學習模塊頁面的 `<script>` 標籤前添加：

```html
<!-- 成就系統自動初始化 -->
<script type="module" src="./js/learning/gamification/autoInit.js"></script>
```

這將自動：
- 初始化成就系統
- 追蹤頁面訪問
- 記錄會話開始
- 暴露全局 API：`window.achievementAPI`

### 方法 2：手動整合

```javascript
import { integrationHelper } from './js/learning/gamification/integrationHelper.js';

// 初始化
integrationHelper.init();

// 追蹤訪問
integrationHelper.trackVisit('whack-a-mole');

// 追蹤完成
integrationHelper.trackComplete('whack-a-mole', 'games', {
  score: 150,
  time: 25
});

// 追蹤分數
integrationHelper.trackScore('whack-a-mole', 150);
```

## API 參考

### 全局 API（使用 autoInit.js 後可用）

```javascript
// 記錄模塊完成
window.achievementAPI.complete(moduleId, { score, time });

// 記錄分數達成
window.achievementAPI.score(moduleId, score);

// 獲取統計數據
const stats = window.achievementAPI.getStats();

// 獲取模塊進度
const progress = window.achievementAPI.getProgress(moduleId);
```

### Integration Helper API

```javascript
import { integrationHelper } from './gamification/integrationHelper.js';

// 初始化
integrationHelper.init();

// 追蹤訪問
integrationHelper.trackVisit(moduleId);

// 追蹤完成
integrationHelper.trackComplete(moduleId, category, { score, time });

// 追蹤分數
integrationHelper.trackScore(moduleId, score);

// 追蹤會話開始
integrationHelper.trackSessionStart();

// 獲取統計
integrationHelper.getUserStats();

// 獲取模塊進度
integrationHelper.getModuleProgress(moduleId);
```

## 模塊 ID 映射

### 遊戲模塊
- `whack-a-mole` - 打地鼠
- `drag-puzzle` - 拖放拼圖
- `snake-game` - 貪吃蛇
- `form-master` - 表單驗證大師
- `music-keys` - 音樂按鍵

### 教程模塊
- `event-propagation` - 事件傳播可視化器
- `event-inspector` - 事件對象解析器
- `event-delegation` - 事件委託演示器
- `custom-events` - 自定義事件工作坊

### 項目模塊
- `todo-list` - TODO List Pro
- `image-carousel` - 圖片輪播器
- `dropdown-menu` - 下拉菜單系統

## 整合示例

### 遊戲模塊整合

```html
<!DOCTYPE html>
<html>
<head>
  <title>打地鼠遊戲</title>
</head>
<body>
  <div id="game-container"></div>

  <!-- 1. 載入成就系統 -->
  <script type="module" src="./js/learning/gamification/autoInit.js"></script>

  <!-- 2. 載入遊戲模塊 -->
  <script type="module">
    import { WhackAMole } from './js/learning/games/whackAMole.js';

    const game = new WhackAMole(document.getElementById('game-container'));

    // 3. 在遊戲結束時追蹤
    // 方式 A：監聽自定義事件（如果遊戲支持）
    game.on('gameOver', (data) => {
      window.achievementAPI.complete('whack-a-mole', {
        score: data.score,
        time: data.time
      });
    });

    // 方式 B：輪詢檢查（臨時方案）
    let lastScore = 0;
    setInterval(() => {
      if (!game.isPlaying && game.score > 0 && game.score !== lastScore) {
        lastScore = game.score;
        window.achievementAPI.complete('whack-a-mole', {
          score: game.score
        });
      }
    }, 1000);
  </script>
</body>
</html>
```

### 教程模塊整合

```html
<script type="module" src="./js/learning/gamification/autoInit.js"></script>

<script type="module">
  import { EventPropagation } from './js/learning/tutorials/eventPropagation.js';

  const tutorial = new EventPropagation(container);

  // 追蹤完成（當用戶完成所有步驟時）
  tutorial.on('allStepsComplete', () => {
    window.achievementAPI.complete('event-propagation', 'tutorials');
  });
</script>
```

### 項目模塊整合

```html
<script type="module" src="./js/learning/gamification/autoInit.js"></script>

<script type="module">
  import { TodoList } from './js/learning/projects/todoList.js';

  const project = new TodoList(container);

  // 追蹤完成（當用戶創建第一個 TODO 時）
  project.on('firstTodoCreated', () => {
    window.achievementAPI.complete('todo-list', 'projects');
  });
</script>
```

## 成就觸發條件

### 遊戲類成就

| 成就 | 條件 | 追蹤方式 |
|------|------|---------|
| 首次遊戲 | 完成任意遊戲 | `complete(moduleId, 'games')` |
| 打地鼠新手 | 得分 ≥100 | `score('whack-a-mole', 100)` |
| 打地鼠大師 | 得分 ≥200 | `score('whack-a-mole', 200)` |
| 拼圖入門 | 完成拼圖 | `complete('drag-puzzle', 'games')` |
| 速度之王 | 30秒內完成 | `complete('drag-puzzle', 'games', {time: 30})` |
| 貪吃蛇學徒 | 得分 ≥50 | `score('snake-game', 50)` |
| 貪吃蛇高手 | 得分 ≥100 | `score('snake-game', 100)` |
| 表單專家 | 完成表單驗證 | `complete('form-master', 'games')` |
| 音樂新手 | 彈奏完整旋律 | `complete('music-keys', 'games')` |
| 遊戲達人 | 完成所有遊戲 | 自動檢測 |

### 教程類成就

| 成就 | 條件 | 追蹤方式 |
|------|------|---------|
| 事件學徒 | 完成任意教程 | `complete(moduleId, 'tutorials')` |
| 傳播專家 | 完成事件傳播 | `complete('event-propagation', 'tutorials')` |
| 偵探高手 | 完成事件解析器 | `complete('event-inspector', 'tutorials')` |
| 委託大師 | 完成事件委託 | `complete('event-delegation', 'tutorials')` |
| 自定義事件專家 | 完成自定義事件 | `complete('custom-events', 'tutorials')` |
| 教程通關 | 完成所有教程 | 自動檢測 |

### 項目類成就

| 成就 | 條件 | 追蹤方式 |
|------|------|---------|
| 項目啟動 | 完成任意項目 | `complete(moduleId, 'projects')` |
| TODO 大師 | 完成 TODO List | `complete('todo-list', 'projects')` |
| 輪播專家 | 完成圖片輪播 | `complete('image-carousel', 'projects')` |
| 菜單大師 | 完成下拉菜單 | `complete('dropdown-menu', 'projects')` |
| 項目全通 | 完成所有項目 | 自動檢測 |

### 綜合類成就

| 成就 | 條件 | 追蹤方式 |
|------|------|---------|
| 初學者 | 總點數 ≥50 | 自動檢測 |
| 進階學習者 | 總點數 ≥150 | 自動檢測 |
| 專家 | 總點數 ≥300 | 自動檢測 |
| DOM 大師 | 完成所有模塊 | 自動檢測 |
| 完美主義者 | 解鎖所有成就 | 自動檢測 |
| 探索者 | 訪問所有模塊 | 自動追蹤（autoInit） |

## 進階功能

### 顯示成就提示

```javascript
import { createAchievementHint } from './gamification/integrationHelper.js';

// 在容器中顯示可獲得的成就
createAchievementHint('#hint-container', 'whack-a-mole');
```

### 自定義成就彈窗

```javascript
import { AchievementPopup } from './gamification/achievementPopup.js';

const popup = new AchievementPopup({
  position: 'center',        // 位置
  autoHide: false,           // 不自動隱藏
  hideDelay: 10000,          // 10秒後隱藏
  sound: true                // 啟用音效
});

achievementSystem.on('achievement-unlocked', (achievement) => {
  popup.show(achievement);
});
```

### 顯示進度面板

```javascript
import { progressTracker } from './gamification/progress.js';

progressTracker.init();
progressTracker.renderProgressPanel('#progress-container');
```

### 顯示排行榜

```javascript
import { Leaderboard } from './gamification/leaderboard.js';

const leaderboard = new Leaderboard('#leaderboard-container', {
  maxEntries: 10,
  sortBy: 'points'
});
```

## 測試

### 手動測試成就解鎖

```javascript
// 在瀏覽器控制台執行
achievementAPI.complete('whack-a-mole', { score: 150 });
achievementAPI.score('whack-a-mole', 200);
achievementAPI.getStats();
```

### 查看當前進度

```javascript
const stats = achievementAPI.getStats();
console.log('總點數:', stats.totalPoints);
console.log('已解鎖成就:', stats.achievements.unlocked);
console.log('完成度:', stats.achievements.completionRate + '%');
```

### 重置進度（測試用）

訪問 `achievement-test.html` 頁面，點擊「重置所有進度」按鈕。

## 故障排除

### 成就沒有解鎖

1. 檢查 localStorage 是否可用
2. 查看瀏覽器控制台錯誤
3. 確認 moduleId 正確
4. 確認 category 正確（games/tutorials/projects）

### 彈窗沒有顯示

1. 檢查是否載入 `autoInit.js`
2. 確認頁面沒有 CSP 限制
3. 查看控制台是否有錯誤

### 進度沒有保存

1. 檢查 localStorage 配額
2. 確認沒有無痕模式
3. 嘗試清除瀏覽器緩存後重試

## 最佳實踐

1. **統一追蹤時機**：在模塊真正完成時追蹤，而不是開始時
2. **準確的數據**：傳遞準確的 score 和 time 數據
3. **避免重複追蹤**：使用標誌位防止多次追蹤同一次完成
4. **用戶體驗**：成就解鎖時機應該自然，不打斷用戶操作
5. **測試覆蓋**：測試所有成就觸發條件

## 示例頁面

- `achievement-test.html` - 完整的測試界面
- `game-test.html` - 打地鼠遊戲（已整合）
- 其他測試頁面 - 待整合

## 相關文檔

- [ACHIEVEMENTS.md](./ACHIEVEMENTS.md) - 成就系統設計文檔
- [PHASE5_SUMMARY.md](./PHASE5_SUMMARY.md) - 階段 5 完成總結

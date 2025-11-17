/**
 * 幾何工具 - 計算吸附、對齊、碰撞等
 */

/**
 * 吸附到網格
 * @param {number} value - 原始值
 * @param {number} gridSize - 網格大小
 * @returns {number} 吸附後的值
 */
export function snapToGrid(value, gridSize) {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * 吸附座標到網格
 */
export function snapPointToGrid(x, y, gridSize) {
  return {
    x: snapToGrid(x, gridSize),
    y: snapToGrid(y, gridSize)
  };
}

/**
 * 吸附矩形到網格
 */
export function snapRectToGrid(frame, gridSize) {
  return {
    x: snapToGrid(frame.x, gridSize),
    y: snapToGrid(frame.y, gridSize),
    w: snapToGrid(frame.w, gridSize),
    h: snapToGrid(frame.h, gridSize)
  };
}

/**
 * 計算矩形的關鍵點（用於智慧輔助線）
 */
export function getRectKeyPoints(frame) {
  const { x, y, w, h } = frame;
  return {
    left: x,
    right: x + w,
    centerX: x + w / 2,
    top: y,
    bottom: y + h,
    centerY: y + h / 2
  };
}

/**
 * 檢查兩個值是否在閾值範圍內
 */
export function isNear(value1, value2, threshold = 8) {
  return Math.abs(value1 - value2) <= threshold;
}

/**
 * 計算智慧輔助線
 * @param {Object} movingFrame - 正在移動的元素框架
 * @param {Array} otherFrames - 其他元素的框架
 * @param {number} threshold - 吸附閾值（像素）
 * @returns {Object} { snapX, snapY, guides: [] }
 */
export function calculateSmartGuides(movingFrame, otherFrames, threshold = 8) {
  const movingPoints = getRectKeyPoints(movingFrame);
  const guides = [];
  let snapX = null;
  let snapY = null;

  otherFrames.forEach(otherFrame => {
    const otherPoints = getRectKeyPoints(otherFrame);

    // 檢查水平對齊
    // 左對齊
    if (isNear(movingPoints.left, otherPoints.left, threshold)) {
      snapX = otherPoints.left;
      guides.push({
        type: 'vertical',
        position: otherPoints.left,
        label: 'L'
      });
    }
    // 右對齊
    else if (isNear(movingPoints.right, otherPoints.right, threshold)) {
      snapX = otherPoints.right - movingFrame.w;
      guides.push({
        type: 'vertical',
        position: otherPoints.right,
        label: 'R'
      });
    }
    // 中心對齊
    else if (isNear(movingPoints.centerX, otherPoints.centerX, threshold)) {
      snapX = otherPoints.centerX - movingFrame.w / 2;
      guides.push({
        type: 'vertical',
        position: otherPoints.centerX,
        label: 'C'
      });
    }

    // 檢查垂直對齊
    // 上對齊
    if (isNear(movingPoints.top, otherPoints.top, threshold)) {
      snapY = otherPoints.top;
      guides.push({
        type: 'horizontal',
        position: otherPoints.top,
        label: 'T'
      });
    }
    // 下對齊
    else if (isNear(movingPoints.bottom, otherPoints.bottom, threshold)) {
      snapY = otherPoints.bottom - movingFrame.h;
      guides.push({
        type: 'horizontal',
        position: otherPoints.bottom,
        label: 'B'
      });
    }
    // 中心對齊
    else if (isNear(movingPoints.centerY, otherPoints.centerY, threshold)) {
      snapY = otherPoints.centerY - movingFrame.h / 2;
      guides.push({
        type: 'horizontal',
        position: otherPoints.centerY,
        label: 'M'
      });
    }
  });

  return { snapX, snapY, guides };
}

/**
 * 檢查點是否在矩形內
 */
export function isPointInRect(px, py, rect) {
  return px >= rect.x &&
         px <= rect.x + rect.w &&
         py >= rect.y &&
         py <= rect.y + rect.h;
}

/**
 * 檢查兩個矩形是否相交
 */
export function rectsIntersect(rect1, rect2) {
  return !(rect1.x + rect1.w < rect2.x ||
           rect2.x + rect2.w < rect1.x ||
           rect1.y + rect1.h < rect2.y ||
           rect2.y + rect2.h < rect1.y);
}

/**
 * 取得矩形的邊界框（用於多選）
 */
export function getBoundingRect(frames) {
  if (frames.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  frames.forEach(frame => {
    minX = Math.min(minX, frame.x);
    minY = Math.min(minY, frame.y);
    maxX = Math.max(maxX, frame.x + frame.w);
    maxY = Math.max(maxY, frame.y + frame.h);
  });

  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY
  };
}

/**
 * 限制值在範圍內
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

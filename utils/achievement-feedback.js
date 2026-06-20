function normalizeList(unlocked) {
  if (!unlocked) {
    return [];
  }
  return (Array.isArray(unlocked) ? unlocked : [unlocked]).filter(Boolean);
}

function hasUnlocks(unlocked) {
  return normalizeList(unlocked).length > 0;
}

function finishQueue(page) {
  const callback = page.__achievementDone || null;
  page.__achievementDone = null;
  page.setData({
    achievementPopupVisible: false,
    achievementPopup: null,
    achievementQueue: []
  });
  if (callback) {
    callback();
  }
}

function showNext(page) {
  const queue = page.data.achievementQueue || [];
  if (!queue.length) {
    finishQueue(page);
    return;
  }
  const current = queue[0];
  page.setData({
    achievementPopupVisible: true,
    achievementPopup: current,
    achievementQueue: queue.slice(1)
  });
}

function queue(page, unlocked, done) {
  const list = normalizeList(unlocked);
  if (!list.length) {
    if (done) {
      done();
    }
    return;
  }
  const existing = page.data.achievementQueue || [];
  page.__achievementDone = done || page.__achievementDone || null;
  if (page.data.achievementPopupVisible) {
    page.setData({
      achievementQueue: existing.concat(list)
    });
    return;
  }
  page.setData({
    achievementQueue: list
  });
  showNext(page);
}

function advance(page) {
  if (page.data.achievementQueue && page.data.achievementQueue.length) {
    showNext(page);
    return;
  }
  finishQueue(page);
}

function clear(page) {
  page.__achievementDone = null;
  if (page && page.setData) {
    page.setData({
      achievementPopupVisible: false,
      achievementPopup: null,
      achievementQueue: []
    });
  }
}

module.exports = {
  hasUnlocks,
  queue,
  advance,
  clear
};

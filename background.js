console.log('bg');

const MOVEMENT_TIME_THRESHHOLD = 100;
const DEFAULT_TAB_ZOOM = 1;
const DEFAULT_PIXELS_PER_INCH = 96;

// Globals
let distance = 0; // in inches
let movements = [];
let tabZooms = {};

function init() {
  distance = parseFloat(window.localStorage['distance'] || '0');
  console.log('init distance', distance);
}
init();

const MAX_MOVEMENTS = 1000;

// Listeners
chrome.runtime.onMessage.addListener(handleMessage);
chrome.tabs.onZoomChange.addListener(handleZoomChange);
chrome.tabs.onRemoved.addListener(handleTabRemoved);

function handleMessage({ type, data }, sender) {
  if (type === 'mousemove') {
    handleMouseMove(data, sender);
  } else if (type === 'reset') {
    resetMovements();
  }
}

function handleTabRemoved({ tabId }) {
  console.log(`closing tab ${tabId}`);
  delete tabZooms[tabId];
}

function handleZoomChange({ tabId, newZoomFactor }) {
  console.log(`tab ${tabId} zoom changed to ${newZoomFactor}`);
  tabZooms[tabId] = newZoomFactor;
}

function handleMouseMove({ clientX: x, clientY: y }, sender) {
  let { tab, frameId } = sender;
  if (tab === undefined || frameId === undefined) {
    console.log('no tab or frame, bailing', tab, frameId);
    return;
  }
  let ts = new Date().getTime();
  recordMovement({ x, y, tabId: tab.id, frameId, ts });
}

function resetMovements() {
  console.log('reset');
  movements = [];
  distance = 0;
  window.localStorage.removeItem('distance');
}

function recordMovement(movement) {
  let prevMove = movements[movements.length - 1];
  movements.push(movement);
  if (!prevMove) {
    return;
  }
  if (!shouldRecord(prevMove, movement)) {
    return;
  }
  distance += distanceBetween(prevMove, movement);
  window.localStorage['distance'] = distance;

  console.log(distance, movement, movements.length);
  if (movements.length > MAX_MOVEMENTS) {
    movements = [];
  }
}

function shouldRecord(prevMove, curMove) {
  if (movementTooOld(prevMove, curMove)) {
    console.log('too old');
    return false;
  }
  if (movementDiffOrigin(prevMove, curMove)) {
    console.log('diff origin', prevMove, curMove);
    return false;
  }
  return true;
}

function movementTooOld({ ts: tsPrev }, { ts: tsCur }) {
  return tsCur - tsPrev > MOVEMENT_TIME_THRESHHOLD;
}

function movementDiffOrigin(
  { tabId: prevTabId, frameId: prevFrameId },
  { tabId, frameId }
) {
  return !(prevTabId === tabId && prevFrameId === frameId);
}

function getZoom(tabId) {
  return tabZooms[tabId] || DEFAULT_TAB_ZOOM;
}

// TODO -- can we do a better job?
function getPixelsPerInch() {
  return DEFAULT_PIXELS_PER_INCH;
}

function distanceBetween(moveA, moveB) {
  let zoom = getZoom(moveA.tabId);
  let pixelDistance = zoom * Math.hypot(moveA.x - moveB.x, moveA.y - moveB.y);
  return pixelDistance / getPixelsPerInch();
}

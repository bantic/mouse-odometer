const CREDIT_CARD_WIDTH_INCHES = 3.25;

let x, y;
document.addEventListener('mousemove', ({ clientX, clientY }) => {
  x = clientX;
  y = clientY;
});

let changeX, changeY;
document.getElementById('slider').addEventListener('change', () => {
  changeX = x;
  changeY = y;
});

document.getElementById('submit').addEventListener('click', () => {
  let left = document.getElementById('box').getBoundingClientRect().left;
  let width = changeX - left;

  chrome.tabs.getCurrent(tab => {
    chrome.tabs.getZoom(tab.id, zoom => {
      let adjustedWidth = zoom * width;

      let pixelsPerInch = adjustedWidth / CREDIT_CARD_WIDTH_INCHES;
      alert(`Calibrated: ${Math.round(pixelsPerInch)} pixels per inch`);

      chrome.runtime.sendMessage({
        type: 'calibrationResult',
        data: {
          pixelsPerInch,
          zoom,
          width,
          adjustedWidth
        }
      });
    });
  });
});

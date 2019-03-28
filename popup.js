const INCHES_PER_FOOT = 12;
const FEET_PER_MILE = 5280;
const INCHES_PER_MILE = INCHES_PER_FOOT * FEET_PER_MILE;

function run() {
  updateUI();

  document.getElementById('calibrate').addEventListener('click', () => {
    let url = chrome.extension.getURL('calibrate.html');
    chrome.tabs.create({ url });
  });
  document.getElementById('reset').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'reset' });
    setTimeout(updateUI, 100);
  });
}

function updateUI() {
  // Update distance
  let distanceInches = parseFloat(window.localStorage['distance'] || '0');
  let formatted = formatInches(distanceInches);
  document.getElementById('distance').innerText = formatted;

  // PPI
  chrome.runtime.sendMessage({ type: 'getPPI' }, ppi => {
    document.getElementById('ppi').innerText = `${Math.round(
      ppi
    )} pixels per inch`;
  });
}

function formatInches(inches) {
  let miles = Math.floor(inches / INCHES_PER_MILE);
  inches = inches - miles * INCHES_PER_MILE;
  let feet = Math.floor(inches / INCHES_PER_FOOT);
  inches = Math.floor(inches - feet * INCHES_PER_FOOT);

  return `${miles} miles, ${feet} feet, ${inches} inches`;
}

run();

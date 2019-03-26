console.log('content');

window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('click', handleClick);

function handleMouseMove(evt) {
  let { clientX, clientY } = evt;
  chrome.runtime.sendMessage({ type: 'mousemove', data: { clientX, clientY } });
}

function handleClick() {
  // chrome.runtime.sendMessage({ type: 'reset' });
}

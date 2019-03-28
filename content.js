window.addEventListener('mousemove', handleMouseMove);

function handleMouseMove(evt) {
  let { clientX, clientY } = evt;
  chrome.runtime.sendMessage({ type: 'mousemove', data: { clientX, clientY } });
}

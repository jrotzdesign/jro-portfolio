// The click-to-copy email address and the NYC clock, shared by the home contact section and /contact/.
// Looks for #mail (data-mail) and #time inside root. Returns a cleanup function.
export function initContactBits(root = document) {
  const cleanups = [];
  const mail = root.querySelector('#mail');
  if (mail) {
    const click = (e) => {
      if (!navigator.clipboard?.writeText) return;            // no clipboard here: the mailto link just opens
      e.preventDefault();
      navigator.clipboard.writeText(mail.dataset.mail).then(() => {
        mail.classList.add('did'); setTimeout(() => mail.classList.remove('did'), 1800);
      }).catch(() => { location.href = mail.href; });         // denied: fall back to the mailto link, not a dead click
    };
    mail.addEventListener('click', click);
    cleanups.push(() => mail.removeEventListener('click', click));
  }
  const time = root.querySelector('#time');
  if (time) {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false });
    const tick = () => { time.textContent = 'NYC ' + fmt.format(new Date()); };
    tick();
    const iv = setInterval(tick, 15000);
    cleanups.push(() => clearInterval(iv));
  }
  return () => cleanups.forEach((f) => f());
}

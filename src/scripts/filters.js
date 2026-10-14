// Project index filters (All / Mozart&Co. / JRO Design), shared by the home page and /work/.
// Buttons carry data-f, cards carry data-g. Returns a cleanup function.
export function initFilters(root = document, onChange) {
  const buttons = [...root.querySelectorAll('.filters button')];
  const cleanups = buttons.map((b) => {
    const click = () => {
      buttons.forEach((z) => z.classList.toggle('on', z === b));
      const f = b.dataset.f;
      root.querySelectorAll('.card').forEach((c) => c.classList.toggle('hide', !(f === 'all' || c.dataset.g === f)));
      if (onChange) onChange();
    };
    b.addEventListener('click', click);
    return () => b.removeEventListener('click', click);
  });
  return () => cleanups.forEach((f) => f());
}

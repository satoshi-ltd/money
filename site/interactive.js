(function () {
  const SPENDS = [
    [1, 118.4], [2, 36.5], [3, 64.88], [5, 142], [6, 28.4], [8, 126.2], [9, 36.4],
    [11, 420], [12, 88.3], [14, 205.1], [15, 310], [17, 96.45], [19, 540], [21, 134.2],
    [23, 88.75], [25, 402.3], [26, 76.4], [28, 260], [30, 150],
  ];
  const DAYS = 30;
  const FULL_USUAL = 3640;
  const EXPONENT = Math.log(1042.29 / FULL_USUAL) / Math.log(9 / DAYS);
  const FLAT_BAND = 5;
  const MIN_SHARE = 0.1;

  const cents = (value) => Math.round(value * 100) / 100;
  const usualBy = (day) => FULL_USUAL * Math.pow(day / DAYS, EXPONENT);
  const spentBy = (day) => SPENDS.filter(([d]) => d <= day).reduce((sum, [, amount]) => sum + amount, 0);
  const nth = (day) => {
    const rem = day % 100;
    const suffix = rem >= 11 && rem <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][day % 10] || 'th';
    return `${day}${suffix}`;
  };
  const figure = (value) => {
    const [whole, decimals] = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.');
    return `${whole}<i>.${decimals}</i>`;
  };

  function reading(day) {
    const spent = cents(spentBy(day));
    const usual = cents(usualBy(day));
    const delta = Math.round(((spent - usual) / usual) * 100);
    const early = usual < FULL_USUAL * MIN_SHARE;
    const direction = early
      ? spent > usual ? 'over' : spent < usual ? 'under' : 'flat'
      : delta > FLAT_BAND ? 'over' : delta < -FLAT_BAND ? 'under' : 'flat';
    const words = { over: 'more than usual', under: 'less than usual', flat: 'as usual' };
    const verdict = early || direction === 'flat' ? words[direction] : `${Math.abs(delta)}% ${direction === 'under' ? 'below' : 'above'} pace`;
    return { day, spent, usual, direction, verdict, label: `Usual by the ${nth(day)}` };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { reading, SPENDS, DAYS };
  if (typeof document === 'undefined') return;

  const NS = 'http://www.w3.org/2000/svg';
  const X0 = 44;
  const X1 = 540;
  const Y0 = 250;
  const Y1 = 22;
  const TOP = 4000;
  const x = (day) => X0 + (day / DAYS) * (X1 - X0);
  const y = (value) => Y0 - (value / TOP) * (Y0 - Y1);
  const node = (name, attributes, parent) => {
    const element = document.createElementNS(NS, name);
    for (const key of Object.keys(attributes)) element.setAttribute(key, attributes[key]);
    if (parent) parent.appendChild(element);
    return element;
  };
  const stepPath = (last) => {
    let path = `M${x(0)} ${y(0)}`;
    let before = 0;
    for (let day = 1; day <= last; day += 1) {
      const now = spentBy(day);
      path += `L${x(day)} ${y(before)}L${x(day)} ${y(now)}`;
      before = now;
    }
    return path;
  };

  function mountPace() {
    const root = document.getElementById('pace');
    if (!root) return;
    const svg = root.querySelector('.pace-svg');
    const input = root.querySelector('input');
    const pick = (selector) => root.querySelector(selector);

    for (const value of [1000, 2000, 3000, 4000]) {
      node('line', { class: 'pace-grid', x1: X0, x2: X1, y1: y(value), y2: y(value) }, svg);
      node('text', { class: 'pace-axis pace-axis-y', x: X0 - 8, y: y(value) + 3 }, svg).textContent = `${value / 1000}k`;
    }
    node('line', { class: 'pace-base', x1: X0, x2: X1, y1: Y0, y2: Y0 }, svg);
    for (const day of [1, 10, 20, 30]) {
      node('text', { class: 'pace-axis', x: x(day), y: Y0 + 18 }, svg).textContent = day;
    }
    const usualPoints = Array.from({ length: DAYS }, (_, i) => `${x(i + 1)},${y(usualBy(i + 1))}`).join(' ');
    node('polyline', { class: 'pace-usual', points: usualPoints }, svg);
    node('path', { class: 'pace-future', d: stepPath(DAYS) }, svg);
    const spentLine = node('path', { class: 'pace-spent', d: '' }, svg);
    const cursor = node('line', { class: 'pace-cursor', y1: Y1, y2: Y0 }, svg);
    const usualDot = node('circle', { class: 'pace-dot pace-dot-usual', r: 5 }, svg);
    const spentDot = node('circle', { class: 'pace-dot pace-dot-spent', r: 6 }, svg);

    function paint() {
      const now = reading(Number(input.value));
      spentLine.setAttribute('d', stepPath(now.day));
      cursor.setAttribute('x1', x(now.day));
      cursor.setAttribute('x2', x(now.day));
      usualDot.setAttribute('cx', x(now.day));
      usualDot.setAttribute('cy', y(now.usual));
      spentDot.setAttribute('cx', x(now.day));
      spentDot.setAttribute('cy', y(now.spent));
      pick('[data-spent]').innerHTML = figure(now.spent);
      pick('[data-usual]').innerHTML = figure(now.usual);
      pick('[data-usual-label]').textContent = now.label;
      pick('[data-day]').textContent = nth(now.day);
      const verdict = pick('[data-verdict]');
      verdict.textContent = now.verdict;
      verdict.dataset.direction = now.direction;
      const scale = Math.max(now.spent, now.usual);
      pick('[data-fill]').setAttribute('width', (now.spent / scale) * 100);
      pick('[data-tick]').setAttribute('x', (now.usual / scale) * 100 - 0.6);
      input.setAttribute('aria-valuetext', `${nth(now.day)}: ${now.verdict}`);
    }

    input.addEventListener('input', paint);
    paint();
    root.hidden = false;
  }

  function mountMask() {
    const button = document.querySelector('.mask-btn');
    const phone = document.querySelector('.phone');
    if (!button || !phone) return;
    button.hidden = false;
    button.addEventListener('click', () => {
      const masked = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(masked));
      if (masked) phone.dataset.masked = '';
      else delete phone.dataset.masked;
    });
  }

  mountPace();
  mountMask();
})();

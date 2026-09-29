(function exposeCharts(global) {
  const NS = 'http://www.w3.org/2000/svg';
  const number = value => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value);
  function node(tag, attrs, text) {
    const element = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => element.setAttribute(key, value));
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function base(title, height) {
    const svg = node('svg', { viewBox: `0 0 640 ${height}`, role: 'img', 'aria-label': title });
    svg.append(node('title', {}, title));
    return svg;
  }
  function bars(container, rows, title, format = number) {
    container.replaceChildren();
    if (!rows.length || !rows.some(row => row.value > 0)) {
      const empty = document.createElement('p'); empty.className = 'report-chart-empty'; empty.textContent = 'Chưa có dữ liệu.'; container.append(empty); return;
    }
    const svg = base(title, rows.length * 65 + 10);
    const max = Math.max(...rows.map(row => row.value), 1);
    rows.forEach((row, index) => {
      const y = index * 65 + 18;
      const label = row.label.length > 58 ? `${row.label.slice(0, 55)}…` : row.label;
      svg.append(node('text', { x: 0, y, fill: '#44515d', 'font-size': 15 }, label));
      const bar = node('rect', { x: 0, y: y + 8, width: Math.max(0, row.value / max * 450), height: 20, rx: 4, fill: '#e21b22' });
      bar.append(node('title', {}, `${row.label}: ${format(row.value)}`)); svg.append(bar);
      svg.append(node('text', { x: 465, y: y + 24, fill: '#243747', 'font-size': 14 }, format(row.value)));
    });
    container.append(svg);
  }
  function line(container, rows, title) {
    container.replaceChildren();
    const svg = base(title, 280);
    const max = Math.max(...rows.map(row => row.totalRevenue), 1);
    const x = index => 90 + index / Math.max(rows.length - 1, 1) * 510;
    const y = value => 220 - value / max * 180;
    for (let i = 0; i <= 4; i += 1) {
      const value = max * i / 4;
      svg.append(node('line', { x1: 90, y1: y(value), x2: 600, y2: y(value), stroke: '#e2e8ee' }));
      svg.append(node('text', { x: 80, y: y(value) + 4, 'text-anchor': 'end', fill: '#596675', 'font-size': 12 }, number(value)));
    }
    svg.append(node('polyline', { points: rows.map((row, index) => `${x(index)},${y(row.totalRevenue)}`).join(' '), fill: 'none', stroke: '#e21b22', 'stroke-width': 3 }));
    rows.forEach((row, index) => {
      const dot = node('circle', { cx: x(index), cy: y(row.totalRevenue), r: 4, fill: '#e21b22' });
      dot.append(node('title', {}, `${row.from} – ${row.to}: ${number(row.totalRevenue)} đ; ${row.completedOrders} đơn`));
      svg.append(dot);
    });
    if (rows.length) {
      svg.append(node('text', { x: 90, y: 248, fill: '#596675', 'font-size': 13 }, rows[0].from));
      svg.append(node('text', { x: 600, y: 248, 'text-anchor': 'end', fill: '#596675', 'font-size': 13 }, rows.at(-1).to));
    }
    svg.append(node('text', { x: 90, y: 18, fill: '#596675', 'font-size': 12 }, 'VNĐ'));
    container.append(svg);
  }
  global.ReportCharts = { bars, line };
})(window);

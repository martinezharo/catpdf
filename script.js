import { PDFDocument } from 'pdf-lib';
import Sortable from 'sortablejs';

const els = {
  drop: document.getElementById('drop'),
  file: document.getElementById('file'),
  list: document.getElementById('list'),
  bar: document.getElementById('bar'),
  total: document.getElementById('total'),
  merge: document.getElementById('merge'),
  clear: document.getElementById('clear'),
  status: document.getElementById('status'),
};

let docs = []; // { id, name, size, buffer, pages, error }
let uid = 0;

/* ---------- adding files ---------- */
async function addFiles(fileList) {
  const incoming = Array.from(fileList).filter(f =>
    f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));

  const skipped = fileList.length - incoming.length;
  if (skipped > 0) setStatus(`${skipped} non-PDF file(s) were ignored.`, 'bad');

  for (const f of incoming) {
    const entry = { id: ++uid, name: f.name, size: f.size, buffer: null, pages: null, error: false };
    docs.push(entry);
    try {
      const buffer = await f.arrayBuffer();
      entry.buffer = buffer;
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      entry.pages = pdf.getPageCount();
    } catch (e) {
      entry.error = true;
    }
    render();
  }
}

/* ---------- rendering ---------- */
function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function render() {
  els.list.innerHTML = '';
  docs.forEach((d, i) => {
    const li = document.createElement('li');
    li.className = 'sheet';
    li.dataset.id = d.id;

    const stats = d.error
      ? `<div class="stats err">could not be read · damaged or protected?</div>`
      : `<div class="stats">${d.pages == null ? 'reading...' : d.pages + (d.pages === 1 ? ' page' : ' pages')} · ${fmtSize(d.size)}</div>`;

    li.innerHTML = `
      <span class="handle" title="Drag to reorder" aria-hidden="true">⠿</span>
      <span class="num">${String(i + 1).padStart(2, '0')}</span>
      <div class="meta">
        <div class="name" title="${escapeHtml(d.name)}">${escapeHtml(d.name)}</div>
        ${stats}
      </div>
      <div class="moves">
        <button class="icon-btn up" ${i === 0 ? 'disabled' : ''} aria-label="Move up">▲</button>
        <button class="icon-btn down" ${i === docs.length - 1 ? 'disabled' : ''} aria-label="Move down">▼</button>
      </div>
      <button class="icon-btn remove" aria-label="Remove">✕</button>
    `;

    li.querySelector('.up').onclick = () => move(i, i - 1);
    li.querySelector('.down').onclick = () => move(i, i + 1);
    li.querySelector('.remove').onclick = () => { docs.splice(i, 1); render(); };

    els.list.appendChild(li);
  });

  const valid = docs.filter(d => !d.error);
  const totalPages = valid.reduce((n, d) => n + (d.pages || 0), 0);
  els.bar.hidden = docs.length === 0;
  els.total.innerHTML = `<b>${valid.length}</b> PDF · <b>${totalPages}</b> total pages`;
  els.merge.disabled = valid.length < 2 || valid.some(d => d.pages == null);
}

function move(from, to) {
  if (to < 0 || to >= docs.length) return;
  const [item] = docs.splice(from, 1);
  docs.splice(to, 0, item);
  render();
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function setStatus(msg, kind) {
  els.status.textContent = msg;
  els.status.className = 'status' + (kind ? ' ' + kind : '');
}

/* ---------- drag to reorder ---------- */
Sortable.create(els.list, {
  handle: '.handle',
  animation: 150,
  ghostClass: 'ghost',
  dragClass: 'dragging',
  onEnd(evt) {
    if (evt.oldIndex === evt.newIndex) return;
    const [item] = docs.splice(evt.oldIndex, 1);
    docs.splice(evt.newIndex, 0, item);
    render();
  }
});

/* ---------- merging ---------- */
async function mergePdfs() {
  const valid = docs.filter(d => !d.error && d.buffer);
  if (valid.length < 2) return;

  els.merge.disabled = true;
  setStatus('Concatenating...', '');

  try {
    const out = await PDFDocument.create();
    for (const d of valid) {
      const src = await PDFDocument.load(d.buffer, { ignoreEncryption: true });
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach(p => out.addPage(p));
    }
    const bytes = await out.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catpdf-concatenated.pdf';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setStatus(`Done · ${out.getPageCount()} pages concatenated and downloaded.`, 'ok');
  } catch (e) {
    setStatus('Something failed while concatenating. Check that the PDFs are not protected.', 'bad');
  } finally {
    els.merge.disabled = false;
  }
}

/* ---------- events ---------- */
els.drop.onclick = () => els.file.click();
els.drop.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); els.file.click(); } };
els.file.onchange = e => { addFiles(e.target.files); els.file.value = ''; };

['dragenter', 'dragover'].forEach(ev =>
  els.drop.addEventListener(ev, e => { e.preventDefault(); els.drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev =>
  els.drop.addEventListener(ev, e => { e.preventDefault(); els.drop.classList.remove('over'); }));
els.drop.addEventListener('drop', e => addFiles(e.dataTransfer.files));

els.merge.onclick = mergePdfs;
els.clear.onclick = () => { docs = []; render(); setStatus(''); };

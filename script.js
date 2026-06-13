const rows = document.getElementById('rows');
const seed = [
  ['Bisa dimainkan dari menu', 15],
  ['Bisa pause & resume', 15],
  ['Bisa game over & restart', 15],
  ['Menggunakan Scriptable Object', 20],
  ['Player bisa menembak', 15],
  ['Peluru menggunakan object pool', 20],
];

// Hidden cap: a perfect score (all met) maps to this instead of 100.
const SCORE_CAP = 95;

function addRow(name = '', max = '') {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input type="text" class="c-name" value="${name}" placeholder="Nama kriteria"></td>
    <td class="num"><input type="number" class="c-max" step="any" value="${max}" placeholder="poin"></td>
    <td><button class="rowbtn" onclick="this.closest('tr').remove();updateMax()">×</button></td>`;
  rows.appendChild(tr);
  tr.querySelector('.c-max').addEventListener('input', updateMax);
  updateMax();
}

function updateMax() {
  let s = 0;
  document.querySelectorAll('.c-max').forEach(i => s += parseFloat(i.value) || 0);
  document.getElementById('totalmax').textContent = 'Total poin maksimal: ' + round(s);
}

function round(n) { return Math.round(n * 100) / 100; }

function breakdown() {
  const names = [...document.querySelectorAll('.c-name')].map(i => i.value.trim() || 'Kriteria');
  const maxes = [...document.querySelectorAll('.c-max')].map(i => parseFloat(i.value));
  const final = parseFloat(document.getElementById('final').value);
  const scale100 = document.getElementById('scale100').checked;

  if (maxes.some(isNaN)) { alert('Isi poin maksimal tiap kriteria.'); return; }
  if (isNaN(final)) { alert('Masukkan nilai akhir.'); return; }

  const totalMax = maxes.reduce((a, b) => a + b, 0);
  // The breakdown reconstructs points that sum exactly to the entered score,
  // so the on-screen formula (÷ totalMax × 100) reproduces that score cleanly.
  // The hidden cap only limits the ceiling: you can't reconstruct above SCORE_CAP.
  if (scale100 && final > SCORE_CAP + 0.001) {
    alert('Nilai melebihi skor maksimal yang diizinkan (' + SCORE_CAP + ').'); return;
  }
  const target = scale100 ? final / 100 * totalMax : final;
  if (target > totalMax + 0.001) { alert('Nilai melebihi total poin maksimal.'); return; }

  // Greedy: fill criteria fully from largest to smallest, last one gets partial credit.
  const idx = [...names.keys()].sort((a, b) => maxes[b] - maxes[a]);
  const earned = new Array(names.length).fill(0);
  let remaining = target;
  for (const i of idx) {
    if (remaining <= 0.001) { earned[i] = 0; continue; }
    if (maxes[i] <= remaining + 0.001) { earned[i] = maxes[i]; remaining -= maxes[i]; }
    else { earned[i] = round(remaining); remaining = 0; }
  }

  // Build breakdown table
  let html = '<thead><tr><th>Kriteria</th><th class="num">Status</th><th class="num">Poin</th></tr></thead><tbody>';
  names.forEach((n, i) => {
    let badge, cls;
    if (Math.abs(earned[i] - maxes[i]) < 0.001 && maxes[i] > 0) { badge = 'Terpenuhi'; cls = 'met'; }
    else if (earned[i] <= 0.001) { badge = 'Tidak'; cls = 'miss'; }
    else { badge = 'Sebagian'; cls = 'part'; }
    html += `<tr><td>${n}</td><td class="num"><span class="badge ${cls}">${badge}</span></td><td class="pts">${round(earned[i])} / ${round(maxes[i])}</td></tr>`;
  });
  const totalEarned = earned.reduce((a, b) => a + b, 0);
  html += `<tr class="totalrow"><td>Total</td><td></td><td class="pts">${round(totalEarned)} / ${round(totalMax)}</td></tr></tbody>`;
  document.getElementById('bdtable').innerHTML = html;

  // Build formula
  let f = 'Total poin diperoleh:\n';
  f += '  ' + earned.map(round).join(' + ') + ' = ' + round(totalEarned) + '\n\n';
  if (scale100) {
    f += 'Konversi ke skala 100:\n';
    f += '  Nilai = (Total diperoleh ÷ Total maks) × 100\n';
    f += '  Nilai = (' + round(totalEarned) + ' ÷ ' + round(totalMax) + ') × 100\n';
    f += '  Nilai = ' + round(totalEarned / totalMax * 100) + '\n';
  } else {
    f += 'Nilai akhir = ' + round(totalEarned) + ' (dari maks ' + round(totalMax) + ')\n';
  }
  document.getElementById('formula').textContent = f;

  // Verdict
  const computed = scale100 ? round(totalEarned / totalMax * 100) : round(totalEarned);
  const vd = document.getElementById('verdict');
  vd.className = 'verdict ok';
  vd.innerHTML = '✓ Breakdown ini menghasilkan nilai akhir ' + computed + ', sesuai dengan yang kamu catat.';
  vd.innerHTML += '<div class="note">Catatan: breakdown ini satu kemungkinan (kriteria dipenuhi dari poin terbesar dulu, sisanya jadi nilai sebagian). Kamu bisa atur ulang poin maks tiap kriteria untuk mencocokkan penilaian sebenarnya.</div>';

  // Identity
  const studentName = document.getElementById('studentname').value.trim() || '-';
  const studentClass = document.getElementById('studentclass').value.trim() || '-';
  const idEl = document.getElementById('identityresult');
  idEl.innerHTML = '';
  const nameB = document.createElement('b'); nameB.textContent = 'Nama:';
  const classB = document.createElement('b'); classB.textContent = 'Kelas:';
  idEl.append(nameB, ' ' + studentName + '  |  ', classB, ' ' + studentClass);

  document.getElementById('result').style.display = 'block';
}

seed.forEach(r => addRow(...r));

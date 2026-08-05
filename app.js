/* =====================================================================
   Generator Dokumen (Invoice & Penawaran, PT & CV) — app.js
   Digabung dari 4 file asli:
     - Invoice-pt.html
     - invoice-cv.html
     - penawaran-pt.html
     - penawaran-cv.html
   Logic kalkulasi, terbilang, format angka, dan proses clone baris XML
   docx diambil & diparameterisasi dari Invoice-pt.html (referensi paling
   lengkap), lalu disesuaikan per kombinasi lewat objek MODES di bawah.
   ===================================================================== */

/* ===================== Konfigurasi per kombinasi (Jenis Surat x Entitas) ===================== */

const MODES = {
  invoice_pt: {
    jenis: 'invoice', entitas: 'pt',
    brandMark: 'PT',
    title: 'Generator Invoice',
    subtitle: 'PT. Latansa Madani Safety',
    pageTitle: 'Generator Invoice — PT. Latansa Madani Safety',
    dataPanelTitle: 'Data Invoice',
    itemsPanelTitle: 'Rincian Item',
    generateLabel: 'Download Invoice (.docx)',
    templateVar: () => TEMPLATE_INVOICE_PT_B64,
    templateVarName: 'TEMPLATE_INVOICE_PT_B64',

    defaultNomorNumber: '000',
    nomorPrefix: 'PTLMS-FIN',

    hasAlamat: true,
    alamatMultiline: true,
    hasKontakTtd: true,
    showPoFields: true,
    showPerihalLampiran: false,
    showLampiran: false,

    namaClientLabel: 'Nama Client',
    namaClientPlaceholder: 'mis. PT. Contoh Jaya',
    namaClientToken: 'NAMA_CLIENT',

    poDateLabel: 'Tgl. PO', poDateToken: 'TGL_PO', poDateDefault: '', poDatePlaceholder: 'mis. 10 Juli 2026',
    poNoLabel: 'Nomor PO', poNoToken: 'NOMOR_PO', poNoDefault: '', poNoPlaceholder: 'mis. PO-0012',

    itemNameHeader: 'Uraian',
    itemHargaHeader: 'Harga Satuan',
    itemNameToken: 'URAIAN',
    itemQtyToken: 'QTY',

    defaultNamaTtd: 'Eva Rusliani Utami',
    defaultKontakTtd: '(+62- 812-8952-5579)',

    ppnLabelFormat: (p) => `PPN (${p}%)`,
    diskonStrategy: 'clone', // baris DISKON di-clone dari baris PPN

    buildFileName: (ctx) => `${ctx.prefix} - INV - ${ctx.namaClientUpper} - ${ctx.poNoUpper}.docx`,

    gemMode: 'invoice', // NOMOR_PO / TANGGAL_PO / NAMA_CLIENT / ALAMAT_CLIENT / ITEM
  },

  invoice_cv: {
    jenis: 'invoice', entitas: 'cv',
    brandMark: 'CV',
    title: 'Generator Invoice',
    subtitle: 'CV. Anugerah Jaya',
    pageTitle: 'Generator Invoice — CV. Anugerah Jaya',
    dataPanelTitle: 'Data Invoice',
    itemsPanelTitle: 'Rincian Item',
    generateLabel: 'Download Invoice (.docx)',
    templateVar: () => TEMPLATE_INVOICE_CV_B64,
    templateVarName: 'TEMPLATE_INVOICE_CV_B64',

    defaultNomorNumber: '000',
    nomorPrefix: 'CVAJ-FIN',

    hasAlamat: true,
    alamatMultiline: false,
    hasKontakTtd: false,
    showPoFields: true,
    showPerihalLampiran: false,
    showLampiran: false,

    namaClientLabel: 'Nama Client',
    namaClientPlaceholder: 'Nama perusahaan / perorangan',
    namaClientToken: 'NAMA_CLIENT',

    poDateLabel: 'PO Date', poDateToken: 'PO_DATE', poDateDefault: '-', poDatePlaceholder: '',
    poNoLabel: 'PO No.', poNoToken: 'PO_NO', poNoDefault: '-', poNoPlaceholder: '',

    itemNameHeader: 'Nama Jasa',
    itemHargaHeader: 'Harga',
    itemNameToken: 'NAMA_JASA',
    itemQtyToken: 'BANYAK',

    defaultNamaTtd: 'Lukmanul Hakim Alfaroisi',
    defaultKontakTtd: '',

    ppnLabelFormat: (p) => `PPN (${p}%)`,
    diskonStrategy: 'existing', // placeholder {{DISKON}} sudah ada di template

    buildFileName: (ctx) => `${ctx.prefix} - INV - ${ctx.namaClientUpper} - ${ctx.poNoUpper}.docx`,

    gemMode: 'invoice',
  },

  penawaran_pt: {
    jenis: 'penawaran', entitas: 'pt',
    brandMark: 'PT',
    title: 'Generator Surat Penawaran',
    subtitle: 'PT. Latansa Madani Safety',
    pageTitle: 'Generator Surat Penawaran — PT. Latansa Madani Safety',
    dataPanelTitle: 'Data Surat',
    itemsPanelTitle: 'Rincian Item',
    generateLabel: 'Buat Surat Penawaran (.docx)',
    templateVar: () => TEMPLATE_PENAWARAN_PT_B64,
    templateVarName: 'TEMPLATE_PENAWARAN_PT_B64',

    defaultNomorNumber: '0000',
    nomorPrefix: 'PTLMS-SP',

    hasAlamat: false,
    alamatMultiline: false,
    hasKontakTtd: true,
    showPoFields: false,
    showPerihalLampiran: true,
    showLampiran: false,

    namaClientLabel: 'Kepada Yth,',
    namaClientPlaceholder: 'Contoh: PT. Sumber Rejeki Abadi / CV. Abadi Jaya / Toko Makmur',
    namaClientToken: 'NAMA_PT',

    itemNameHeader: 'Nama Jasa / Barang',
    itemHargaHeader: 'Harga Satuan',
    itemNameToken: 'NAMA_JASA',
    itemQtyToken: 'QTY',

    defaultNamaTtd: 'Eva Rusliani Utami',
    defaultKontakTtd: '+62-812-8952-5579',

    ppnLabelFormat: (p) => `PPN (${p}%)`,
    diskonStrategy: 'clone',

    buildFileName: (ctx) => `${ctx.prefix} - ${ctx.perihalUpper} - ${ctx.namaClientUpper}.docx`,

    gemMode: 'penawaran', // hanya NAMA_CLIENT & ITEM
  },

  penawaran_cv: {
    jenis: 'penawaran', entitas: 'cv',
    brandMark: 'CV',
    title: 'Generator Surat Penawaran',
    subtitle: 'CV. Anugerah Jaya',
    pageTitle: 'Generator Surat Penawaran — CV. Anugerah Jaya',
    dataPanelTitle: 'Informasi Surat',
    itemsPanelTitle: 'Daftar Item / Jasa',
    generateLabel: 'Download Surat Penawaran (.docx)',
    templateVar: () => TEMPLATE_PENAWARAN_CV_B64,
    templateVarName: 'TEMPLATE_PENAWARAN_CV_B64',

    defaultNomorNumber: '0000',
    nomorPrefix: 'CVAJ-SP',

    hasAlamat: false,
    alamatMultiline: false,
    hasKontakTtd: false,
    showPoFields: false,
    showPerihalLampiran: true,
    showLampiran: true,

    namaClientLabel: 'Kepada Yth. (Nama Client)',
    namaClientPlaceholder: 'mis. PT Sinar Abadi / CV Maju Jaya / Toko Makmur',
    namaClientToken: 'NAMA_CLIENT',

    itemNameHeader: 'Nama Jasa',
    itemHargaHeader: 'Harga',
    itemNameToken: 'NAMA_JASA',
    itemQtyToken: 'BANYAK',

    defaultNamaTtd: 'Lukmanul Hakim Alfaroisi',
    defaultKontakTtd: '',

    ppnLabelFormat: (p) => `PPN (${p}%)`,
    diskonStrategy: 'existing',

    buildFileName: (ctx) => `${ctx.prefix} - ${ctx.perihalUpper} - ${ctx.namaClientUpper}.docx`,

    gemMode: 'penawaran',
  },
};

function getMode() {
  const jenis = document.getElementById('selJenis').value;
  const entitas = document.getElementById('selEntitas').value;
  return MODES[`${jenis}_${entitas}`];
}

/* ===================== Flag "sudah diedit manual" ===================== */
/* Field-field ini punya default yang beda-beda tergantung kombinasi mode.
   Kalau user belum pernah ngedit manual, boleh ditimpa otomatis waktu
   dropdown Jenis Surat / Entitas diganti. */
const manualFlags = { nomor: false, namaTtd: false, kontakTtd: false, poDate: false, poNo: false, ppn: false };

function markManual(id, key) {
  document.getElementById(id).addEventListener('input', () => { manualFlags[key] = true; });
}

/* ===================== Utilities (diambil & disatukan dari Invoice-pt.html) ===================== */

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function b64ToArrayBuffer(b64) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function formatAngka(n) {
  n = Math.round(n || 0);
  return n.toLocaleString('id-ID');
}

function digitsOnlyStripLeadingZero(raw) {
  let digits = String(raw).replace(/\D/g, '');
  digits = digits.replace(/^0+(?=\d)/, '');
  return digits;
}

function formatRibuan(digits) {
  if (!digits) return '';
  return String(digits).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseRibuan(str) {
  return parseInt(String(str).replace(/\./g, ''), 10) || 0;
}

function attachThousandsMask(inputEl, onChange) {
  inputEl.setAttribute('inputmode', 'numeric');
  inputEl.setAttribute('autocomplete', 'off');
  inputEl.addEventListener('input', () => {
    const cursorFromEnd = inputEl.value.length - inputEl.selectionStart;
    const digits = digitsOnlyStripLeadingZero(inputEl.value);
    const formatted = formatRibuan(digits);
    inputEl.value = formatted;
    const pos = Math.max(0, formatted.length - cursorFromEnd);
    inputEl.setSelectionRange(pos, pos);
    if (onChange) onChange();
  });
}

/* ===================== Terbilang (Bahasa Indonesia) ===================== */
function terbilangAngka(n) {
  n = Math.floor(Math.abs(n));
  if (n === 0) return "Nol";
  const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  function rec(n) {
    if (n < 12) return satuan[n];
    if (n < 20) return (rec(n - 10) + " Belas").trim();
    if (n < 100) {
      const sisa = n % 10;
      return (rec(Math.floor(n / 10)) + " Puluh" + (sisa !== 0 ? " " + rec(sisa) : "")).trim();
    }
    if (n < 200) {
      const sisa = n % 100;
      return ("Seratus" + (sisa !== 0 ? " " + rec(sisa) : "")).trim();
    }
    if (n < 1000) {
      const sisa = n % 100;
      return (rec(Math.floor(n / 100)) + " Ratus" + (sisa !== 0 ? " " + rec(sisa) : "")).trim();
    }
    if (n < 2000) {
      const sisa = n % 1000;
      return ("Seribu" + (sisa !== 0 ? " " + rec(sisa) : "")).trim();
    }
    if (n < 1000000) {
      const sisa = n % 1000;
      return (rec(Math.floor(n / 1000)) + " Ribu" + (sisa !== 0 ? " " + rec(sisa) : "")).trim();
    }
    if (n < 1000000000) {
      const sisa = n % 1000000;
      return (rec(Math.floor(n / 1000000)) + " Juta" + (sisa !== 0 ? " " + rec(sisa) : "")).trim();
    }
    if (n < 1000000000000) {
      const sisa = n % 1000000000;
      return (rec(Math.floor(n / 1000000000)) + " Miliar" + (sisa !== 0 ? " " + rec(sisa) : "")).trim();
    }
    if (n < 1000000000000000) {
      const sisa = n % 1000000000000;
      return (rec(Math.floor(n / 1000000000000)) + " Triliun" + (sisa !== 0 ? " " + rec(sisa) : "")).trim();
    }
    return "Angka Terlalu Besar";
  }
  return rec(n).replace(/\s+/g, ' ').trim();
}

function terbilangRupiah(n) {
  return terbilangAngka(Math.round(n || 0)) + " Rupiah";
}

/* ===================== Tanggal ===================== */
const BULAN_INDO = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const ROMAWI = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

function todayIsoLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIsoDate(iso) {
  const parts = iso.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatTanggalIndo(iso) {
  if (!iso) return '';
  const d = parseIsoDate(iso);
  return `${d.getDate()} ${BULAN_INDO[d.getMonth()]} ${d.getFullYear()}`;
}

function currentRomawiYear() {
  const iso = document.getElementById('tanggal').value || todayIsoLocal();
  const d = parseIsoDate(iso);
  return { romawi: ROMAWI[d.getMonth()], tahun: String(d.getFullYear()) };
}

/* ===================== Integrasi Google Drive ===================== */
/* Ganti sumber "nomor lanjutan otomatis" dari flashdisk lokal jadi
   folder Google Drive. Login pakai Google Identity Services (OAuth
   di browser, gak butuh backend), lalu Drive API dipanggil langsung
   dari sini buat list nama file di folder yang sesuai & cari nomor
   terbesar — logic regex-nya sama persis kayak versi server.py. */

const GOOGLE_CLIENT_ID = '484128098878-mi51dupj424cvplvj87ffm7cpl7ff799.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

// Folder ID diambil dari URL folder Drive: .../folders/<FOLDER_ID>
const FOLDER_IDS = {
  pt: {
    invoice: '1zrpEUBbKS6uuic93VJADBdbE5NDtlj_A',
    penawaran: '1h6OkhPvxDHzqkGPA6t-k72C5XyAnMKTG',
  },
  cv: {
    invoice: '15sR8017whA1nD_ZJg2F46IxDT16D3j5D',
    penawaran: '1hp5L4z_KlE4VlWc37de-NneWDPcHI71m',
  },
};

const DRIVE_VALID_EXTENSIONS = ['docx', 'pdf'];
const DRIVE_NUMBER_PATTERN = /^(\d+)/;

let driveAccessToken = null;
let driveTokenClient = null;

function setDriveStatus(text) {
  const el = document.getElementById('driveStatusText');
  if (el) el.textContent = text || '';
}

// Nama key localStorage/sessionStorage buat sesi Drive.
const DRIVE_CONSENT_FLAG = 'gdrive_consented_before';
const DRIVE_TOKEN_CACHE_KEY = 'gdrive_token_cache';

// Kasih jeda 2 menit sebelum expiry asli, biar gak kepepet pas dipake.
const DRIVE_TOKEN_SAFETY_MARGIN_MS = 2 * 60 * 1000;

function cacheDriveToken(accessToken, expiresInSeconds) {
  const expiresAt = Date.now() + (expiresInSeconds * 1000);
  sessionStorage.setItem(DRIVE_TOKEN_CACHE_KEY, JSON.stringify({ accessToken, expiresAt }));
}

function getCachedDriveToken() {
  try {
    const raw = sessionStorage.getItem(DRIVE_TOKEN_CACHE_KEY);
    if (!raw) return null;
    const { accessToken, expiresAt } = JSON.parse(raw);
    if (!accessToken || !expiresAt) return null;
    if (Date.now() > expiresAt - DRIVE_TOKEN_SAFETY_MARGIN_MS) return null; // udah/hampir expired
    return accessToken;
  } catch {
    return null;
  }
}

/* Dipanggil sekali pas halaman kebuka. GIS di-load async lewat
   <script> di index.html, jadi kita nunggu sampai siap. */
function initDriveAuth() {
  if (!window.google || !google.accounts || !google.accounts.oauth2) {
    setTimeout(initDriveAuth, 300);
    return;
  }
  driveTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: DRIVE_SCOPE,
    callback: (response) => {
      if (response && response.access_token) {
        driveAccessToken = response.access_token;
        cacheDriveToken(response.access_token, response.expires_in || 3600);
        localStorage.setItem(DRIVE_CONSENT_FLAG, '1');
        document.getElementById('driveLoginBtn').textContent = 'Login ulang Google Drive';
        setDriveStatus('Berhasil login — nomor otomatis diambil dari Google Drive.');
        if (!manualFlags.nomor) {
          buildDefaultNomorAsync(getMode()).then(result => {
            document.getElementById('nomor').value = result.value;
            setNomorHint(result.fromDrive ? 'Nomor diperbarui dari Google Drive.' : '');
          });
        }
      } else {
        setDriveStatus('Login dibatalkan atau gagal.');
      }
    },
    error_callback: () => {
      // Silent re-auth gagal (misal sesi Google di browser udah abis
      // atau akses dicabut) — diemin aja, tombol login manual tetap ada.
      setDriveStatus('Sesi Google udah abis, klik "Login Google Drive" buat login lagi.');
    },
  });

  // 1) Kalau ada token yang masih valid di sessionStorage (dari refresh
  //    sebelumnya di tab yang sama), langsung pakai itu — TANPA popup
  //    sama sekali.
  const cachedToken = getCachedDriveToken();
  if (cachedToken) {
    driveAccessToken = cachedToken;
    document.getElementById('driveLoginBtn').textContent = 'Login ulang Google Drive';
    setDriveStatus('Sesi Google Drive masih aktif.');
    return;
  }

  // 2) Kalau nggak ada token valid di cache, tapi sebelumnya pernah
  //    consent, baru coba silent re-auth (yang mungkin kedip sebentar).
  if (localStorage.getItem(DRIVE_CONSENT_FLAG) === '1') {
    setDriveStatus('Login otomatis...');
    driveTokenClient.requestAccessToken({ prompt: '' });
  }
}

function requestDriveLogin() {
  if (!driveTokenClient) {
    setDriveStatus('Google auth belum siap, tunggu sebentar lalu klik lagi.');
    return;
  }
  driveTokenClient.requestAccessToken({ prompt: driveAccessToken ? '' : 'consent' });
}

/* Scan satu folder Drive, cari angka terbesar di depan nama file
   (persis logic get_max_number_in_folder di server.py versi lama). */
async function getMaxNumberFromDrive(folderId) {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(name)&pageSize=1000`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${driveAccessToken}` },
  });
  if (res.status === 401) {
    driveAccessToken = null;
    sessionStorage.removeItem(DRIVE_TOKEN_CACHE_KEY);
    document.getElementById('driveLoginBtn').textContent = 'Login Google Drive';
    throw new Error('Login Drive kedaluwarsa, klik tombol Login lagi');
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  const numbers = (data.files || [])
    .filter(f => {
      if (!f.name || f.name.startsWith('~$')) return false;
      const ext = f.name.includes('.') ? f.name.toLowerCase().split('.').pop() : '';
      return DRIVE_VALID_EXTENSIONS.includes(ext);
    })
    .map(f => {
      const m = DRIVE_NUMBER_PATTERN.exec(f.name.trim());
      return m ? parseInt(m[1], 10) : null;
    })
    .filter(n => n !== null);
  return numbers.length ? Math.max(...numbers) : 0;
}


/* Ambil nomor lanjutan otomatis: coba Google Drive dulu (kalau udah
   login), fallback ke server lokal lama (server.py, buat yang masih
   pakai cara lama), fallback terakhir ke default statis — form tetap
   bisa dipakai manual kalau semua gagal. */
async function fetchNextNomorNumber(mode) {
  const width = mode.defaultNomorNumber.length;

  if (driveAccessToken) {
    try {
      const folderId = FOLDER_IDS[mode.entitas] && FOLDER_IDS[mode.entitas][mode.jenis];
      if (!folderId) throw new Error('Folder ID belum diatur untuk kombinasi ini');
      const maxNumber = await getMaxNumberFromDrive(folderId);
      return { number: String(maxNumber + 1).padStart(width, '0'), error: null, source: 'drive' };
    } catch (err) {
      setDriveStatus(err.message || String(err));
      // lanjut coba fallback ke server lokal di bawah
    }
  }

  try {
    const res = await fetch(`/api/nomor-terakhir?entitas=${mode.entitas}&jenis=${mode.jenis}`);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error((data && data.error) || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return { number: String(data.next_number).padStart(width, '0'), error: null, source: 'local-server' };
  } catch (err) {
    return { number: null, error: err.message || String(err), source: null };
  }
}

function buildDefaultNomor(mode) {
  const { romawi, tahun } = currentRomawiYear();
  return `${mode.defaultNomorNumber}/${mode.nomorPrefix}/${romawi}/${tahun}`;
}

/* Versi async: coba ambil nomor lanjutan dari server dulu, fallback
   ke buildDefaultNomor() statis kalau server gak bisa diakses. */
async function buildDefaultNomorAsync(mode) {
  const { romawi, tahun } = currentRomawiYear();
  const { number, error, source } = await fetchNextNomorNumber(mode);
  const nomorNumber = number || mode.defaultNomorNumber;
  return {
    value: `${nomorNumber}/${mode.nomorPrefix}/${romawi}/${tahun}`,
    fromServer: !!number,
    fromDrive: source === 'drive',
    error,
  };
}

function updateNomorFromTanggal() {
  const iso = document.getElementById('tanggal').value;
  if (!iso) return;
  const d = parseIsoDate(iso);
  const romawi = ROMAWI[d.getMonth()];
  const tahun = String(d.getFullYear());
  const nomorEl = document.getElementById('nomor');
  const parts = nomorEl.value.split('/');
  if (parts.length >= 2) {
    parts[parts.length - 2] = romawi;
    parts[parts.length - 1] = tahun;
    nomorEl.value = parts.join('/');
  }
}

function setNomorHint(text) {
  const el = document.getElementById('nomorRefreshHint');
  if (el) el.textContent = text || '';
}

/* ===================== Item rows ===================== */
let rowCounter = 0;

function addItemRow(prefill) {
  rowCounter++;
  const tbody = document.getElementById('itemsBody');
  const tr = document.createElement('tr');
  tr.dataset.rowId = rowCounter;
  tr.innerHTML = `
    <td class="col-no">${tbody.children.length + 1}</td>
    <td><input type="text" class="f-uraian" placeholder="Nama barang / jasa"></td>
    <td class="col-qty"><input type="number" class="f-qty" min="0" value="1" step="any"></td>
    <td class="col-harga"><input type="text" class="f-harga" placeholder="0" value=""></td>
    <td class="col-jumlah f-jumlah">0</td>
    <td class="col-del"><button type="button" class="del-btn" title="Hapus baris">&times;</button></td>
  `;
  tbody.appendChild(tr);

  if (prefill) {
    tr.querySelector('.f-uraian').value = prefill.uraian || '';
    tr.querySelector('.f-qty').value = prefill.qty != null ? prefill.qty : 1;
    tr.querySelector('.f-harga').value = prefill.harga != null ? formatRibuan(String(Math.round(prefill.harga))) : '';
  }

  attachThousandsMask(tr.querySelector('.f-harga'), recalc);
  tr.querySelector('.f-uraian').addEventListener('input', recalc);
  tr.querySelector('.f-qty').addEventListener('input', recalc);
  tr.querySelector('.del-btn').addEventListener('click', () => {
    if (tbody.children.length <= 1) return; // minimal 1 baris
    tr.remove();
    renumberRows();
    recalc();
  });

  renumberRows();
  recalc();
}

function renumberRows() {
  document.querySelectorAll('#itemsBody tr').forEach((r, i) => {
    r.querySelector('.col-no').textContent = i + 1;
  });
}

function collectItems() {
  const rows = document.querySelectorAll('#itemsBody tr');
  const items = [];
  rows.forEach(r => {
    const uraian = r.querySelector('.f-uraian').value.trim();
    const qty = parseFloat(r.querySelector('.f-qty').value) || 0;
    const harga = parseRibuan(r.querySelector('.f-harga').value);
    if (uraian || qty || harga) items.push({ uraian, qty, harga });
  });
  return items;
}

/* ===================== Recalculate summary ===================== */
function recalc() {
  const mode = getMode();
  let subtotal = 0;
  document.querySelectorAll('#itemsBody tr').forEach(r => {
    const qty = parseFloat(r.querySelector('.f-qty').value) || 0;
    const harga = parseRibuan(r.querySelector('.f-harga').value);
    const jumlah = qty * harga;
    r.querySelector('.f-jumlah').textContent = formatAngka(jumlah);
    subtotal += jumlah;
  });

  const diskonType = document.getElementById('diskonType').value;
  const diskonInput = diskonType === 'percent'
    ? (parseFloat(document.getElementById('diskon').value) || 0)
    : parseRibuan(document.getElementById('diskon').value);
  const diskonNominal = diskonType === 'percent' ? subtotal * diskonInput / 100 : diskonInput;
  const afterDiskon = subtotal - diskonNominal;

  const ppnPercent = parseFloat(document.getElementById('ppn').value) || 0;
  const ppnNominal = ppnPercent > 0 ? afterDiskon * ppnPercent / 100 : 0;
  const grandTotal = afterDiskon + ppnNominal;

  document.getElementById('sumSubtotal').textContent = formatAngka(subtotal);
  document.getElementById('sumDiskon').textContent = formatAngka(diskonNominal);
  document.getElementById('sumPpn').textContent = formatAngka(ppnNominal);
  document.getElementById('sumGrandtotal').textContent = formatAngka(grandTotal);
  document.getElementById('sumPpnLabel').textContent = ppnPercent > 0 ? mode.ppnLabelFormat(ppnPercent) : 'PPN';

  document.getElementById('rowDiskon').style.display = diskonNominal > 0 ? 'flex' : 'none';
  document.getElementById('rowSubtotal').style.display = ppnPercent > 0 ? 'flex' : 'none';
  document.getElementById('rowPpn').style.display = ppnPercent > 0 ? 'flex' : 'none';

  document.getElementById('terbilangBox').textContent = terbilangRupiah(grandTotal);
  updateFilenamePreview();

  return { subtotal, diskonNominal, ppnPercent, ppnNominal, grandTotal };
}

/* ===================== File name ===================== */
function buildFileName() {
  const mode = getMode();
  const nomor = document.getElementById('nomor').value || '';
  const prefix = (nomor.split('/')[0] || '').trim() || 'XXX';
  const sanitize = s => String(s).replace(/[\\/:*?"<>|]/g, '').trim();
  const namaClient = document.getElementById('namaClient').value || 'Client';
  let perihal = document.getElementById('perihal').value || 'Penawaran';
  perihal = perihal.replace(/\bsurat\b/gi, '').replace(/\s+/g, ' ').trim() || 'Penawaran';
  const poNo = document.getElementById('poNo').value.trim() || mode.poNoDefault || '-';
  return mode.buildFileName({
    prefix: sanitize(prefix),
    namaClientUpper: sanitize(namaClient.toUpperCase()),
    perihalUpper: sanitize(perihal.toUpperCase()),
    poNoUpper: sanitize(poNo.toUpperCase()),
  });
}

function updateFilenamePreview() {
  document.getElementById('filenamePreview').textContent = 'Nama file: ' + buildFileName();
}

/* ===================== Cari & hapus/replace baris <w:tr> berdasarkan anchor ===================== */
function findRow(xml, anchorToken) {
  const idx = xml.indexOf(anchorToken);
  if (idx === -1) return null;
  const trStart = xml.lastIndexOf('<w:tr ', idx);
  const trEnd = xml.indexOf('</w:tr>', idx) + '</w:tr>'.length;
  if (trStart === -1 || trEnd === -1) return null;
  return { trStart, trEnd, template: xml.slice(trStart, trEnd) };
}

function removeRowByAnchor(xml, anchorToken) {
  const row = findRow(xml, anchorToken);
  if (!row) return xml;
  return xml.slice(0, row.trStart) + xml.slice(row.trEnd);
}

/* ===================== Cari & hapus/replace paragraf <w:p> berdasarkan anchor ===================== */
/* Versi paralel dari findRow/removeRowByAnchor, tapi levelnya paragraf
   (dipakai buat section Keterangan yang isinya paragraf bullet, bukan
   baris tabel). */
function findParagraph(xml, anchorToken) {
  const idx = xml.indexOf(anchorToken);
  if (idx === -1) return null;
  // paragraf bisa <w:p ...> (ada atribut) atau <w:p> polos, coba dua-duanya
  let pStart = xml.lastIndexOf('<w:p ', idx);
  const pStartBare = xml.lastIndexOf('<w:p>', idx);
  if (pStartBare > pStart) pStart = pStartBare;
  const pEnd = xml.indexOf('</w:p>', idx) + '</w:p>'.length;
  if (pStart === -1 || pEnd === -1) return null;
  return { pStart, pEnd, template: xml.slice(pStart, pEnd) };
}

function removeParagraphByAnchor(xml, anchorToken) {
  const p = findParagraph(xml, anchorToken);
  if (!p) return xml;
  return xml.slice(0, p.pStart) + xml.slice(p.pEnd);
}

/* ===================== Cari <w:r>...</w:r> TERLUAR yang membungkus 1 posisi ===================== */
/* Kenapa perlu ini (bukan cuma lastIndexOf('<w:drawing>')/indexOf('</w:r>')
   naif): Word sering nyimpen 1 text box / gambar sebagai
   <w:r><mc:AlternateContent><mc:Choice>...<w:drawing>...</w:drawing>...</mc:Choice>
   <mc:Fallback>...<w:pict>...</w:pict>...</mc:Fallback></mc:AlternateContent></w:r>
   — dan DI DALAM Choice maupun Fallback itu ada lagi <w:r>...</w:r> bersarang
   (isi txbxContent-nya, dipakai Word buat kompatibilitas versi lama). Kalau
   cari "</w:r>" pertama setelah drawing/pict ditutup, yang ketemu adalah
   penutup run BERSARANG itu, bukan run pembungkus asli — hasil potongannya
   jadi XML yang rusak/tidak balance. Fungsi ini menghitung pasangan
   buka-tutup <w:r> yang benar biar dapat run TERLUAR yang sesungguhnya. */
function findEnclosingRun(xml, pos) {
  const tagRe = /<w:r\b[^>]*>|<\/w:r>/g;
  const stack = [];
  let m;
  let enclosing = null;
  while ((m = tagRe.exec(xml))) {
    if (m[0] === '</w:r>') {
      const start = stack.pop();
      if (start !== undefined) {
        const end = m.index + m[0].length;
        if (start <= pos && pos <= end) {
          // overwrite terus; run yang paling akhir ditemukan mengandung pos
          // adalah run TERLUAR (run bersarang selalu menutup lebih dulu).
          enclosing = { start, end };
        }
      }
    } else {
      stack.push(m.index);
    }
  }
  return enclosing;
}

function removeEnclosingRun(xml, anchorToken) {
  const idx = xml.indexOf(anchorToken);
  if (idx === -1) return xml;
  const run = findEnclosingRun(xml, idx);
  if (!run) return xml;
  return xml.slice(0, run.start) + xml.slice(run.end);
}

/* ===================== Toggle tanda tangan (hapus gambar, bukan teks) ===================== */
/* Gambar tanda tangan+stempel asli gak (dan gak perlu) dikasih placeholder
   teks sendiri — jadi dicari lewat teknik anchor posisi: <w:drawing>
   TERDEKAT SEBELUM {{NAMA_TTD}}. Nama & kontak penandatangan (teks) tetap
   utuh karena yang dihapus cuma <w:r> pembungkus drawing-nya, bukan
   paragraf {{NAMA_TTD}}/{{KONTAK_TTD}} itu sendiri. */
function removeSignatureImage(xml) {
  const idxNama = xml.indexOf('{{NAMA_TTD}}');
  if (idxNama === -1) return xml;
  const drawIdx = xml.lastIndexOf('<w:drawing>', idxNama);
  if (drawIdx === -1) return xml;
  const run = findEnclosingRun(xml, drawIdx);
  if (!run) return xml;
  return xml.slice(0, run.start) + xml.slice(run.end);
}

/* ===================== Generate DOCX ===================== */
function setStatus(msg, kind) {
  const el = document.getElementById('statusMsg');
  el.textContent = msg || '';
  el.className = 'status-msg' + (kind ? ' ' + kind : '');
}

async function buildDocxBlob() {
  const mode = getMode();
  const items = collectItems();
  if (items.length === 0) {
    throw new Error('Tambahkan minimal 1 item sebelum download.');
  }

  const templateB64 = mode.templateVar();
  if (!templateB64) {
    throw new Error(`Template belum diisi. Isi base64 di templates/${fileForMode(mode)} pada variabel ${mode.templateVarName}.`);
  }

  const zip = await JSZip.loadAsync(b64ToArrayBuffer(templateB64));
  let xml = await zip.file('word/document.xml').async('string');

  /* ---- 1. Clone baris item, anchor {{NO}} ---- */
  const idxNo = xml.indexOf('{{NO}}');
  const trStart = xml.lastIndexOf('<w:tr ', idxNo);
  const trEnd = xml.indexOf('</w:tr>', idxNo) + '</w:tr>'.length;
  const rowTemplate = xml.slice(trStart, trEnd);

  let rowsXml = '';
  let subtotal = 0;
  items.forEach((item, i) => {
    const jumlah = item.qty * item.harga;
    subtotal += jumlah;
    let row = rowTemplate;
    row = row.split('{{NO}}').join(i + 1);
    row = row.split(`{{${mode.itemNameToken}}}`).join(escapeXml(item.uraian || '-'));
    row = row.split(`{{${mode.itemQtyToken}}}`).join(escapeXml(String(item.qty)));
    row = row.split('{{HARGA}}').join(escapeXml(formatAngka(item.harga)));
    row = row.split('{{JUMLAH}}').join(escapeXml(formatAngka(jumlah)));
    rowsXml += row;
  });
  xml = xml.slice(0, trStart) + rowsXml + xml.slice(trEnd);

  /* ---- 2. Hitung diskon & PPN ---- */
  const diskonType = document.getElementById('diskonType').value;
  const diskonInput = diskonType === 'percent'
    ? (parseFloat(document.getElementById('diskon').value) || 0)
    : parseRibuan(document.getElementById('diskon').value);
  const diskonNominal = diskonType === 'percent' ? subtotal * diskonInput / 100 : diskonInput;
  const afterDiskon = subtotal - diskonNominal;
  const ppnPercent = parseFloat(document.getElementById('ppn').value) || 0;

  /* ---- 3. Baris DISKON ---- */
  if (mode.diskonStrategy === 'clone') {
    // Baris DISKON tidak ada di template; di-clone dari baris PPN (hanya kalau nominal > 0)
    if (diskonNominal > 0) {
      const ppnRow = findRow(xml, '{{PPN_LABEL}}');
      if (ppnRow) {
        const diskonRow = ppnRow.template
          .split('{{PPN_LABEL}}').join('DISKON')
          .split('{{PPN}}').join(escapeXml(formatAngka(diskonNominal)));
        xml = xml.slice(0, ppnRow.trStart) + diskonRow + xml.slice(ppnRow.trStart);
      }
    }
  } else {
    // Baris DISKON sudah ada sebagai placeholder {{DISKON}} sendiri di template
    if (diskonNominal === 0) {
      xml = removeRowByAnchor(xml, '{{DISKON}}');
    } else {
      xml = xml.split('{{DISKON}}').join(escapeXml(formatAngka(diskonNominal)));
    }
  }

  /* ---- 4. PPN <= 0 => hapus baris SUB TOTAL & PPN; else isi ---- */
  let ppnNominal = 0;
  let grandTotal;
  if (ppnPercent > 0) {
    ppnNominal = afterDiskon * ppnPercent / 100;
    grandTotal = afterDiskon + ppnNominal;
    xml = xml.split('{{SUBTOTAL}}').join(escapeXml(formatAngka(subtotal)));
    xml = xml.split('{{PPN_LABEL}}').join(escapeXml(mode.ppnLabelFormat(ppnPercent)));
    xml = xml.split('{{PPN}}').join(escapeXml(formatAngka(ppnNominal)));
  } else {
    grandTotal = afterDiskon;
    xml = removeRowByAnchor(xml, '{{SUBTOTAL}}');
    // anchor PPN row: coba {{PPN_LABEL}} dulu, fallback ke {{PPN}}
    xml = xml.indexOf('{{PPN_LABEL}}') !== -1
      ? removeRowByAnchor(xml, '{{PPN_LABEL}}')
      : removeRowByAnchor(xml, '{{PPN}}');
  }

  xml = xml.split('{{GRANDTOTAL}}').join(escapeXml(formatAngka(grandTotal)));

  /* ---- 5. Section Keterangan & toggle Tanpa Tanda Tangan ---- */
  // PENTING: blok ini HARUS jalan SEBELUM replacement skalar {{NAMA_TTD}}
  // di bawah, karena removeSignatureImage() nyari gambar tanda tangan
  // lewat anchor posisi "<w:drawing> terdekat sebelum {{NAMA_TTD}}" —
  // kalau placeholder itu sudah ditimpa jadi nama beneran duluan, anchornya
  // hilang dan toggle-nya jadi no-op (gambar gak pernah kehapus).

  // Selalu bersihkan dulu paragraf {{TTD_IMG}} peninggalan percobaan lama
  // yang gak nyambung ke gambar tanda tangan manapun — aman dipanggil
  // walau tag-nya gak ada di template tertentu (no-op kalau tidak ketemu).
  xml = removeParagraphByAnchor(xml, '{{TTD_IMG}}');

  const keteranganLines = document.getElementById('keterangan').value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (keteranganLines.length === 0) {
    // Semua baris kosong -> hapus SELURUH text box Keterangan (termasuk
    // kedua salinan Choice/Fallback kalau Word bikin AlternateContent),
    // pakai findEnclosingRun biar gak kepotong di run bersarang.
    xml = removeEnclosingRun(xml, '{{KETERANGAN_ITEM}}');
  } else {
    // Ada isi -> clone paragraf bullet per baris keterangan, buang
    // <w:vanish/> dari hasil clone. Diulang selama anchor masih ketemu,
    // karena bisa ada 2 salinan (Choice + Fallback) yang keduanya perlu
    // diisi konsisten.
    while (xml.indexOf('{{KETERANGAN_ITEM}}') !== -1) {
      const para = findParagraph(xml, '{{KETERANGAN_ITEM}}');
      if (!para) break;
      let itemsXml = '';
      keteranganLines.forEach(line => {
        let p = para.template.replace(/<w:vanish\/>/g, ''); // buang SEMUA vanish di paragraf ini
        p = p.split('{{KETERANGAN_ITEM}}').join(escapeXml(line));
        itemsXml += p;
      });
      xml = xml.slice(0, para.pStart) + itemsXml + xml.slice(para.pEnd);
    }
  }

  // Nama & kontak penandatangan (teks) tetap muncul di kedua mode; yang
  // dihapus HANYA gambar tanda tangan+stempel, karena dokumen ini
  // rencananya mau ditandatangani basah manual.
  if (document.getElementById('signMode').value === 'nosign') {
    xml = removeSignatureImage(xml);
  }

  /* ---- 6. Replacement skalar ---- */
  const nomor = document.getElementById('nomor').value.trim() || '-';
  const namaClient = document.getElementById('namaClient').value.trim() || '-';
  const tanggalIso = document.getElementById('tanggal').value;
  const tanggalIndo = formatTanggalIndo(tanggalIso) || '-';
  const namaTtd = document.getElementById('namaTtd').value.trim() || mode.defaultNamaTtd;
  const terbilangText = terbilangRupiah(grandTotal);

  xml = xml.split('{{NOMOR}}').join(escapeXml(nomor));
  xml = xml.split('{{TANGGAL}}').join(escapeXml(tanggalIndo));
  xml = xml.split(`{{${mode.namaClientToken}}}`).join(escapeXml(namaClient));
  xml = xml.split('{{TERBILANG}}').join(escapeXml(terbilangText));
  xml = xml.split('{{NAMA_TTD}}').join(escapeXml(namaTtd));

  if (mode.hasKontakTtd) {
    const kontakTtd = document.getElementById('kontakTtd').value.trim() || mode.defaultKontakTtd;
    xml = xml.split('{{KONTAK_TTD}}').join(escapeXml(kontakTtd));
  }

  if (mode.showPoFields) {
    const poDate = document.getElementById('poDate').value.trim() || mode.poDateDefault || '-';
    const poNo = document.getElementById('poNo').value.trim() || mode.poNoDefault || '-';
    xml = xml.split(`{{${mode.poDateToken}}}`).join(escapeXml(poDate));
    xml = xml.split(`{{${mode.poNoToken}}}`).join(escapeXml(poNo));
  }

  if (mode.showPerihalLampiran) {
    const perihal = document.getElementById('perihal').value.trim() || 'Surat Penawaran';
    xml = xml.split('{{PERIHAL}}').join(escapeXml(perihal));
  }
  if (mode.showLampiran) {
    const lampiran = document.getElementById('lampiran').value.trim() || '-';
    xml = xml.split('{{LAMPIRAN}}').join(escapeXml(lampiran));
  }

  if (mode.hasAlamat) {
    const alamatClient = document.getElementById('alamatClient').value.trim() || '-';
    if (mode.alamatMultiline) {
      // Alamat multi-baris -> pecah jadi beberapa <w:t> dipisah <w:br/> dalam run yang sama
      const alamatRuns = alamatClient
        .split('\n')
        .map(line => `<w:t xml:space="preserve">${escapeXml(line)}</w:t>`)
        .join('<w:br/>');
      xml = xml.split('<w:t>{{ALAMAT_CLIENT}}</w:t>').join(alamatRuns);
      // fallback kalau template tidak membungkus persis seperti di atas
      xml = xml.split('{{ALAMAT_CLIENT}}').join(escapeXml(alamatClient));
    } else {
      xml = xml.split('{{ALAMAT_CLIENT}}').join(escapeXml(alamatClient));
    }
  }

  zip.file('word/document.xml', xml);
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });

  const fileName = buildFileName();
  return { blob, fileName };
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function generateDocx() {
  const btn = document.getElementById('generateBtn');
  try {
    btn.disabled = true;
    setStatus('Membuat dokumen...', '');
    const { blob, fileName } = await buildDocxBlob();
    downloadBlob(blob, fileName);
    setStatus(`Berhasil! File "${fileName}" sudah didownload.`, 'success');
  } catch (err) {
    console.error(err);
    setStatus('Gagal membuat dokumen: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

async function generatePdf() {
  const btn = document.getElementById('generatePdfBtn');
  try {
    btn.disabled = true;
    setStatus('Membuat dokumen & convert ke PDF...', '');
    const { blob, fileName } = await buildDocxBlob();
    const fileBase64 = await blobToBase64(blob);

    const res = await fetch('/api/convert-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, fileBase64 }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error((errData && errData.error) || `HTTP ${res.status}`);
    }
    const pdfBlob = await res.blob();
    const pdfFileName = fileName.replace(/\.docx$/i, '.pdf');
    downloadBlob(pdfBlob, pdfFileName);
    setStatus(`Berhasil! File "${pdfFileName}" sudah didownload.`, 'success');
  } catch (err) {
    console.error(err);
    setStatus('Gagal membuat PDF: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

function fileForMode(mode) {
  return `${mode.jenis === 'invoice' ? 'invoice' : 'penawaran'}-${mode.entitas}.js`;
}

/* ===================== Isi Otomatis dari Hasil AI (Gem) ===================== */
function parseGemOutput(text, mode) {
  const rawLines = String(text).split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let nomorPo = null, tanggalPo = null, namaClient = null, alamatClient = null;
  let entitas = null, diskon = null;
  let itemStartIndex = -1;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (/^NOMOR_PO\s*:/i.test(line)) {
      nomorPo = line.substring(line.indexOf(':') + 1).trim();
    } else if (/^TANGGAL_PO\s*:/i.test(line)) {
      tanggalPo = line.substring(line.indexOf(':') + 1).trim();
    } else if (/^NAMA_CLIENT\s*:/i.test(line)) {
      namaClient = line.substring(line.indexOf(':') + 1).trim();
    } else if (/^ALAMAT_CLIENT\s*:/i.test(line)) {
      alamatClient = line.substring(line.indexOf(':') + 1).trim();
    } else if (/^ENTITAS\s*:/i.test(line)) {
      entitas = line.substring(line.indexOf(':') + 1).trim();
    } else if (/^DISKON\s*:/i.test(line)) {
      diskon = line.substring(line.indexOf(':') + 1).trim();
    } else if (/^ITEM\s*:/i.test(line)) {
      itemStartIndex = i;
      break;
    }
  }

  if (!namaClient) {
    throw new Error('Baris NAMA_CLIENT tidak ditemukan atau kosong');
  }

  const items = [];
  if (itemStartIndex !== -1) {
    for (let i = itemStartIndex + 1; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (!line.includes('|')) continue;
      const parts = line.split('|').map(p => p.trim());
      if (parts.length < 4) continue;
      const nama = parts[1];
      const qty = parseFloat(String(parts[2]).replace(',', '.')) || 0;
      const harga = parseInt(String(parts[3]).replace(/\D/g, ''), 10) || 0;
      if (!nama) continue;
      items.push({ nama, qty, harga });
    }
  }

  if (items.length === 0) {
    throw new Error('Tidak ditemukan satupun baris item yang valid setelah baris "ITEM:"');
  }

  return {
    nomorPo: mode.gemMode === 'invoice' ? (nomorPo !== null ? nomorPo : '-') : null,
    tanggalPo: mode.gemMode === 'invoice' ? (tanggalPo !== null ? tanggalPo : '-') : null,
    namaClient,
    alamatClient: mode.gemMode === 'invoice' ? (alamatClient !== null ? alamatClient : '-') : null,
    entitas,
    diskon,
    items,
  };
}

function applyParsedDataToForm(parsed, mode) {
  // 1) ENTITAS dulu, SEBELUM field lain — karena switch entitas bisa
  // mengubah default2 lain (judul, nomor otomatis, dst lewat applyModeToUI).
  // Tetap bisa diubah manual lewat dropdown kapan pun setelah ini.
  let activeMode = mode;
  if (parsed.entitas) {
    const detected = parsed.entitas.trim().toUpperCase();
    if (detected === 'PT' || detected === 'CV') {
      const target = detected.toLowerCase();
      const selEntitas = document.getElementById('selEntitas');
      if (selEntitas.value !== target) {
        selEntitas.value = target;
        applyModeToUI(); // refresh judul/label/nomor-otomatis/default PPN sesuai entitas baru
        activeMode = getMode();
      }
    }
  }

  document.getElementById('namaClient').value = parsed.namaClient;

  if (activeMode.gemMode === 'invoice') {
    document.getElementById('poNo').value = parsed.nomorPo;
    manualFlags.poNo = true;
    if (parsed.tanggalPo === '-') {
      document.getElementById('poDate').value = '-';
    } else {
      const formatted = formatTanggalIndo(parsed.tanggalPo);
      document.getElementById('poDate').value = formatted || parsed.tanggalPo;
    }
    manualFlags.poDate = true;
    document.getElementById('alamatClient').value = parsed.alamatClient;
  }

  // 2) DISKON — isi sesuai deteksi AI (persen/nominal), reset ke 0 kalau
  // gak ada info diskon sama sekali biar gak nyisa nilai lama gak sengaja.
  const diskonEl = document.getElementById('diskon');
  const diskonTypeEl = document.getElementById('diskonType');
  const diskonRaw = (parsed.diskon || '').trim();
  if (diskonRaw && diskonRaw !== '-') {
    if (diskonRaw.endsWith('%')) {
      diskonTypeEl.value = 'percent';
      diskonEl.value = digitsOnlyStripLeadingZero(diskonRaw.slice(0, -1).trim()) || '0';
    } else {
      diskonTypeEl.value = 'nominal';
      diskonEl.value = formatRibuan(digitsOnlyStripLeadingZero(diskonRaw));
    }
  } else {
    diskonTypeEl.value = 'nominal';
    diskonEl.value = '0';
  }

  const itemsBody = document.getElementById('itemsBody');
  itemsBody.innerHTML = '';

  if (parsed.items.length === 0) {
    addItemRow();
  } else {
    parsed.items.forEach(item => {
      addItemRow({ uraian: item.nama, qty: item.qty, harga: item.harga });
    });
  }

  renumberRows();
  recalc();
}

/* ===================== Tema, judul, & visibilitas field per mode ===================== */
function applyModeToUI() {
  const mode = getMode();

  document.body.setAttribute('data-entity', mode.entitas);
  document.getElementById('pageTitle').textContent = mode.pageTitle;
  document.getElementById('brandMark').textContent = mode.brandMark;
  document.getElementById('brandTitle').textContent = mode.title;
  document.getElementById('brandSubtitle').textContent = mode.subtitle;
  document.getElementById('dataPanelTitle').textContent = mode.dataPanelTitle;
  document.getElementById('itemsPanelTitle').textContent = mode.itemsPanelTitle;
  document.getElementById('generateBtn').textContent = mode.generateLabel;

  document.getElementById('itemNameHeader').textContent = mode.itemNameHeader;
  document.getElementById('itemHargaHeader').textContent = mode.itemHargaHeader;

  document.getElementById('namaClientLabel').textContent = mode.namaClientLabel;
  document.getElementById('namaClient').placeholder = mode.namaClientPlaceholder;

  // Visibilitas field khusus per Jenis Surat
  document.getElementById('poFieldsRow').setAttribute('data-hide', String(!mode.showPoFields));
  document.getElementById('perihalLampiranRow').setAttribute('data-hide', String(!mode.showPerihalLampiran));
  document.getElementById('lampiranField').setAttribute('data-hide', String(!mode.showLampiran));
  document.getElementById('alamatField').setAttribute('data-hide', String(!mode.hasAlamat));
  document.getElementById('kontakTtdField').setAttribute('data-hide', String(!mode.hasKontakTtd));

  if (mode.showPoFields) {
    document.getElementById('poDateLabel').textContent = mode.poDateLabel;
    document.getElementById('poDate').placeholder = mode.poDatePlaceholder || '';
    document.getElementById('poNoLabel').textContent = mode.poNoLabel;
    document.getElementById('poNo').placeholder = mode.poNoPlaceholder || '';
    if (!manualFlags.poDate) document.getElementById('poDate').value = mode.poDateDefault || '';
    if (!manualFlags.poNo) document.getElementById('poNo').value = mode.poNoDefault || '';
  }

  // Nomor surat: default beda tergantung kombinasi jenis+entitas.
  // Isi dulu pakai default statis (instan), lalu timpa kalau server
  // lokal berhasil kasih nomor lanjutan otomatis.
  if (!manualFlags.nomor) {
    document.getElementById('nomor').value = buildDefaultNomor(mode);
    buildDefaultNomorAsync(mode).then(result => {
      if (manualFlags.nomor) return; // user keburu ngetik manual, jangan ditimpa
      document.getElementById('nomor').value = result.value;
      if (result.fromDrive) {
        setNomorHint('Nomor diambil dari Google Drive.');
      } else if (result.fromServer) {
        setNomorHint('Nomor diambil dari server lokal.');
      } else {
        setNomorHint('Belum login Google Drive, nomor diisi default.');
      }
    });
  }

  // Penandatangan: default beda tergantung kombinasi
  if (!manualFlags.namaTtd) {
    document.getElementById('namaTtd').value = mode.defaultNamaTtd;
  }
  if (mode.hasKontakTtd && !manualFlags.kontakTtd) {
    document.getElementById('kontakTtd').value = mode.defaultKontakTtd;
  }

  // PPN default beda per entitas: CV biasanya gak pakai PPN (langsung
  // grand total), PT pakai 11%. Tetap bisa diubah manual — begitu user
  // pernah ngetik manual, aturan default ini berhenti nimpa nilainya.
  if (!manualFlags.ppn) {
    document.getElementById('ppn').value = mode.entitas === 'cv' ? 0 : 11;
  }

  recalc();
}

/* ===================== Parse Gem button (event handler dipasang sekali, logic-nya cek mode aktif) ===================== */
/* ===================== Manajemen file upload (multi-file, bisa dihapus tanpa refresh) ===================== */
let selectedGemFiles = []; // array of File

function renderGemFileList() {
  const listEl = document.getElementById('gemFileList');
  const emptyHint = document.getElementById('gemFileEmptyHint');
  const clearAllBtn = document.getElementById('gemFileClearAll');

  listEl.innerHTML = '';
  if (selectedGemFiles.length === 0) {
    emptyHint.style.display = '';
    clearAllBtn.style.display = 'none';
    return;
  }

  emptyHint.style.display = 'none';
  clearAllBtn.style.display = selectedGemFiles.length > 1 ? '' : 'none';

  selectedGemFiles.forEach((file, idx) => {
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = file.name;
    nameSpan.title = file.name;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'file-remove-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.title = 'Hapus file ini';
    removeBtn.addEventListener('click', () => {
      selectedGemFiles.splice(idx, 1);
      renderGemFileList();
    });
    li.appendChild(nameSpan);
    li.appendChild(removeBtn);
    listEl.appendChild(li);
  });
}

/* Nangkep gambar yang di-paste (Ctrl+V) langsung di textarea chat —
   misal screenshot WA yang di-copy — biar gak perlu download-upload
   manual. Teks yang di-paste tetep jalan normal seperti biasa. */
function setupGemPasteImage() {
  const textarea = document.getElementById('gemInput');
  textarea.addEventListener('paste', (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;

    let imageCount = 0;
    Array.from(items).forEach((item, idx) => {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) return;
        const ext = (item.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
        const named = new File(
          [file],
          `paste-${Date.now()}-${idx}.${ext}`,
          { type: item.type }
        );
        selectedGemFiles.push(named);
        imageCount++;
      }
    });

    if (imageCount > 0) {
      e.preventDefault(); // gambar gak usah nyoba ke-insert sbg teks
      renderGemFileList();
      const statusEl = document.getElementById('gemStatusMsg');
      statusEl.className = 'status-msg success';
      statusEl.textContent = imageCount > 1
        ? `${imageCount} gambar dari clipboard ditambahin ke daftar file.`
        : 'Gambar dari clipboard ditambahin ke daftar file.';
    }
    // Kalau yang di-paste teks biasa, dibiarin jalan normal (gak di-preventDefault).
  });
}

function setupGemFileInput() {
  const fileInput = document.getElementById('gemFile');
  fileInput.addEventListener('change', () => {
    // Gabungin file baru ke daftar yang udah ada (biar "Pilih File" lagi
    // nambah, bukan nimpa), lalu reset value input biar bisa milih file
    // yang sama lagi kalau perlu & event "change" tetep kepicu.
    Array.from(fileInput.files).forEach(f => selectedGemFiles.push(f));
    fileInput.value = '';
    renderGemFileList();
  });

  document.getElementById('gemFileClearAll').addEventListener('click', () => {
    selectedGemFiles = [];
    renderGemFileList();
  });

  renderGemFileList();
}

function runParseAndFill(rawText, mode, statusEl) {
  const parsed = parseGemOutput(rawText, mode);
  applyParsedDataToForm(parsed, mode);
  statusEl.className = 'status-msg success';
  const extra = mode.gemMode === 'invoice'
    ? `${parsed.items.length} item terisi otomatis ke form.`
    : `Nama client dan ${parsed.items.length} item terisi otomatis. Cek/isi Nomor Surat, Tanggal, Perihal${mode.showLampiran ? ', Lampiran' : ''} secara manual.`;
  statusEl.textContent = `Berhasil! ${extra}`;
}

function setupGemParser() {
  // --- Tombol lama: paste manual hasil dari Gem (fallback) ---
  document.getElementById('btnParseGemManual').addEventListener('click', () => {
    const mode = getMode();
    const rawText = document.getElementById('gemManualInput').value;
    const statusEl = document.getElementById('gemManualStatusMsg');

    if (!rawText || !rawText.trim()) {
      statusEl.className = 'status-msg error';
      statusEl.textContent = 'Kolom masih kosong, tempel hasil dari AI terlebih dahulu.';
      return;
    }
    try {
      runParseAndFill(rawText, mode, statusEl);
    } catch (err) {
      statusEl.className = 'status-msg error';
      statusEl.textContent = 'Gagal parsing: ' + err.message + ' — pastikan format teks sesuai.';
      console.error(err);
    }
  });

  // --- Tombol baru: upload dokumen/chat -> Gemini API -> auto isi form ---
  document.getElementById('btnParseGem').addEventListener('click', async () => {
    const mode = getMode();
    const btn = document.getElementById('btnParseGem');
    const statusEl = document.getElementById('gemStatusMsg');
    const chatText = document.getElementById('gemInput').value.trim();

    if (selectedGemFiles.length === 0 && !chatText) {
      statusEl.className = 'status-msg error';
      statusEl.textContent = 'Upload dokumen atau tempel chat dulu, minimal salah satu.';
      return;
    }

    btn.disabled = true;
    statusEl.className = 'status-msg';
    statusEl.textContent = selectedGemFiles.length > 1
      ? `Mengekstrak ${selectedGemFiles.length} file lewat AI...`
      : 'Mengekstrak lewat AI...';

    try {
      const payload = { chatText: chatText || undefined };
      if (selectedGemFiles.length > 0) {
        payload.files = await Promise.all(selectedGemFiles.map(async f => ({
          fileBase64: await blobToBase64(f),
          mimeType: f.type || 'application/octet-stream',
        })));
      }

      const res = await fetch('/api/parse-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || `HTTP ${res.status}`);
      }

      const extractedText = (data && data.text) || '';

      // Kalau AI balas pesan penolakan (dokumen gak kebaca / gak ada
      // permintaan item), tampilin apa adanya, jangan dipaksa di-parse.
      if (!/NAMA_CLIENT\s*:/i.test(extractedText)) {
        statusEl.className = 'status-msg error';
        statusEl.textContent = extractedText || 'AI tidak mengembalikan data yang bisa diproses.';
        return;
      }

      runParseAndFill(extractedText, mode, statusEl);
    } catch (err) {
      statusEl.className = 'status-msg error';
      statusEl.textContent = 'Gagal ekstrak otomatis: ' + err.message;
      console.error(err);
    } finally {
      btn.disabled = false;
    }
  });
}

/* ===================== Init ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const tanggalEl = document.getElementById('tanggal');
  tanggalEl.value = todayIsoLocal();

  markManual('nomor', 'nomor');
  markManual('namaTtd', 'namaTtd');
  markManual('kontakTtd', 'kontakTtd');
  markManual('poDate', 'poDate');
  markManual('poNo', 'poNo');
  markManual('ppn', 'ppn');

  document.getElementById('selJenis').addEventListener('change', applyModeToUI);
  document.getElementById('selEntitas').addEventListener('change', applyModeToUI);

  tanggalEl.addEventListener('change', updateNomorFromTanggal);

  const diskonEl = document.getElementById('diskon');
  diskonEl.addEventListener('input', () => {
    const type = document.getElementById('diskonType').value;
    const cursorFromEnd = diskonEl.value.length - diskonEl.selectionStart;
    const digits = digitsOnlyStripLeadingZero(diskonEl.value);
    const formatted = type === 'nominal' ? formatRibuan(digits) : digits;
    diskonEl.value = formatted;
    const pos = Math.max(0, formatted.length - cursorFromEnd);
    diskonEl.setSelectionRange(pos, pos);
    recalc();
  });
  document.getElementById('diskonType').addEventListener('change', () => {
    const type = document.getElementById('diskonType').value;
    const el = document.getElementById('diskon');
    const digits = digitsOnlyStripLeadingZero(el.value);
    el.value = type === 'nominal' ? formatRibuan(digits) : digits;
    recalc();
  });
  document.getElementById('ppn').addEventListener('input', recalc);
  document.getElementById('namaClient').addEventListener('input', updateFilenamePreview);
  document.getElementById('perihal').addEventListener('input', updateFilenamePreview);
  document.getElementById('poNo').addEventListener('input', updateFilenamePreview);

  document.getElementById('addRowBtn').addEventListener('click', () => addItemRow());
  document.getElementById('generateBtn').addEventListener('click', generateDocx);
  document.getElementById('generatePdfBtn').addEventListener('click', generatePdf);

  document.getElementById('refreshNomorBtn').addEventListener('click', async () => {
    const btn = document.getElementById('refreshNomorBtn');
    const mode = getMode();
    btn.disabled = true;
    setNomorHint('Mengambil nomor lanjutan...');
    const result = await buildDefaultNomorAsync(mode);
    document.getElementById('nomor').value = result.value;
    if (result.fromDrive) {
      setNomorHint('Nomor diperbarui dari Google Drive.');
    } else if (result.fromServer) {
      setNomorHint('Nomor diperbarui dari server lokal.');
    } else {
      setNomorHint(`Gagal ambil nomor otomatis (${result.error}). Klik "Login Google Drive" dulu kalau belum.`);
    }
    btn.disabled = false;
  });

  setupGemFileInput();
  setupGemPasteImage();
  setupGemParser();

  initDriveAuth();
  document.getElementById('driveLoginBtn').addEventListener('click', requestDriveLogin);

  updateNomorFromTanggal();
  addItemRow();
  applyModeToUI();
});

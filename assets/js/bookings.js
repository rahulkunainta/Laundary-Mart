// bookings.js — Customer Orders dashboard
// Reads from localStorage('lm_bookings'), renders table, provides search/sort/delete/export.

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'lm_bookings';

  // DOM refs
  const tableBody = document.querySelector('#bookingsTable tbody');
  const emptyState = document.getElementById('emptyState');
  const totalCountEl = document.getElementById('totalCount');
  const totalRevenueEl = document.getElementById('totalRevenue');
  const uniqueCustomersEl = document.getElementById('uniqueCustomers');
  const latestBookingEl = document.getElementById('latestBooking');

  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const exportBtn = document.getElementById('exportBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Modal
  const detailModal = document.getElementById('detailModal');
  const modalClose = document.getElementById('modalClose');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const detailContent = document.getElementById('detailContent');
  const modalDeleteBtn = document.getElementById('modalDelete');

  // state
  let bookings = [];
  let filtered = [];
  let activeBookingId = null;

  // load bookings from localStorage
  function loadBookings() {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    try {
      bookings = JSON.parse(raw) || [];
    } catch (err) {
      console.error('Failed parse bookings', err);
      bookings = [];
    }
    // normalize: ensure total field exists
    bookings = bookings.map(b => {
      if (typeof b.total === 'undefined') b.total = b.subtotal || 0;
      return b;
    });
  }

  // utilities
  function formatINR(v) {
    return `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
  function safe(text){
    return String(text ?? '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // render stats
  function renderStats() {
    totalCountEl.innerText = bookings.length;
    const revenue = bookings.reduce((s,b)=> s + (Number(b.total) || 0), 0);
    totalRevenueEl.innerText = formatINR(revenue);
    const unique = new Set(bookings.map(b => (b.customer?.phone) || (b.customer?.email) || b.id)).size;
    uniqueCustomersEl.innerText = unique;
    latestBookingEl.innerText = bookings.length ? bookings[bookings.length - 1].id : '—';
  }

  // apply search + sort
  function applyFilters() {
    const q = (searchInput.value || '').trim().toLowerCase();
    filtered = bookings.filter(b => {
      if (!q) return true;
      const fields = [
        b.id,
        b.customer?.name,
        b.customer?.phone,
        b.customer?.email,
        b.items?.map(i=> i.name).join(' '),
        b.items?.map(i=> i.cloth).join(' ')
      ].join(' ').toLowerCase();
      return fields.includes(q);
    });

    const mode = sortSelect.value;
    if (mode === 'newest') filtered.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    else if (mode === 'oldest') filtered.sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt));
    else if (mode === 'amount-desc') filtered.sort((a,b)=> (b.total || 0) - (a.total || 0));
    else if (mode === 'amount-asc') filtered.sort((a,b)=> (a.total || 0) - (b.total || 0));
  }

  // render table
  function renderTable() {
    tableBody.innerHTML = '';
    if (!filtered.length) {
      emptyState.hidden = false;
      return;
    } else {
      emptyState.hidden = true;
    }

    filtered.forEach(b => {
      const tr = document.createElement('tr');
      const servicesCount = (b.items || []).length;
      const pickupText = b.customer?.date ? `${safe(b.customer.date)} ${safe(b.customer.time||'')}` : '—';

      tr.innerHTML = `
        <td><code>${safe(b.id)}</code></td>
        <td>${safe(b.customer?.name || '—')}</td>
        <td>${safe(b.customer?.phone || b.customer?.email || '—')}</td>
        <td>${servicesCount}</td>
        <td>${pickupText}</td>
        <td>${formatINR(b.total||0)}</td>
        <td class="actions">
          <button class="small-btn view" data-id="${b.id}">View</button>
          <button class="small-btn danger" data-id="${b.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll('button.view').forEach(btn =>
      btn.addEventListener('click', (e)=> openDetailModal(e.currentTarget.dataset.id))
    );

    tableBody.querySelectorAll('button.danger').forEach(btn =>
      btn.addEventListener('click', (e)=> {
        const id = e.currentTarget.dataset.id;
        if (confirm('Delete booking ' + id + ' ?')) deleteBooking(id);
      })
    );
  }

  // modal
  function openDetailModal(id) {
    activeBookingId = id;
    const b = bookings.find(x => x.id === id);
    if (!b) return;

    detailContent.innerHTML = buildDetailHtml(b);
    detailModal.style.display = "flex";
    detailModal.setAttribute("aria-hidden", "false");
  }

  function closeDetailModal() {
    activeBookingId = null;
    detailModal.style.display = "none";
    detailModal.setAttribute("aria-hidden", "true");
  }

  function buildDetailHtml(b) {
    const cust = b.customer || {};
    const itemsHtml = (b.items || [])
      .map(it => `<li>${safe(it.name)} — ${safe(it.cloth)} × ${it.qty} — ${formatINR(it.lineTotal)}</li>`)
      .join('');

    return `
      <div class="kv"><strong>ID:</strong> <span>${safe(b.id)}</span></div>
      <div class="kv"><strong>Created:</strong> <span>${new Date(b.createdAt).toLocaleString()}</span></div>

      <div class="kv"><strong>Name:</strong> <span>${safe(cust.name)}</span></div>
      <div class="kv"><strong>Phone:</strong> <span>${safe(cust.phone)}</span></div>
      <div class="kv"><strong>Email:</strong> <span>${safe(cust.email)}</span></div>

      <div class="kv"><strong>Address:</strong> <span>${safe(cust.address)}</span></div>

      <div class="kv"><strong>Pickup:</strong> <span>${safe(cust.date)} ${safe(cust.time||'')}</span></div>
      <div class="kv"><strong>Notes:</strong> <span>${safe(cust.note)}</span></div>

      <h4 style="margin-top:12px;">Items</h4>
      <ul>${itemsHtml}</ul>

      <div class="kv"><strong>Subtotal:</strong> <span>${formatINR(b.subtotal||0)}</span></div>
      <div class="kv"><strong>Total:</strong> <span>${formatINR(b.total||0)}</span></div>
    `;
  }

  // delete
  function deleteBooking(id) {
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) return;
    bookings.splice(idx,1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    refresh();
  }

  // clear all
  function clearAllBookings() {
    if (!confirm("Clear ALL bookings? Cannot be undone.")) return;
    localStorage.removeItem(STORAGE_KEY);
    bookings = [];
    refresh();
  }

  // export CSV
  function exportCSV() {
    if (!bookings.length) return alert("No bookings available.");

    const headers = [
      "id","createdAt","name","email","phone","address","date","time","items","subtotal","total","note"
    ];

    const rows = bookings.map(b => {
      const cust = b.customer || {};
      const itemsTxt = (b.items || [])
        .map(i => `${i.name} (${i.cloth}) x${i.qty} = ₹${i.lineTotal}`)
        .join("; ");

      return [
        b.id, b.createdAt, cust.name, cust.email, cust.phone, cust.address,
        cust.date, cust.time, itemsTxt, b.subtotal, b.total, cust.note
      ].map(cell => `"${String(cell || "").replace(/"/g,'""')}"`).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings_export.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  // refresh UI
  function refresh() {
    loadBookings();
    renderStats();
    applyFilters();
    renderTable();
  }

  // init
  refresh();

  // events
  searchInput.addEventListener("input", () => { applyFilters(); renderTable(); });
  sortSelect.addEventListener("change", () => { applyFilters(); renderTable(); });

  exportBtn.addEventListener("click", exportCSV);
  clearBtn.addEventListener("click", clearAllBookings);

  modalClose.addEventListener("click", closeDetailModal);
  modalCloseBtn.addEventListener("click", closeDetailModal);
  detailModal.addEventListener("click", e => { if (e.target === detailModal) closeDetailModal(); });

  modalDeleteBtn.addEventListener("click", () => {
    if (activeBookingId && confirm("Delete this booking?")) {
      deleteBooking(activeBookingId);
      closeDetailModal();
    }
  });
});

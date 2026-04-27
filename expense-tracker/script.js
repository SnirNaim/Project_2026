// Constants & Formatting
const STATE_KEY = 'fintrack_data';
const CURRENT_MONTH_KEY = 'fintrack_current_month';
const DEFAULT_CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Add Custom...'];

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', { 
        style: 'currency', 
        currency: 'ILS' 
    }).format(amount);
};

const getMonthString = (date = new Date()) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Global State
let state = {
    currentMonth: getMonthString(),
    expenses: [], // { id, amount, category, note, timestamp }
    categories: [...DEFAULT_CATEGORIES],
    archives: [] // { month: string, total: number, categoryTotals: {}, expenses: [] }
};

// DOM Elements
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');
const totalSpentEl = document.getElementById('total-spent');
const categoryBarsEl = document.getElementById('category-bars');
const recentTransactionsEl = document.getElementById('recent-transactions');
const currentMonthDisplay = document.getElementById('current-month-display');
const archiveMonthBtn = document.getElementById('archive-month-btn');

const expenseForm = document.getElementById('expense-form');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const customCategoryGroup = document.getElementById('custom-category-group');
const customCategoryInput = document.getElementById('custom-category');
const noteInput = document.getElementById('note');

const archivesContainer = document.getElementById('archives-container');
const wipeArchivesBtn = document.getElementById('wipe-archives-btn');

// Initialization
function init() {
    loadState();
    setupEventListeners();
    updateCategorySelect();
    renderAllViews();
}

// State Management
function loadState() {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
        state = JSON.parse(saved);
        // Ensure "Add Custom..." is always at the end if we ever removed it
        if (!state.categories.includes('Add Custom...')) {
            state.categories.push('Add Custom...');
        }
    } else {
        saveState();
    }
}

function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.target;
            switchView(target);
            
            navBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    // Custom Category Input Toggle
    categorySelect.addEventListener('change', (e) => {
        if (e.target.value === 'Add Custom...') {
            customCategoryGroup.classList.remove('hidden');
            customCategoryInput.required = true;
        } else {
            customCategoryGroup.classList.add('hidden');
            customCategoryInput.required = false;
        }
    });

    // Form Submission
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addExpense();
    });

    // Archive Button
    archiveMonthBtn.addEventListener('click', () => {
        if (confirm(`Are you sure you want to archive ${state.currentMonth}? This will clear the dashboard for a new month.`)) {
            archiveCurrentMonth();
        }
    });

    // Expand Archives
    archivesContainer.addEventListener('click', (e) => {
        const header = e.target.closest('.archive-header');
        if (header) {
            const detailsElement = header.nextElementSibling;
            if (detailsElement && detailsElement.classList.contains('archive-details')) {
                detailsElement.classList.toggle('open');
            }
        }
    });

    // Wipe Archives Button
    if (wipeArchivesBtn) {
        wipeArchivesBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to PERMANENTLY wipe all your yearly archives? This cannot be undone.")) {
                state.archives = [];
                saveState();
                renderArchives();
                showToast("Archives wiped successfully.");
            }
        });
    }
}

// View Management
function switchView(targetId) {
    views.forEach(view => {
        if (view.id === targetId) {
            view.classList.add('active');
            view.classList.remove('hidden');
            if(targetId === 'dashboard-view') renderDashboard();
            if(targetId === 'yearly-view') renderArchives();
            if(targetId === 'add-view') {
                updateCategorySelect();
            }
        } else {
            view.classList.remove('active');
            view.classList.add('hidden');
        }
    });
}

function renderAllViews() {
    currentMonthDisplay.textContent = state.currentMonth;
    renderDashboard();
    renderArchives();
}

// Add Expense Logic
function addExpense() {
    const amount = parseFloat(amountInput.value);
    let category = categorySelect.value;
    const note = noteInput.value;

    if (category === 'Add Custom...') {
        category = customCategoryInput.value.trim();
        if (category && !state.categories.includes(category)) {
            // Add custom category right before 'Add Custom...'
            state.categories.splice(state.categories.length - 1, 0, category);
        }
    }

    if (!amount || amount <= 0 || !category) return;

    const expense = {
        id: Date.now().toString(),
        amount: amount,
        category: category,
        note: note,
        timestamp: Date.now()
    };

    state.expenses.unshift(expense);
    saveState();

    // Reset Form
    expenseForm.reset();
    customCategoryGroup.classList.add('hidden');
    
    showToast('Expense Added Successfully!');
    updateCategorySelect();
}

function updateCategorySelect() {
    categorySelect.innerHTML = '';
    state.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if(cat === 'Housing') option.selected = true; // Default
        categorySelect.appendChild(option);
    });
}

// Dashboard Rendering
function renderDashboard() {
    // Calculate Totals
    const totalSpent = state.expenses.reduce((sum, item) => sum + item.amount, 0);
    totalSpentEl.textContent = formatCurrency(totalSpent);

    // Group By Category
    const categoryTotals = {};
    state.expenses.forEach(item => {
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    });

    // Render Category Bars
    categoryBarsEl.innerHTML = '';
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    
    if (sortedCategories.length === 0) {
        categoryBarsEl.innerHTML = '<p style="color: var(--text-secondary); text-align:center; padding: 1rem 0;">No expenses yet this month.</p>';
    }

    // Set colors for bars
    const colors = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    
    sortedCategories.forEach(([cat, amount], index) => {
        const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
        const color = colors[index % colors.length];

        const barHtml = `
            <div class="category-bar-item">
                <div class="bar-header">
                    <span>${cat}</span>
                    <span>${formatCurrency(amount)}</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${percentage}%; background: ${color}"></div>
                </div>
            </div>
        `;
        categoryBarsEl.insertAdjacentHTML('beforeend', barHtml);
    });

    // Render Recent Transactions
    recentTransactionsEl.innerHTML = '';
    
    if (state.expenses.length === 0) {
        recentTransactionsEl.innerHTML = '<li style="color: var(--text-secondary); text-align:center; padding: 1rem 0; background: transparent; border:none;">No transactions.</li>';
    }

    const recent = state.expenses.slice(0, 10); // Show last 10
    recent.forEach(tx => {
        const d = new Date(tx.timestamp);
        const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        const noteDisplay = tx.note ? `${tx.note} • ${dateStr}` : dateStr;
        
        const txHtml = `
            <li class="transaction-item">
                <div class="tx-info">
                    <span class="tx-category">${tx.category}</span>
                    <span class="tx-note">${noteDisplay}</span>
                </div>
                <div class="tx-amount">${formatCurrency(tx.amount)}</div>
            </li>
        `;
        recentTransactionsEl.insertAdjacentHTML('beforeend', txHtml);
    });
}

// Manual Archive Logic
function archiveCurrentMonth() {
    if (state.expenses.length === 0) {
        alert("There are no expenses to archive for the current month.");
        return;
    }

    const totalSpent = state.expenses.reduce((sum, item) => sum + item.amount, 0);
    const categoryTotals = {};
    state.expenses.forEach(item => {
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    });

    const archiveData = {
        month: state.currentMonth,
        total: totalSpent,
        categoryTotals: categoryTotals,
        timestamp: Date.now()
    };

    state.archives.push(archiveData);
    
    // Reset for new month
    state.expenses = [];
    state.currentMonth = getMonthString(); // Set to current system month
    
    saveState();
    renderAllViews();
    showToast('Month archived successfully!');
}

// Yearly Archives Rendering
function renderArchives() {
    archivesContainer.innerHTML = '';
    
    if (state.archives.length === 0) {
        archivesContainer.innerHTML = '<p style="color: var(--text-secondary); text-align:center; padding: 2rem;">No archived months yet.</p>';
        return;
    }

    // Sort archives by descending time (newest first)
    const sortedArchives = [...state.archives].sort((a,b) => b.timestamp - a.timestamp);

    sortedArchives.forEach(archive => {
        let catHtml = '';
        for (const [cat, amt] of Object.entries(archive.categoryTotals)) {
            catHtml += `
                <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem; color: var(--text-secondary);">
                    <span>${cat}</span>
                    <span>${formatCurrency(amt)}</span>
                </div>
            `;
        }

        const archiveHtml = `
            <div class="archive-month-card">
                <div class="archive-header">
                    <h3>${archive.month}</h3>
                    <div class="archive-total">${formatCurrency(archive.total)}</div>
                </div>
                <div class="archive-details">
                    <h4 style="margin-bottom:1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom:0.5rem;">Category Breakdown</h4>
                    ${catHtml}
                </div>
            </div>
        `;
        archivesContainer.insertAdjacentHTML('beforeend', archiveHtml);
    });
}

// UI Helpers
const toast = document.getElementById('notification');
const toastMsg = document.getElementById('notification-msg');
let toastTimeout;

function showToast(message) {
    toastMsg.textContent = message;
    toast.classList.remove('hidden');
    
    if(toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Run app
document.addEventListener('DOMContentLoaded', init);

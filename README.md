# Kissan Hisab (کسان حساب)

**Kissan Hisab** is an offline-first, on-device digital farm ledger and financial analytics application specifically tailored for farmers and agricultural managers. It provides a seamless, localized experience to monitor crop cycles, track field-level expenses, manage agricultural credit lines (Udhar), and generate localized financial health reports.

---

## 🚀 Key Features

*   **Bilingual Framework (English & Improved Layman Urdu)**: Features an instantaneous, interface-wide language translation engine that re-renders tracking matrices and reporting modules seamlessly.
*   **Agricultural Credit Ledgers (Receivables & Payables)**: Dedicated asset-liability modules to monitor credit extensions (To Receive) and supplier obligations (To Pay). Track transaction maturation, note pending status, and flag overdue deadlines.
*   **On-Device & Offline Architecture**: Leverages asynchronous browser client caching and structural database operations via **IndexedDB** (`kh_db`). Data functions securely entirely offline with zero cloud overhead.
*   **Built-in Farm Decision Calculators**: 
    *   *Crop Profit*: Project cash margins, per-acre yield economics, and absolute ROI before initiating harvest sweeps.
    *   *Break-Even*: Establish critical quantities required to offset variable production and baseline operating inputs.
    *   *Savings Goal Planner*: Chart prospective financial runways to specific hardware allocations.
    *   *Loan Cost Calculator*: Track the effective borrow rates and multi-month interest amortization balances.
*   **Deep Financial Insights & Analytics**: Real-time asset overview charts charting a 6-month transaction trajectory, percentage-based cost allocations, and automatic financial health scoring ratios.
*   **Automated Background Reminders**: Runs routine daily checks via Progressive Web App Service Worker protocols to push notifications regarding overdue collection sheets—even when the underlying browser window is fully closed.
*   **Data Sovereignty & Backups**: Dynamic client backup system handling structured state serialization dumps (JSON formatting) and tabular data generation compatible with Microsoft Excel or Google Sheets (CSV formatting).

---

## 📦 Project File Structure

```text
├── index.html       # Single-page interface containing structural layouts, theme styling, and app engines
├── manifest.json    # Mobile display directives, asset mapping configurations, and quick shortcut paths
├── sw.js            # Offline architecture wrapper managing proxy assets and background synching
└── icon.svg         # Premium agricultural brand packaging layout matrix asset

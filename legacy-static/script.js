const API_URL = "https://script.google.com/macros/s/your-web-app-id/exec";

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(pageId + 'Page').style.display = 'block';
    if (pageId === 'admin') loadTransactions();
}

// Process Deposit
document.getElementById('depositForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Processing...";

    const data = {
        action: 'deposit',
        agentName: document.getElementById('agentName').value,
        email: document.getElementById('custEmail').value,
        amount: document.getElementById('amount').value
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        alert('Deposit Successful! Email sent to customer.');
        e.target.reset();
    } catch (err) {
        alert('Error recording deposit.');
    } finally {
        btn.innerText = "Process & Notify";
    }
});

// Load Data for Admin
async function loadTransactions() {
    const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getData', sheet: 'Transactions' })
    });
    const data = await response.json();

    let rows = '';
    // Skip header row
    data.slice(1).forEach(row => {
        rows += `<tr>
            <td>${new Date(row[0]).toLocaleDateString()}</td>
            <td>${row[1]}</td>
            <td>${row[2]}</td>
            <td>N${row[3]}</td>
            <td>N${row[4]}</td>
        </tr>`;
    });
    document.getElementById('transBody').innerHTML = rows;
}

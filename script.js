document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const payFeeButton = document.getElementById('pay-fee');
    const semFeeButton = document.getElementById('sem-pay-fee');
    const paymentHistoryList = document.getElementById('payment-history');
    const paymentStatus = document.getElementById('payment-status');
    const studentList = document.getElementById('student-list');
    const loggedInStudent = JSON.parse(localStorage.getItem('loggedInStudent'));

    //bill
    if (window.location.pathname.includes('bill.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const name = urlParams.get('name') || 'N/A';
        const regNo = urlParams.get('regNo') || 'N/A';
        const paymentDate = urlParams.get('date') || 'N/A';
        const feeType = urlParams.get('feeType') || '';
        const amountPaid = urlParams.get('amount') || '0.00';
        
        document.getElementById('student-name').textContent = name;
        document.getElementById('reg-no').textContent = regNo;
        document.getElementById('payment-date').textContent = paymentDate;

        // set specific fee
        if (feeType === 'Semester fee Paid') {
            document.getElementById('semester-fee').textContent = amountPaid;
        } else if (feeType === 'Exam fee Paid') {
            document.getElementById('exam-fee').textContent = amountPaid;
        }

        document.querySelector('.total-amount').textContent = `Amount Paid: ₹${amountPaid}`;
        return;
    }

    //open bill
    function openBillPage(studentName, regNo, paymentDate, feeType, amountPaid) {
        const billUrl = `bill.html?name=${encodeURIComponent(studentName)}&regNo=${encodeURIComponent(regNo)}&date=${encodeURIComponent(paymentDate)}&feeType=${encodeURIComponent(feeType)}&amount=${encodeURIComponent(amountPaid)}`;
        window.open(billUrl, '_blank');
    }

    // Registration Logic
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const regNo = document.getElementById('reg-no').value;
            const password = document.getElementById('password').value;

            if (localStorage.getItem(regNo)) {
                alert('Registration number already exists.');
            } else {
                localStorage.setItem(regNo, JSON.stringify({ name, password, status: '', paymentHistory: [] }));
                alert(`Registered successfully as ${name}`);
                window.location.href = 'index.html';
            }
        });
    }

    // Login Logic
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const regNo = document.getElementById('reg-no').value;
            const password = document.getElementById('password').value;
            const userData = JSON.parse(localStorage.getItem(regNo));

            if (userData && userData.password === password) {
                alert(`Logged in successfully as ${userData.name}`);
                localStorage.setItem('loggedInStudent', JSON.stringify({ studentName: userData.name, regNo }));
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid registration number or password.');
            }
        });
    }

    //dashboard logic
    if (window.location.pathname.includes('dashboard.html')){

        if (!loggedInStudent) {
            alert('No student information found. Please log in.');
            window.location.href = 'index.html';
            return;
        }
        document.getElementById('student-name').textContent = loggedInStudent.studentName;
        
        const regNo = loggedInStudent.regNo;
        const userData = JSON.parse(localStorage.getItem(regNo));
        
        if (userData) {
            updatePaymentButtons(userData);
        }
        // change button to 'paid' if paid
        function updatePaymentButtons(userData) {
            if (userData.status.includes('Exam fee Paid')) {
                payFeeButton.textContent = 'Paid';
                payFeeButton.disabled = true;
            }
            if (userData.status.includes('Semester fee Paid')) {
                semFeeButton.textContent = 'Paid';
                semFeeButton.disabled = true;
            }
            paymentStatus.textContent = userData.status || 'Your payment status will be displayed here.';
        }
    }

    // Handle payments
    function handlePayment(button, feeType, amountPaid) {
        const loggedInStudent = JSON.parse(localStorage.getItem('loggedInStudent'));
        if (!loggedInStudent) {
            alert('No student information found. Please log in again.');
            window.location.href = 'index.html';
            return;
        }

        const regNo = loggedInStudent.regNo;
        const userData = JSON.parse(localStorage.getItem(regNo));

        if (userData) {
            userData.status += (userData.status ? ', ' : '') + feeType;
            const paymentDate = new Date().toLocaleDateString();
            const paymentRecord = `${feeType} of ₹${amountPaid} paid on ${paymentDate}`;
            userData.paymentHistory.push(paymentRecord);

            localStorage.setItem(regNo, JSON.stringify(userData));
            alert(`${feeType} successfully!`);
            paymentStatus.textContent = userData.status;

            const li = document.createElement('li');    //payment date time show
            li.textContent = paymentRecord;
            paymentHistoryList.appendChild(li);

            button.textContent = 'Paid';
            button.disabled = true;
            openBillPage(loggedInStudent.studentName, regNo, paymentDate, feeType, amountPaid);

            updateAdminStatus(userData);
        } else {
            alert('User not found!');
        }
    }

    // Exam Fee Payment
    if (payFeeButton) {
        payFeeButton.addEventListener('click', () => {
            handlePayment(payFeeButton, 'Exam fee Paid', 1200);
        });
    }

    // Semester Fee Payment
    if (semFeeButton) {
        semFeeButton.addEventListener('click', () => {
            handlePayment(semFeeButton, 'Semester fee Paid', 85000);
        });
    }

    // Update admin dashboard
    function updateAdminStatus(userData) {
        const studentRows = document.querySelectorAll('#student-list tr');
        studentRows.forEach(row => {
            const regNo = row.children[1].textContent;
            if (regNo === userData.regNo) {
                row.children[2].textContent = userData.status;
            }
        });
    }

    // Admin - Display all students
    if (studentList) {
        const students = Object.keys(localStorage).map((key) => {
            if (key !== 'loggedInStudent') {
                const student = JSON.parse(localStorage.getItem(key));
                return { name: student.name, regNo: key, status: student.status || 'Not Paid' };
            }
        }).filter(Boolean);

        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${student.name}</td><td>${student.regNo}</td><td>${student.status}</td>`;
            studentList.appendChild(row);
        });
    }

    // Admin password
    window.checkAdminPassword = function() {
        const adminPassword = "123";
        const enteredPassword = prompt("Please enter the admin password:");

        if (enteredPassword === adminPassword) {
            window.location.href = 'admin.html';
        } else {
            alert("Incorrect password. Access denied.");
        }
    };

    // Logout
    window.logout = function() {
        localStorage.removeItem('loggedInStudent');
        window.location.href = 'index.html';
    };
});

/**
 * Street Loan — Ghana collateral lending app
 */

(function () {
  'use strict';

  // Mobile navigation
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('open');
      const expanded = mainNav.classList.contains('open');
      navToggle.classList.toggle('is-open', expanded);
      navToggle.setAttribute('aria-expanded', expanded);
      navToggle.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
    });

    document.querySelectorAll('.main-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // Highlight active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Loan calculator (apply page)
  const loanAmount = document.getElementById('loanAmount');
  const loanTerm = document.getElementById('loanTerm');
  const collateralType = document.getElementById('collateralType');
  const estimateBox = document.getElementById('loanEstimate');

  function formatGHS(amount) {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  function updateLoanEstimate() {
    if (!estimateBox || !loanAmount || !loanTerm) return;

    const amount = parseFloat(loanAmount.value) || 0;
    const months = parseInt(loanTerm.value, 10) || 12;
    const type = collateralType ? collateralType.value : 'vehicle';

    const rates = {
      vehicle: 0.028,
      property: 0.022,
      valuables: 0.035
    };
    const monthlyRate = rates[type] || 0.028;
    const monthlyPayment =
      amount > 0
        ? (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1)
        : 0;
    const totalRepay = monthlyPayment * months;

    estimateBox.innerHTML =
      '<strong>Estimated monthly payment:</strong> ' +
      formatGHS(monthlyPayment) +
      '<br><span class="form-hint">Total repayment over ' +
      months +
      ' months: ' +
      formatGHS(totalRepay) +
      ' (indicative only)</span>';
  }

  if (loanAmount) loanAmount.addEventListener('input', updateLoanEstimate);
  if (loanTerm) loanTerm.addEventListener('change', updateLoanEstimate);
  if (collateralType) collateralType.addEventListener('change', updateLoanEstimate);
  updateLoanEstimate();

  // Application form validation & submit
  const applyForm = document.getElementById('loanApplicationForm');
  const formMessage = document.getElementById('formMessage');

  if (applyForm) {
    applyForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const required = applyForm.querySelectorAll('[required]');
      let valid = true;

      required.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#ce1126';
        } else {
          field.style.borderColor = '';
        }
      });

      const phone = document.getElementById('phone');
      if (phone && phone.value) {
        const ghanaPhone = /^(\+233|0)[2-5]\d{8}$/.test(phone.value.replace(/\s/g, ''));
        if (!ghanaPhone) {
          valid = false;
          phone.style.borderColor = '#ce1126';
          showMessage('Please enter a valid Ghana phone number (e.g. 0244123456).', 'error');
          return;
        }
      }

      const email = document.getElementById('email');
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        valid = false;
        showMessage('Please enter a valid email address.', 'error');
        return;
      }

      if (!valid) {
        showMessage('Please fill in all required fields.', 'error');
        return;
      }

      const data = Object.fromEntries(new FormData(applyForm));
      console.log('Street Loan application:', data);

      showMessage(
        'Thank you, ' +
          data.fullName +
          '! Your application has been received. Our team in Ghana will contact you within 24–48 hours.',
        'success'
      );
      applyForm.reset();
      updateLoanEstimate();
    });
  }

  function showMessage(text, type) {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.className = 'form-message ' + type;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');
  const contactMessage = document.getElementById('contactFormMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (contactMessage) {
        contactMessage.textContent = 'Message sent! We will respond within one business day.';
        contactMessage.className = 'form-message success';
      }
      contactForm.reset();
    });
  }

  // Collateral type toggle on apply form
  const collateralFields = document.querySelectorAll('[data-collateral-field]');
  const collateralSelect = document.getElementById('collateralType');

  function toggleCollateralFields() {
    if (!collateralSelect || !collateralFields.length) return;
    const type = collateralSelect.value;
    collateralFields.forEach(function (group) {
      const show = group.getAttribute('data-collateral-field') === type || group.getAttribute('data-collateral-field') === 'all';
      group.style.display = show ? 'block' : 'none';
    });
  }

  if (collateralSelect) {
    collateralSelect.addEventListener('change', toggleCollateralFields);
    toggleCollateralFields();
  }

  // Animate stats on scroll (simple)
  const stats = document.querySelectorAll('.stat-item strong');
  if (stats.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.3 }
    );
    stats.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'opacity 0.5s, transform 0.5s';
      observer.observe(el);
    });
  }
})();

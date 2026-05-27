const db = require('../../config/db');

// In-memory fallback datasets
const memoryPayments = [];
const memoryRefunds = [];
const memoryInvoices = [];

exports.createPayment = async (payment) => {
  if (db.isPostgresActive()) {
    const pool = db.getPgPool();
    await pool.query(
      'INSERT INTO payments (id, order_id, razorpay_payment_id, razorpay_signature, amount, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        payment.id,
        payment.orderId,
        payment.razorpayPaymentId || null,
        payment.razorpaySignature || null,
        payment.amount,
        payment.status,
        payment.createdAt || new Date(),
      ]
    );
    return payment;
  } else {
    memoryPayments.push(payment);
    return payment;
  }
};

exports.createRefund = async (refund) => {
  if (db.isPostgresActive()) {
    const pool = db.getPgPool();
    await pool.query(
      'INSERT INTO refunds (id, payment_id, amount, status, created_at) VALUES ($1, $2, $3, $4, $5)',
      [refund.id, refund.paymentId, refund.amount, refund.status, refund.createdAt || new Date()]
    );
    return refund;
  } else {
    memoryRefunds.push(refund);
    return refund;
  }
};

exports.createInvoice = async (invoice) => {
  if (db.isPostgresActive()) {
    const pool = db.getPgPool();
    await pool.query(
      'INSERT INTO invoices (id, order_id, invoice_number, amount, created_at) VALUES ($1, $2, $3, $4, $5)',
      [
        invoice.id,
        invoice.orderId,
        invoice.invoiceNumber,
        invoice.amount,
        invoice.createdAt || new Date(),
      ]
    );
    return invoice;
  } else {
    memoryInvoices.push(invoice);
    return invoice;
  }
};

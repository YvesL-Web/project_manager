import { expect } from 'chai';
import { describe, it } from 'mocha';

// Test

class Payment {
  private amount: number;

  private method: string;
  constructor(amount: number, method: string) {
    this.amount = amount;
    this.method = method;
  }
  processPayment(): string {
    // Simulate payment processing
    return `Payment of ${this.amount} processed via ${this.method}`;
  }
}

describe('Payment', () => {
  let payment: Payment;
  before(() => {
    console.log('Setting up payment processing…');
    payment = new Payment(100, 'Credit Card');
  });
  after(() => {
    console.log('Tearing down payment processing…');
    payment = null;
  });
  // Test case
  it('should process payment successfully', () => {
    // Act
    const result = payment.processPayment();
    // Assert
    expect(result).to.equal('Payment of 100 processed via Credit Card');
  });
});

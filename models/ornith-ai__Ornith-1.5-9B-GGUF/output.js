function runEnterpriseSimulation() {
  "use strict";

  // ============================
  // Custom Error Classes
  // ============================
  class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ValidationError";
      this.code = "VALIDATION_ERROR";
    }
  }
  class BusinessRuleError extends Error {
    constructor(message) {
      super(message);
      this.name = "BusinessRuleError";
      this.code = "BUSINESS_RULE_ERROR";
    }
  }
  class PaymentError extends Error {
    constructor(message) {
      super(message);
      this.name = "PaymentError";
      this.code = "PAYMENT_ERROR";
    }
  }
  class SimulationError extends Error {
    constructor(message) {
      super(message);
      this.name = "SimulationError";
      this.code = "SIMULATION_ERROR";
    }
  }

  // ============================
  // Seeded PRNG (mulberry32)
  // ============================
  const makeRng = (seed) => {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6D2B79F5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const rng = makeRng(20240101);
  const rngSecondary = makeRng(987654);
  const rngTertiary = makeRng(555123);

  // ============================
  // Simulation State
  // ============================
  const state = {
    customers: [],
    accounts: [],
    users: [],
    plans: [],
    products: [],
    subscriptions: [],
    contracts: [],
    invoices: [],
    payments: [],
    tickets: [],
    opportunities: [],
    teams: [],
    projects: [],
    tasks: [],
    usageRecords: [],
    apiRequests: [],
    auditLogs: [],
    notifications: [],
    featureFlags: [],
    permissions: [],
    customerMap: new Map(),
    accountMap: new Map(),
    subscriptionMap: new Map(),
    invoiceMap: new Map(),
    paymentMap: new Map(),
    ticketMap: new Map(),
    opportunityMap: new Map(),
    userMap: new Map(),
    activeCustomers: new Set(),
    churnedCustomers: new Set(),
    suspendedSubscriptions: new Set(),
    failedPaymentCounts: new Map(),
    metrics: {},
  };

  // ============================
  // ID Generation
  // ============================
  let idCounter = 0;
  const generateId = (prefix) => {
    idCounter += 1;
    return `${prefix}_${idCounter}_${Math.floor(rng() * 10000)}`;
  };

  // ============================
  // Date Generation
  // ============================
  const BASE_DATE = new Date("2024-01-01T00:00:00Z");
  const generateDate = (base, daysOffset, part = "day") => {
    const d = new Date(base.getTime());
    if (part === "day") {
      d.setDate(d.getDate() + daysOffset);
    } else if (part === "hour") {
      d.setHours(d.getHours() + daysOffset);
    } else if (part === "minute") {
      d.setMinutes(d.getMinutes() + daysOffset);
    }
    return d;
  };
  const formatDate = (date) => date.toISOString().slice(0, 10);
  const formatDateTime = (date) => date.toISOString().slice(0, 19).replace("T", " ");

  // ============================
  // Random Helpers
  // ============================
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const pickSecondary = (arr) => arr[Math.floor(rngSecondary() * arr.length)];
  const pickTertiary = (arr) => arr[Math.floor(rngTertiary() * arr.length)];
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const roundMoney = (value) => Math.round(value * 100) / 100;
  const rangeInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
  const rangeFloat = (min, max) => min + rng() * (max - min);
  const chance = (probability) => rng() < probability;

  // ============================
  // Domain Constants
  // ============================
  const TIERS = ["basic", "pro", "enterprise"];
  const CUSTOMER_STATUSES = ["active", "churned", "suspended"];
  const SUBSCRIPTION_STATUSES = ["active", "trial", "cancelled", "suspended"];
  const INVOICE_STATUSES = ["paid", "unpaid", "refunded", "credited"];
  const PAYMENT_STATUSES = ["succeeded", "failed", "refunded"];
  const TICKET_STATUSES = ["open", "in_progress", "resolved", "escalated", "closed"];
  const TICKET_PRIORITIES = ["low", "medium", "high", "critical"];
  const OPPORTUNITY_STAGES = ["new", "qualified", "proposal", "negotiation", "won", "lost"];
  const OPPORTUNITY_OUTCOMES = ["won", "lost"];
  const PAYMENT_METHODS = ["credit_card", "wire_transfer", "ach", "check"];
  const ROLES = ["owner", "admin", "manager", "member", "viewer"];
  const PERMISSION_ACTIONS = ["read", "write", "delete", "admin"];
  const PERMISSION_RESOURCES = ["customers", "invoices", "subscriptions", "tickets", "reports"];
  const NOTIFICATION_CHANNELS = ["email", "sms", "in_app"];
  const NOTIFICATION_TYPES = ["payment_failed", "payment_succeeded", "invoice_due", "ticket_created", "ticket_resolved", "upgrade_available", "churn_risk", "sla_breach", "signup"];
  const FEATURE_FLAGS = ["advanced_analytics", "api_access", "sso", "white_label", "custom_branding", "dedicated_support", "data_export"];
  const USAGE_METRICS = ["api_calls", "storage_gb", "bandwidth_gb", "seats", "transactions"];
  const API_ENDPOINTS = ["/v1/customers", "/v1/invoices", "/v1/subscriptions", "/v1/usage", "/v1/analytics", "/v1/products", "/v1/tickets", "/v1/webhooks"];
  const API_METHODS = ["GET", "POST", "PUT", "DELETE"];
  const SLA_TIERS = { basic: 72, pro: 24, enterprise: 4 };
  const PLAN_NAMES = {
    basic: ["Starter", "Essentials", "Foundation", "Core", "Standard", "Lite", "Basic", "Entry"],
    pro: ["Professional", "Growth", "Business", "Scale", "Advanced", "Premium", "Optimize", "Enterprise Lite"],
    enterprise: ["Enterprise", "Enterprise Plus", "Enterprise Max", "Unlimited", "Platinum", "Gold", "Titan", "Apex"],
  };
  const PRODUCT_CATEGORIES = ["seats", "storage", "api", "integrations", "support", "analytics", "automation", "security"];
  const PRODUCT_NAMES = ["User Seats", "Cloud Storage", "API Access", "Integrations", "Priority Support", "Analytics Suite", "Workflow Automation", "Security Compliance"];
  const TEAM_NAMES = ["Sales", "Customer Success", "Engineering", "Support", "Marketing", "Finance", "Operations"];
  const PROJECT_NAMES = ["Q1 Roadmap", "Migration", "Integration", "Optimization", "Audit", "Launch", "Recovery", "Expansion"];
  const TASK_STATUSES = ["todo", "in_progress", "blocked", "done"];
  const EMAIL_DOMAINS = ["acme.com", "globex.com", "initech.com", "umbrella.com", "hooli.com", "stark.com", "wayne.com", "cyberdyne.com"];
  const COMPANY_NAMES = ["Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark", "Wayne", "Cyberdyne", "Soylent", "Wonka", "Pied Piper", "Gekko", "Massive Dynamic", "Initech", "Stark Industries"];
  const FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
  const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

  // ============================
  // Validation
  // ============================
  const validateCustomer = (customer) => {
    if (!customer || typeof customer !== "object") throw new ValidationError("Customer must be an object");
    if (!customer.name || typeof customer.name !== "string") throw new ValidationError("Customer requires a name");
    if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new ValidationError("Customer requires a valid email");
    if (!customer.id) throw new ValidationError("Customer requires an id");
    if (!TIERS.includes(customer.tier)) throw new ValidationError(`Invalid tier: ${customer.tier}`);
    if (!["active", "churned", "suspended"].includes(customer.status)) throw new ValidationError(`Invalid status: ${customer.status}`);
    return true;
  };

  // ============================
  // Customer Creation
  // ============================
  const createCustomer = () => {
    const tier = pick(TIERS);
    const companyName = `${pickSecondary(COMPANY_NAMES)} Corp`;
    const domain = pickSecondary(EMAIL_DOMAINS);
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const customer = {
      id: generateId("CUST"),
      name: companyName,
      email: `${firstName}.${lastName}@${domain}`,
      tier,
      status: "active",
      contactName: `${firstName} ${lastName}`,
      phone: `+1-${rangeInt(200, 999)}-${rangeInt(200, 999)}-${rangeInt(1000, 9999)}`,
      address: `${rangeInt(1, 9999)} ${pick(["Main", "Oak", "Pine", "Maple", "Cedar", "Elm", "Birch", "Willow"])} St`,
      city: pick(["New York", "San Francisco", "London", "Berlin", "Tokyo", "Sydney", "Paris", "Toronto"]),
      country: pick(["US", "GB", "DE", "JP", "AU", "FR", "CA"]),
      createdAt: generateDate(BASE_DATE, rangeInt(-365, 10), "day"),
      lifetimeValue: 0,
      totalSpent: 0,
      invoiceCount: 0,
      paymentCount: 0,
      failedPaymentCount: 0,
      subscriptionCount: 0,
      ticketsCount: 0,
      opportunitiesCount: 0,
    };
    validateCustomer(customer);
    state.customers.push(customer);
    state.customerMap.set(customer.id, customer);
    state.activeCustomers.add(customer.id);
    return customer;
  };

  // ============================
  // Account Management
  // ============================
  const createAccount = (customerId) => {
    const customer = state.customerMap.get(customerId);
    if (!customer) throw new BusinessRuleError(`Cannot create account for unknown customer ${customerId}`);
    const account = {
      id: generateId("ACC"),
      customerId,
      name: `${customer.name} Primary Account`,
      status: "active",
      createdAt: generateDate(BASE_DATE, rangeInt(-365, 5), "day"),
      currency: "USD",
      taxId: `TAX-${generateId("TAX").slice(3)}`,
      unpaidInvoiceCount: 0,
      outstandingBalance: 0,
      creditBalance: 0,
      totalRevenue: 0,
    };
    state.accounts.push(account);
    state.accountMap.set(account.id, account);
    return account;
  };

  // ============================
  // User Creation
  // ============================
  const createUser = (accountId) => {
    const account = state.accountMap.get(accountId);
    if (!account) throw new BusinessRuleError(`Cannot create user for unknown account ${accountId}`);
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const role = pick(ROLES);
    const user = {
      id: generateId("USR"),
      accountId,
      customerId: account.customerId,
      email: `${firstName}.${lastName}@${account.customerId}`,
      name: `${firstName} ${lastName}`,
      role,
      teamId: null,
      createdAt: generateDate(BASE_DATE, rangeInt(-365, 5), "day"),
      lastLoginAt: generateDate(BASE_DATE, rangeInt(-30, 1), "day"),
      active: true,
      permissions: [],
    };
    state.users.push(user);
    state.userMap.set(user.id, user);
    return user;
  };

  // ============================
  // Pricing Plans
  // ============================
  const createPlan = (tier) => {
    const names = PLAN_NAMES[tier];
    const plan = {
      id: generateId("PLAN"),
      name: pick(names),
      tier,
      monthlyPrice: tier === "basic" ? rangeInt(29, 99) : tier === "pro" ? rangeInt(99, 499) : rangeInt(499, 2999),
      apiLimit: tier === "basic" ? 10000 : tier === "pro" ? 100000 : 1000000,
      supportPriority: tier === "basic" ? "low" : tier === "pro" ? "medium" : "high",
      features: tier === "basic" ? ["core", "basic_support"] : tier === "pro" ? ["core", "analytics", "priority_support"] : ["core", "analytics", "priority_support", "sso", "api_access", "white_label"],
      maxUsers: tier === "basic" ? 5 : tier === "pro" ? 50 : 500,
      maxStorageGb: tier === "basic" ? 10 : tier === "pro" ? 500 : 10000,
      volumeDiscount: 0,
      createdAt: generateDate(BASE_DATE, rangeInt(-365, 10), "day"),
    };
    state.plans.push(plan);
    return plan;
  };

  // ============================
  // Products
  // ============================
  const createProduct = () => {
    const product = {
      id: generateId("PROD"),
      name: pick(PRODUCT_NAMES),
      sku: `SKU-${generateId("SKU").slice(3)}`,
      category: pick(PRODUCT_CATEGORIES),
      description: `${pick(PRODUCT_NAMES)} module for enterprise customers`,
      createdAt: generateDate(BASE_DATE, rangeInt(-365, 10), "day"),
    };
    state.products.push(product);
    return product;
  };

  // ============================
  // Subscription Creation
  // ============================
  const createSubscription = (customerId, accountId, planId, productId, status = "active") => {
    const customer = state.customerMap.get(customerId);
    if (!customer) throw new BusinessRuleError(`Cannot create subscription for unknown customer ${customerId}`);
    const plan = state.plans.find((p) => p.id === planId);
    if (!plan) throw new BusinessRuleError(`Cannot create subscription for unknown plan ${planId}`);
    const subscription = {
      id: generateId("SUB"),
      customerId,
      accountId,
      productId,
      planId,
      status,
      startDate: generateDate(BASE_DATE, rangeInt(-365, 30), "day"),
      endDate: generateDate(BASE_DATE, rangeInt(30, 365), "day"),
      monthlyAmount: plan.monthlyPrice,
      discount: 0,
      currency: "USD",
      billingCycle: "monthly",
      trialDays: status === "trial" ? rangeInt(14, 30) : 0,
      createdAt: generateDate(BASE_DATE, rangeInt(-365, 30), "day"),
      failedPaymentCount: 0,
      suspended: false,
      cancelled: false,
      churnRisk: false,
    };
    state.subscriptions.push(subscription);
    state.subscriptionMap.set(subscription.id, subscription);
    return subscription;
  };

  // ============================
  // Upgrades
  // ============================
  const upgradeSubscription = (subscriptionId) => {
    const subscription = state.subscriptionMap.get(subscriptionId);
    if (!subscription) throw new BusinessRuleError(`Cannot upgrade unknown subscription ${subscriptionId}`);
    if (subscription.status === "cancelled" || subscription.status === "suspended") {
      throw new BusinessRuleError(`Cannot upgrade subscription in status ${subscription.status}`);
    }
    const account = state.accountMap.get(subscription.accountId);
    if (!account || account.unpaidInvoiceCount > 0) {
      throw new BusinessRuleError(`Cannot upgrade account with unpaid invoices`);
    }
    const currentIndex = state.plans.findIndex((p) => p.id === subscription.planId);
    const targetIndex = state.plans.findIndex((p) => p.tier === TIERS[currentIndex + 1]);
    if (targetIndex === -1) throw new BusinessRuleError(`No higher tier available for ${subscription.planId}`);
    const targetPlan = state.plans[targetIndex];
    const delta = targetPlan.monthlyPrice - subscription.monthlyPrice;
    const proration = roundMoney((delta / 30) * rangeInt(1, 15));
    const invoice = generateInvoice(subscription.customerId, subscription.accountId, subscription.id, proration, "upgrade");
    const payment = processPayment(invoice.id, invoice.amount, "credit_card");
    subscription.planId = targetPlan.id;
    subscription.monthlyAmount = targetPlan.monthlyPrice;
    subscription.discount = targetPlan.volumeDiscount;
    subscription.status = "active";
    subscription.suspended = false;
    subscription.upgradeDate = generateDate(BASE_DATE, 0, "day");
    subscription.upgradeFrom = subscription.planId;
    subscription.upgradeTo = targetPlan.id;
    logAudit(subscription.customerId, subscription.accountId, "subscription_upgraded", "subscription", { from: subscription.upgradeFrom, to: targetPlan.id });
    sendNotification(subscription.customerId, subscription.accountId, "upgrade_succeeded", `Subscription upgraded from ${subscription.upgradeFrom} to ${targetPlan.name}`);
    return subscription;
  };

  // ============================
  // Downgrades
  // ============================
  const downgradeSubscription = (subscriptionId) => {
    const subscription = state.subscriptionMap.get(subscriptionId);
    if (!subscription) throw new BusinessRuleError(`Cannot downgrade unknown subscription ${subscriptionId}`);
    if (subscription.status === "cancelled") throw new BusinessRuleError(`Cannot downgrade cancelled subscription`);
    const currentIndex = state.plans.findIndex((p) => p.id === subscription.planId);
    const targetIndex = state.plans.findIndex((p) => p.tier === TIERS[currentIndex - 1]);
    if (targetIndex === -1) throw new BusinessRuleError(`No lower tier available for ${subscription.planId}`);
    const targetPlan = state.plans[targetIndex];
    const delta = subscription.monthlyAmount - targetPlan.monthlyPrice;
    const proration = roundMoney((delta / 30) * rangeInt(1, 15));
    const invoice = generateInvoice(subscription.customerId, subscription.accountId, subscription.id, proration, "downgrade");
    const payment = processPayment(invoice.id, invoice.amount, "credit_card");
    subscription.planId = targetPlan.id;
    subscription.monthlyAmount = targetPlan.monthlyPrice;
    subscription.discount = targetPlan.volumeDiscount;
    logAudit(subscription.customerId, subscription.accountId, "subscription_downgraded", "subscription", { from: subscription.planId, to: targetPlan.id });
    return subscription;
  };

  // ============================
  // Cancellations
  // ============================
  const cancelSubscription = (subscriptionId) => {
    const subscription = state.subscriptionMap.get(subscriptionId);
    if (!subscription) throw new BusinessRuleError(`Cannot cancel unknown subscription ${subscriptionId}`);
    if (subscription.status === "cancelled") throw new BusinessRuleError(`Subscription already cancelled`);
    subscription.status = "cancelled";
    subscription.cancelledAt = generateDate(BASE_DATE, 0, "day");
    state.suspendedSubscriptions.delete(subscription.id);
    state.activeCustomers.delete(subscription.customerId);
    state.churnedCustomers.add(subscription.customerId);
    state.churnedCustomers.add(subscription.accountId);
    logAudit(subscription.customerId, subscription.accountId, "subscription_cancelled", "subscription", { subscriptionId: subscription.id });
    sendNotification(subscription.customerId, subscription.accountId, "churn_risk", `Subscription ${subscription.id} has been cancelled`);
    return subscription;
  };

  // ============================
  // Invoice Generation
  // ============================
  const generateInvoice = (customerId, accountId, subscriptionId, amount, reason = "recurring") => {
    const customer = state.customerMap.get(customerId);
    if (!customer) throw new BusinessRuleError(`Cannot generate invoice for unknown customer ${customerId}`);
    const invoice = {
      id: generateId("INV"),
      customerId,
      accountId,
      subscriptionId,
      amount,
      tax: 0,
      discount: 0,
      subtotal: amount,
      status: "unpaid",
      dueDate: generateDate(BASE_DATE, rangeInt(1, 30), "day"),
      createdAt: generateDate(BASE_DATE, rangeInt(-30, 5), "day"),
      reason,
      lineItems: [{ description: reason === "recurring" ? "Monthly subscription" : reason, amount }],
    };
    state.invoices.push(invoice);
    state.invoiceMap.set(invoice.id, invoice);
    return invoice;
  };

  // ============================
  // Payment Processing
  // ============================
  const processPayment = (invoiceId, amount, method = "credit_card") => {
    const invoice = state.invoiceMap.get(invoiceId);
    if (!invoice) throw new PaymentError(`Cannot process payment for unknown invoice ${invoiceId}`);
    const customer = state.customerMap.get(invoice.customerId);
    if (!customer) throw new PaymentError(`Cannot process payment for unknown customer ${invoice.customerId}`);
    const succeeded = chance(0.82);
    const payment = {
      id: generateId("PAY"),
      invoiceId,
      customerId: invoice.customerId,
      accountId: invoice.accountId,
      amount,
      method,
      status: succeeded ? "succeeded" : "failed",
      createdAt: generateDate(BASE_DATE, 0, "day"),
      processedAt: generateDate(BASE_DATE, 0, "day"),
      reference: `REF-${generateId("REF").slice(3)}`,
      currency: "USD",
    };
    state.payments.push(payment);
    state.paymentMap.set(payment.id, payment);
    if (succeeded) {
      invoice.status = "paid";
      invoice.paidAt = generateDate(BASE_DATE, 0, "day");
      invoice.paymentId = payment.id;
      invoice.amount = roundMoney(invoice.amount - invoice.discount);
      customer.totalSpent = roundMoney(customer.totalSpent + invoice.amount);
      customer.invoiceCount += 1;
      customer.paymentCount += 1;
    } else {
      invoice.status = "unpaid";
      customer.failedPaymentCount += 1;
      const count = (state.failedPaymentCounts.get(invoiceId) || 0) + 1;
      state.failedPaymentCounts.set(invoiceId, count);
      if (count >= 3) {
        const subscription = subscriptionForInvoice(invoice);
        if (subscription) suspendSubscription(subscription.id);
      }
      sendNotification(invoice.customerId, invoice.accountId, "payment_failed", `Payment for invoice ${invoice.id} failed`);
      logAudit(invoice.customerId, invoice.accountId, "payment_failed", "payment", { invoiceId: invoice.id, amount });
    }
    return payment;
  };

  // ============================
  // Refunds
  // ============================
  const refundPayment = (paymentId) => {
    const payment = state.paymentMap.get(paymentId);
    if (!payment) throw new PaymentError(`Cannot refund unknown payment ${paymentId}`);
    if (payment.status !== "succeeded") throw new PaymentError(`Cannot refund payment in status ${payment.status}`);
    const refundAmount = roundMoney(payment.amount * clamp(rng(), 0.1, 1.0));
    payment.status = "refunded";
    payment.refundAmount = refundAmount;
    payment.refundedAt = generateDate(BASE_DATE, 0, "day");
    const invoice = state.invoiceMap.get(payment.invoiceId);
    if (invoice) {
      invoice.status = "credited";
      invoice.creditedAt = generateDate(BASE_DATE, 0, "day");
    }
    logAudit(payment.customerId, payment.accountId, "payment_refunded", "payment", { paymentId, amount: refundAmount });
    sendNotification(payment.customerId, payment.accountId, "refund_issued", `Refund of ${roundMoney(refundAmount)} issued for payment ${paymentId}`);
    return payment;
  };

  // ============================
  // Credits
  // ============================
  const issueCredit = (customerId, accountId, amount, reason = "service_credit") => {
    const customer = state.customerMap.get(customerId);
    if (!customer) throw new BusinessRuleError(`Cannot issue credit for unknown customer ${customerId}`);
    const account = state.accountMap.get(accountId);
    if (!account) throw new BusinessRuleError(`Cannot issue credit for unknown account ${accountId}`);
    const credit = {
      id: generateId("CRD"),
      customerId,
      accountId,
      amount,
      reason,
      createdAt: generateDate(BASE_DATE, 0, "day"),
      expiresAt: generateDate(BASE_DATE, rangeInt(30, 365), "day"),
      used: false,
      appliedToInvoice: null,
    };
    account.creditBalance = roundMoney(account.creditBalance + amount);
    state.payments.push({
      id: generateId("PAY"),
      invoiceId: null,
      customerId,
      accountId,
      amount,
      method: "credit",
      status: "succeeded",
      createdAt: generateDate(BASE_DATE, 0, "day"),
      processedAt: generateDate(BASE_DATE, 0, "day"),
      reference: `CRD-${generateId("REF").slice(3)}`,
      currency: "USD",
      isCredit: true,
      creditId: credit.id,
    });
    logAudit(customerId, accountId, "credit_issued", "credit", { amount, reason });
    sendNotification(customerId, accountId, "credit_issued", `Service credit of ${roundMoney(amount)} issued`);
    return credit;
  };

  // ============================
  // Support Tickets
  // ============================
  const createTicket = (customerId, accountId, subject) => {
    const customer = state.customerMap.get(customerId);
    if (!customer) throw new BusinessRuleError(`Cannot create ticket for unknown customer ${customerId}`);
    const priority = determineSupportPriority(customer);
    const ticket = {
      id: generateId("TKT"),
      customerId,
      accountId,
      subject,
      status: "open",
      priority,
      createdAt: generateDate(BASE_DATE, rangeInt(-30, 5), "day"),
      resolvedAt: null,
      slaBreach: false,
      slaTarget: SLA_TIERS[customer.tier],
      escalated: false,
      assigneeId: null,
      messageCount: 1,
      responseTime: null,
      resolutionTime: null,
    };
    state.tickets.push(ticket);
    state.ticketMap.set(ticket.id, ticket);
    customer.ticketsCount += 1;
    logAudit(customerId, accountId, "ticket_created", "ticket", { ticketId: ticket.id, priority });
    sendNotification(customerId, accountId, "ticket_created", `Support ticket ${ticket.id} created: ${subject}`);
    return ticket;
  };

  // ============================
  // Ticket Resolution
  // ============================
  const resolveTicket = (ticketId) => {
    const ticket = state.ticketMap.get(ticketId);
    if (!ticket) throw new BusinessRuleError(`Cannot resolve unknown ticket ${ticketId}`);
    if (ticket.status === "resolved" || ticket.status === "closed") throw new BusinessRuleError(`Ticket already ${ticket.status}`);
    if (ticket.status === "escalated") {
      ticket.escalated = false;
      ticket.status = "in_progress";
    }
    const now = generateDate(BASE_DATE, 0, "day");
    const resolutionTime = roundMoney(rangeInt(1, 48) * 60);
    ticket.status = "resolved";
    ticket.resolvedAt = now;
    ticket.resolutionTime = resolutionTime;
    ticket.responseTime = roundMoney(rangeInt(1, 24) * 60);
    ticket.slaBreach = resolutionTime > ticket.slaTarget * 60;
    logAudit(ticket.customerId, ticket.accountId, "ticket_resolved", "ticket", { ticketId, resolutionTime });
    sendNotification(ticket.customerId, ticket.accountId, "ticket_resolved", `Ticket ${ticketId} resolved`);
    return ticket;
  };

  // ============================
  // Escalations
  // ============================
  const escalateTicket = (ticketId) => {
    const ticket = state.ticketMap.get(ticketId);
    if (!ticket) throw new BusinessRuleError(`Cannot escalate unknown ticket ${ticketId}`);
    if (ticket.status === "escalated") throw new BusinessRuleError(`Ticket already escalated`);
    ticket.status = "escalated";
    ticket.escalated = true;
    ticket.escalatedAt = generateDate(BASE_DATE, 0, "day");
    logAudit(ticket.customerId, ticket.accountId, "ticket_escalated", "ticket", { ticketId });
    sendNotification(ticket.customerId, ticket.accountId, "sla_breach", `Ticket ${ticketId} escalated`);
    return ticket;
  };

  // ============================
  // Sales Opportunities
  // ============================
  const createOpportunity = (customerId, accountId, name, value) => {
    const customer = state.customerMap.get(customerId);
    if (!customer) throw new BusinessRuleError(`Cannot create opportunity for unknown customer ${customerId}`);
    const opportunity = {
      id: generateId("OPP"),
      customerId,
      accountId,
      name,
      stage: "new",
      value,
      probability: 0.1,
      createdAt: generateDate(BASE_DATE, rangeInt(-365, 30), "day"),
      closedAt: null,
      outcome: null,
      contactName: customer.contactName,
      source: pick(["inbound", "outbound", "referral", "self_service", "partner"]),
      nextStep: pick(["call', 'meeting', 'demo', 'proposal', 'contract']),
    };
    state.opportunities.push(opportunity);
    state.opportunityMap.set(opportunity.id, opportunity);
    customer.opportunitiesCount += 1;
    logAudit(customerId, accountId, "opportunity_created", "opportunity", { opportunityId: opportunity.id, value });
    return opportunity;
  };

  // ============================
  // Win/Loss Processing
  // ============================
  const closeOpportunity = (opportunityId, outcome) => {
    const opportunity = state.opportunityMap.get(opportunityId);
    if (!opportunity) throw new BusinessRuleError(`Cannot close unknown opportunity ${opportunityId}`);
    if (opportunity.stage === "won" || opportunity.stage === "lost") throw new BusinessRuleError(`Opportunity already closed`);
    if (outcome === "won") {
      const customer = state.customerMap.get(opportunity.customerId);
      if (!customer) throw new BusinessRuleError(`Cannot create customer for unknown customer ${opportunity.customerId}`);
      const account = createAccount(opportunity.customerId);
      const plan = createPlan("enterprise");
      const product = createProduct();
      const subscription = createSubscription(opportunity.customerId, account.id, plan.id, product.id, "active");
      const contract = createContract(opportunity.customerId, account.id, subscription.id);
      const invoice = generateInvoice(opportunity.customerId, account.id, subscription.id, subscription.monthlyAmount, "new_subscription");
      const payment = processPayment(invoice.id, invoice.amount, "wire_transfer");
      opportunity.stage = "won";
      opportunity.outcome = "won";
      opportunity.closedAt = generateDate(BASE_DATE, 0, "day");
      opportunity.wonValue = opportunity.value;
      opportunity.subscriptionId = subscription.id;
      opportunity.accountId = account.id;
      logAudit(opportunity.customerId, account.id, "opportunity_won", "opportunity", { opportunityId, subscriptionId: subscription.id });
      sendNotification(opportunity.customerId, account.id, "signup", `Welcome to ${plan.name}! Your subscription ${subscription.id} is active`);
    } else {
      opportunity.stage = "lost";
      opportunity.outcome = "lost";
      opportunity.closedAt = generateDate(BASE_DATE, 0, "day");
      logAudit(opportunity.customerId, opportunity.accountId, "opportunity_lost", "opportunity", { opportunityId });
      sendNotification(opportunity.customerId, opportunity.accountId, "signup", `We regret to inform you that ${opportunity.name} did not proceed`);
    }
    return opportunity;
  };

  // ============================
  // Contracts
  // ============================
  const createContract = (customerId, accountId, subscriptionId) => {
    const customer = state.customerMap.get(customerId);
    if (!customer) throw new BusinessRuleError(`Cannot create contract for unknown customer ${customerId}`);
    const subscription = state.subscriptionMap.get(subscriptionId);
    if (!subscription) throw new BusinessRuleError(`Cannot create contract for unknown subscription ${subscriptionId}`);
    const contract = {
      id: generateId("CTR"),
      customerId,
      accountId,
      subscriptionId,
      startDate: subscription.startDate,
      endDate: generateDate(BASE_DATE, rangeInt(365, 1460), "day"),
      terms: pick(["standard", "enterprise", "annual", "multi_year"]),
      status: "active",
      renewalDate: generateDate(BASE_DATE, rangeInt(365, 730), "day"),
      autoRenew: chance(0.7),
      signatureDate: generateDate(BASE_DATE, rangeInt(-30, 5), "day"),
    };
    state.contracts.push(contract);
    return contract;
  };

  // ============================
  // Usage Tracking
  // ============================
  const recordUsage = (subscriptionId, metric, value) => {
    const subscription = state.subscriptionMap.get(subscriptionId);
    if (!subscription) throw new BusinessRuleError(`Cannot record usage for unknown subscription ${subscriptionId}`);
    const plan = state.plans.find((p) => p.id === subscription.planId);
    const usage = {
      id: generateId("USE"),
      subscriptionId,
      productId: subscription.productId,
      metric,
      value: roundMoney(value),
      timestamp: generateDate(BASE_DATE, rangeInt(-30, 1), "day"),
      planLimit: plan ? plan.apiLimit : null,
    };
    state.usageRecords.push(usage);
    return usage;
  };

  // ============================
  // API Rate Limiting
  // ============================
  const checkApiLimit = (customerId, accountId) => {
    const customer = state.customerMap.get(customerId);
    if (!customer) throw new BusinessRuleError(`Unknown customer ${customerId}`);
    const subscription = subscriptionsForCustomer(customer.id);
    if (subscription.length === 0) throw new BusinessRuleError(`No subscriptions for customer ${customerId}`);
    const plan = state.plans.find((p) => p.id === subscription[0].planId);
    if (!plan) throw new BusinessRuleError(`No plan for subscription`);
    const limit = getApiLimit(plan);
    const current = apiRequestsForCustomer(customer.id).length;
    const allowed = chance(0.95);
    if (allowed && current < limit) {
      const request = {
        id: generateId("API"),
        customerId,
        accountId,
        endpoint: pick(API_ENDPOINTS),
        method: pick(API_METHODS),
        status: 200,
        responseTime: rangeInt(10, 500),
        timestamp: generateDate(BASE_DATE, rangeInt(-30, 1), "day"),
        rateLimited: false,
        quotaRemaining: roundMoney(limit - current),
      };
      state.apiRequests.push(request);
      return request;
    } else {
      const request = {
        id: generateId("API"),
        customerId,
        accountId,
        endpoint: pick(API_ENDPOINTS),
        method: pick(API_METHODS),
        status: 429,
        responseTime: rangeInt(1, 10),
        timestamp: generateDate(BASE_DATE, rangeInt(-30, 1), "day"),
        rateLimited: true,
        quotaRemaining: 0,
      };
      state.apiRequests.push(request);
      logAudit(customerId, accountId, "api_rate_limited", "api_request", { endpoint: request.endpoint, status: request.status });
      return request;
    }
  };

  // ============================
  // Feature Flags
  // ============================
  const setFeatureFlag = (name, enabled) => {
    const flag = {
      id: generateId("FLAG"),
      name,
      enabled: !!enabled,
      tiers: TIERS,
      value: enabled ? "on" : "off",
      createdAt: generateDate(BASE_DATE, rangeInt(-30, 5), "day"),
      updatedAt: generateDate(BASE_DATE, 0, "day"),
    };
    state.featureFlags.push(flag);
    return flag;
  };

  // ============================
  // Audit Logging
  // ============================
  const logAudit = (customerId, accountId, action, entity, details = {}) => {
    const log = {
      id: generateId("AUD"),
      customerId,
      accountId,
      action,
      entity,
      details,
      timestamp: generateDate(BASE_DATE, rangeInt(-30, 1), "day"),
      actor: "system",
    };
    state.auditLogs.push(log);
    return log;
  };

  // ============================
  // Notification Generation
  // ============================
  const sendNotification = (customerId, accountId, type, message) => {
    const notification = {
      id: generateId("NOTIF"),
      customerId,
      accountId,
      type,
      message,
      channel: pick(NOTIFICATION_CHANNELS),
      createdAt: generateDate(BASE_DATE, 0, "day"),
      read: false,
      metadata: { type },
    };
    state.notifications.push(notification);
    return notification;
  };

  // ============================
  // Teams
  // ============================
  const createTeam = (accountId) => {
    const account = state.accountMap.get(accountId);
    if (!account) throw new BusinessRuleError(`Cannot create team for unknown account ${accountId}`);
    const team = {
      id: generateId("TEAM"),
      accountId,
      name: pick(TEAM_NAMES),
      createdAt: generateDate(BASE_DATE, rangeInt(-365, 30), "day"),
      members: [],
    };
    state.teams.push(team);
    return team;
  };

  // ============================
  // Projects
  // ============================
  const createProject = (accountId) => {
    const account = state.accountMap.get(accountId);
    if (!account) throw new BusinessRuleError(`Cannot create project for unknown account ${accountId}`);
    const project = {
      id: generateId("PRJ"),
      accountId,
      name: pick(PROJECT_NAMES),
      status: "active",
      startDate: generateDate(BASE_DATE, rangeInt(-365, 30), "day"),
      endDate: generateDate(BASE_DATE, rangeInt(30, 365), "day"),
      progress: rangeInt(0, 100),
      assignedTo: [],
    };
    state.projects.push(project);
    return project;
  };

  // ============================
  // Tasks
  // ============================
  const createTask = (projectId, accountId) => {
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) throw new BusinessRuleError(`Cannot create task for unknown project ${projectId}`);
    const task = {
      id: generateId("TSK"),
      projectId,
      accountId,
      title: pick(["Investigate", "Review", "Implement", "Test", "Deploy", "Document", "Validate", "Optimize"]),
      assigneeId: null,
      status: "todo",
      priority: pick(["low", "medium", "high", "critical"]),
      createdAt: generateDate(BASE_DATE, rangeInt(-30, 5), "day"),
      dueDate: generateDate(BASE_DATE, rangeInt(1, 30), "day"),
      dependencies: [],
      completedAt: null,
    };
    state.tasks.push(task);
    return task;
  };

  // ============================
  // Task Status Updates
  // ============================
  const updateTaskStatus = (taskId) => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) throw new BusinessRuleError(`Cannot update unknown task ${taskId}`);
    const validTransitions = {
      todo: ["in_progress", "blocked", "done"],
      in_progress: ["todo", "blocked", "done"],
      blocked: ["todo", "in_progress", "done"],
      done: ["todo"],
    };
    const nextStatus = pick(Object.values(validTransitions[task.status]));
    if (nextStatus === "done") {
      task.completedAt = generateDate(BASE_DATE, 0, "day");
    }
    task.status = nextStatus;
    logAudit(task.customerId, task.accountId, "task_status_updated", "task", { taskId, from: task.status, to: nextStatus });
    return task;
  };

  // ============================
  // Permissions
  // ============================
  const checkPermission = (userId, resource, action) => {
    const user = state.userMap.get(userId);
    if (!user) throw new BusinessRuleError(`Unknown user ${userId}`);
    const rolePermissions = {
      owner: PERMISSION_ACTIONS,
      admin: ["read", "write", "admin"],
      manager: ["read", "write"],
      member: ["read"],
      viewer: ["read"],
    };
    const allowed = rolePermissions[user.role] || [];
    return allowed.includes(action);
  };

  // ============================
  // Analytics Aggregation
  // ============================
  const aggregateAnalytics = () => {
    const activeSubs = state.subscriptions.filter((s) => s.status === "active");
    const MRR = roundMoney(activeSubs.reduce((sum, s) => sum + s.monthlyAmount, 0));
    const ARR = roundMoney(MRR * 12);
    const totalCustomers = state.customers.length;
    const activeCustomers = state.customers.filter((c) => state.activeCustomers.has(c.id)).length;
    const churnedCustomers = state.customers.filter((c) => state.churnedCustomers.has(c.id)).length;
    const churnRate = roundMoney(totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0);
    const avgRevenue = roundMoney(totalCustomers > 0 ? MRR / totalCustomers : 0);
    const totalInvoices = state.invoices.length;
    const outstandingRevenue = roundMoney(state.invoices.reduce((sum, i) => sum + (i.status === "unpaid" ? i.amount : 0), 0));
    const totalPayments = roundMoney(state.payments.filter((p) => p.status === "succeeded").reduce((sum, p) => sum + p.amount, 0));
    const failedPayments = state.payments.filter((p) => p.status === "failed").length;
    const refunds = roundMoney(state.payments.filter((p) => p.status === "refunded").reduce((sum, p) => sum + p.refundAmount, 0));
    const openTickets = state.tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length;
    const resolvedTickets = state.tickets.filter((t) => t.status === "resolved");
    const averageResolutionTime = roundMoney(resolvedTickets.length > 0 ? resolvedTickets.reduce((sum, t) => sum + t.resolutionTime, 0) / resolvedTickets.length : 0);
    const pipelineValue = roundMoney(state.opportunities.filter((o) => o.stage === "negotiation" || o.stage === "proposal").reduce((sum, o) => sum + o.value, 0));
    const closedWonRevenue = roundMoney(state.opportunities.filter((o) => o.stage === "won").reduce((sum, o) => sum + o.wonValue, 0));
    const APIRequests = state.apiRequests.length;
    const APIErrors = state.apiRequests.filter((r) => r.status >= 400).length;

    return {
      totalCustomers,
      activeCustomers,
      churnedCustomers,
      MRR,
      ARR,
      averageRevenuePerCustomer: avgRevenue,
      churnRate,
      totalInvoices,
      outstandingRevenue,
      totalPayments,
      failedPayments,
      refunds,
      openTickets,
      averageResolutionTime,
      pipelineValue,
      closedWonRevenue,
      APIRequests,
      APIErrors,
    };
  };

  // ============================
  // Business Rules
  // ============================
  const applyVolumeDiscount = (plan) => {
    const monthlyRevenue = plan.monthlyPrice;
    let discount = plan.volumeDiscount;
    if (monthlyRevenue >= 2000) discount = Math.max(discount, 0.15);
    if (monthlyRevenue >= 5000) discount = Math.max(discount, 0.25);
    if (monthlyRevenue >= 10000) discount = Math.max(discount, 0.35);
    return roundMoney(monthlyRevenue * (1 - discount));
  };

  const canUpgrade = (account) => {
    if (!account) return false;
    return account.unpaidInvoiceCount === 0;
  };

  const determineSupportPriority = (customer) => {
    if (customer.lifetimeValue > 50000) return "critical";
    if (customer.lifetimeValue > 20000) return "high";
    if (customer.lifetimeValue > 5000) return "medium";
    return "low";
  };

  const getApiLimit = (plan) => {
    if (plan.tier === "basic") return 10000;
    if (plan.tier === "pro") return 100000;
    return 1000000;
  };

  const getFeatureAccess = (subscription) => {
    if (!subscription) return [];
    const plan = state.plans.find((p) => p.id === subscription.planId);
    return plan ? plan.features : [];
  };

  // ============================
  // Internal Helpers
  // ============================
  const subscriptionForInvoice = (invoice) => {
    if (!invoice) return null;
    return state.subscriptionMap.get(invoice.subscriptionId) || null;
  };

  const subscriptionsForCustomer = (customerId) => {
    return state.subscriptions.filter((s) => s.customerId === customerId);
  };

  const apiRequestsForCustomer = (customerId) => {
    return state.apiRequests.filter((r) => r.customerId === customerId);
  };

  // ============================
  // Main Simulation Flow
  // ============================
  async function main() {
    await generatePlans();
    await generateProducts();
    await generateCustomers();
    await generateAccountsAndUsers();
    await generateTeams();
    await generateSubscriptions();
    await generateContracts();
    await generateInvoicesAndPayments();
    await generateTickets();
    await generateOpportunities();
    await generateUsage();
    await generateApiRequests();
    await generateProjectsAndTasks();
    await processBusinessRules();
    await calculateMetrics();
    await runAssertions();
    return state;
  }

  // ============================
  // Generators
  // ============================
  async function generatePlans() {
    for (const tier of TIERS) {
      for (let i = 0; i < 5; i++) {
        const plan = createPlan(tier);
        plan.volumeDiscount = tier === "basic" ? 0 : tier === "pro" ? 0.1 : 0.2;
        state.plans.push(plan);
      }
    }
  }

  async function generateProducts() {
    for (let i = 0; i < 8; i++) {
      createProduct();
    }
  }

  async function generateCustomers() {
    for (let i = 0; i < 120; i++) {
      createCustomer();
    }
  }

  async function generateAccountsAndUsers() {
    for (const customer of state.customers) {
      const account = createAccount(customer.id);
      const userCount = rangeInt(2, 5);
      for (let i = 0; i < userCount; i++) {
        const user = createUser(account.id);
        if (i === 0) {
          user.role = "owner";
        } else {
          user.role = pick(ROLES);
        }
        const team = pick(state.teams.length > 0 ? state.teams : []);
        if (team) {
          user.teamId = team.id;
          team.members.push(user.id);
        }
        assignPermissions(user);
      }
    }
  }

  async function generateTeams() {
    for (let i = 0; i < 5; i++) {
      const team = {
        id: generateId("TEAM"),
        accountId: null,
        name: pick(TEAM_NAMES),
        createdAt: generateDate(BASE_DATE, rangeInt(-365, 30), "day"),
        members: [],
      };
      state.teams.push(team);
    }
  }

  async function generateSubscriptions() {
    for (const customer of state.customers) {
      const account = state.accountMap.get(customer.id);
      const subCount = rangeInt(1, 3);
      for (let i = 0; i < subCount; i++) {
        const plan = pick(state.plans);
        const product = pick(state.products);
        const status = chance(0.15) ? "trial" : chance(0.08) ? "cancelled" : "active";
        const subscription = createSubscription(customer.id, account.id, plan.id, product.id, status);
        subscription.discount = plan.volumeDiscount;
        subscription.monthlyAmount = applyVolumeDiscount(plan);
        if (status === "cancelled") {
          cancelSubscription(subscription.id);
        }
        customer.subscriptionCount += 1;
      }
    }
  }

  async function generateContracts() {
    for (const subscription of state.subscriptions) {
      if (subscription.status === "active") {
        createContract(subscription.customerId, subscription.accountId, subscription.id);
      }
    }
  }

  async function generateInvoicesAndPayments() {
    for (const subscription of state.subscriptions) {
      if (subscription.status === "cancelled") continue;
      const invoiceCount = rangeInt(1, 4);
      for (let i = 0; i < invoiceCount; i++) {
        const amount = roundMoney(subscription.monthlyAmount * (1 - subscription.discount));
        const invoice = generateInvoice(subscription.customerId, subscription.accountId, subscription.id, amount, "recurring");
        const payment = processPayment(invoice.id, invoice.amount, pick(PAYMENT_METHODS));
        if (payment.status === "succeeded") {
          const account = state.accountMap.get(invoice.accountId);
          if (account) {
            account.unpaidInvoiceCount = state.invoices.filter((inv) => inv.accountId === account.id && inv.status === "unpaid").length;
            account.outstandingBalance = roundMoney(state.invoices.filter((inv) => inv.accountId === account.id && inv.status === "unpaid").reduce((sum, inv) => sum + inv.amount, 0));
            account.totalRevenue = roundMoney(account.totalRevenue + invoice.amount);
          }
        }
      }
    }
  }

  async function generateTickets() {
    for (const customer of state.customers) {
      const ticketCount = rangeInt(0, 5);
      for (let i = 0; i < ticketCount; i++) {
        const subject = pick(["Login issue", "Billing question", "Feature request", "Integration problem", "Performance issue", "Data export", "Account access", "Refund request"]);
        createTicket(customer.id, customer.id, subject);
      }
    }
  }

  async function generateOpportunities() {
    for (const customer of state.customers) {
      const oppCount = rangeInt(0, 3);
      for (let i = 0; i < oppCount; i++) {
        const value = roundMoney(rangeInt(1000, 50000));
        createOpportunity(customer.id, customer.id, `${pick(["Upsell", "Cross-sell", "Expansion", "New Module", "Add-on"])}`, value);
      }
    }
  }

  async function generateUsage() {
    for (const subscription of state.subscriptions) {
      if (subscription.status === "cancelled") continue;
      const usageCount = rangeInt(5, 20);
      for (let i = 0; i < usageCount; i++) {
        const metric = pick(USAGE_METRICS);
        const value = roundMoney(rangeFloat(1, 10000));
        recordUsage(subscription.id, metric, value);
      }
    }
  }

  async function generateApiRequests() {
    for (const customer of state.customers) {
      const requestCount = rangeInt(10, 100);
      for (let i = 0; i < requestCount; i++) {
        checkApiLimit(customer.id, customer.id);
      }
    }
  }

  async function generateProjectsAndTasks() {
    for (const account of state.accounts) {
      const projectCount = rangeInt(1, 4);
      for (let i = 0; i < projectCount; i++) {
        const project = createProject(account.id);
        const taskCount = rangeInt(2, 6);
        const tasks = [];
        for (let j = 0; j < taskCount; j++) {
          const task = createTask(project.id, account.id);
          tasks.push(task);
        }
        // Assign tasks
        for (const user of state.users.filter((u) => u.accountId === account.id)) {
          if (tasks.length > 0) {
            task.assigneeId = user.id;
          }
        }
        // Dependencies
        for (let j = 1; j < tasks.length; j++) {
          if (chance(0.5)) {
            tasks[j].dependencies.push(tasks[j - 1].id);
          }
        }
        // Update statuses
        for (const task of tasks) {
          updateTaskStatus(task.id);
        }
      }
    }
  }

  async function processBusinessRules() {
    // Upgrade some active subscriptions
    for (const subscription of state.subscriptions) {
      if (subscription.status === "active" && chance(0.1)) {
        upgradeSubscription(subscription.id);
      }
    }
    // Downgrade some
    for (const subscription of state.subscriptions) {
      if (subscription.status === "active" && chance(0.05)) {
        downgradeSubscription(subscription.id);
      }
    }
    // Refund some payments
    for (const payment of state.payments) {
      if (payment.status === "succeeded" && chance(0.05)) {
        refundPayment(payment.id);
      }
    }
    // Issue some credits
    for (const customer of state.customers) {
      if (chance(0.05)) {
        issueCredit(customer.id, customer.id, roundMoney(rangeInt(50, 500)), "service_credit");
      }
    }
    // Close some opportunities
    for (const opportunity of state.opportunities) {
      if (opportunity.stage === "won" || opportunity.stage === "lost") continue;
      if (chance(0.3)) {
        closeOpportunity(opportunity.id, chance(0.6) ? "won" : "lost");
      }
    }
    // Resolve some tickets
    for (const ticket of state.tickets) {
      if (ticket.status === "open" || ticket.status === "in_progress") {
        if (chance(0.4)) {
          resolveTicket(ticket.id);
        }
      }
    }
    // Escalate some
    for (const ticket of state.tickets) {
      if (ticket.status === "escalated" && chance(0.2)) {
        escalateTicket(ticket.id);
      }
    }
    // Set feature flags
    for (const flag of FEATURE_FLAGS) {
      setFeatureFlag(flag, chance(0.5));
    }
    // Finalize account balances
    finalizeAccountBalances();
  }

  async function calculateMetrics() {
    state.metrics = aggregateAnalytics();
  }

  async function runAssertions() {
    const results = [];
    const assert = (name, condition) => {
      if (condition) {
        results.push({ name, passed: true });
      } else {
        results.push({ name, passed: false });
        throw new SimulationError(`Assertion failed: ${name}`);
      }
    };

    const m = state.metrics;
    assert("MRR is non-negative", m.MRR >= 0);
    assert("ARR equals MRR x 12", Math.abs(m.ARR - m.MRR * 12) < 0.01);
    assert("Cancelled subscriptions are not active", state.subscriptions.every((s) => s.status !== "active" || s.status !== "cancelled"));
    assert("Paid invoices have a payment", state.invoices.every((i) => i.status === "paid" ? !!i.paymentId : true));
    assert("Users belong to valid accounts", state.users.every((u) => state.accountMap.has(u.accountId)));
    assert("Enterprise plans have higher API limits than basic", state.plans.filter((p) => p.tier === "enterprise").every((p) => p.apiLimit > state.plans.filter((pp) => pp.tier === "basic")[0].apiLimit));
    assert("Closed-won opportunities have customers", state.opportunities.every((o) => o.stage === "won" ? !!state.customerMap.get(o.customerId) : true));
    assert("Refunds do not exceed original payment", state.payments.every((p) => p.status === "refunded" ? p.refundAmount <= p.amount : true));
    assert("At least 100 customers exist", state.customers.length >= 100);
    assert("All invoices reference valid customers", state.invoices.every((i) => state.customerMap.has(i.customerId)));
    assert("All subscriptions reference valid plans", state.subscriptions.every((s) => state.plans.some((p) => p.id === s.planId)));
    assert("All payments reference valid invoices", state.payments.every((p) => p.invoiceId ? state.invoiceMap.has(p.invoiceId) : true));
    assert("All tickets reference valid customers", state.tickets.every((t) => state.customerMap.has(t.customerId)));
    assert("All opportunities reference valid customers", state.opportunities.every((o) => state.customerMap.has(o.customerId)));
    assert("All users have valid account references", state.users.every((u) => state.accountMap.has(u.accountId)));
    assert("All subscriptions reference valid customers", state.subscriptions.every((s) => state.customerMap.has(s.customerId)));
    assert("All contracts reference valid subscriptions", state.contracts.every((c) => state.subscriptionMap.has(c.subscriptionId)));
    assert("All usage records reference valid subscriptions", state.usageRecords.every((u) => state.subscriptionMap.has(u.subscriptionId)));
    assert("All API requests reference valid customers", state.apiRequests.every((r) => state.customerMap.has(r.customerId)));
    assert("All audit logs have valid actions", state.auditLogs.every((a) => typeof a.action === "string"));
    assert("All notifications reference valid customers", state.notifications.every((n) => state.customerMap.has(n.customerId)));
    assert("All feature flags have boolean values", state.featureFlags.every((f) => typeof f.enabled === "boolean"));
    assert("All permissions have valid roles", state.permissions.every((p) => ROLES.includes(p.role)));
    assert("All teams reference valid accounts", state.teams.every((t) => state.accountMap.has(t.accountId)));
    assert("All projects reference valid accounts", state.projects.every((p) => state.accountMap.has(p.accountId)));
    assert("All tasks reference valid projects", state.tasks.every((t) => state.projects.some((pr) => pr.id === t.projectId)));
    assert("All tasks have valid assignees", state.tasks.every((t) => t.assigneeId ? state.userMap.has(t.assigneeId) : true));
    assert("All tasks respect dependencies", state.tasks.every((t) => t.dependencies.every((dep) => state.tasks.some((d) => d.id === dep))));
    assert("All payments have valid methods", state.payments.every((p) => PAYMENT_METHODS.includes(p.method)));
    assert("All tickets have valid priorities", state.tickets.every((t) => TICKET_PRIORITIES.includes(t.priority)));
    assert("All tickets have valid statuses", state.tickets.every((t) => TICKET_STATUSES.includes(t.status)));
    assert("All invoices have non-negative amounts", state.invoices.every((i) => i.amount >= 0));
    assert("All subscriptions have valid statuses", state.subscriptions.every((s) => SUBSCRIPTION_STATUSES.includes(s.status)));
    assert("Active customers are in active set", state.customers.every((c) => state.activeCustomers.has(c.id) || state.churnedCustomers.has(c.id)));
    assert("Churned customers are in churn set", state.customers.every((c) => state.churnedCustomers.has(c.id) || state.activeCustomers.has(c.id)));
    assert("Outstanding revenue is non-negative", m.outstandingRevenue >= 0);
    assert("Total payments >= failed payments", m.totalPayments >= m.failedPayments);
    assert("Open tickets count matches", m.openTickets === state.tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length);
    assert("Average resolution time is non-negative", m.averageResolutionTime >= 0);
    assert("Pipeline value is non-negative", m.pipelineValue >= 0);
    assert("Closed-won revenue is non-negative", m.closedWonRevenue >= 0);
    assert("API requests count matches", m.APIRequests === state.apiRequests.length);
    assert("API errors count matches", m.APIErrors === state.apiRequests.filter((r) => r.status >= 400).length);
    assert("All customers have valid emails", state.customers.every((c) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)));
    assert("All customers have valid names", state.customers.every((c) => typeof c.name === "string" && c.name.length > 0));
    assert("All plans have positive prices", state.plans.every((p) => p.monthlyPrice > 0));
    assert("All products have valid SKUs", state.products.every((p) => typeof p.sku === "string" && p.sku.length > 0));
    assert("All subscriptions have start before end", state.subscriptions.every((s) => s.startDate <= s.endDate));
    assert("All invoices have due dates", state.invoices.every((i) => i.dueDate instanceof Date));
    assert("All payments have timestamps", state.payments.every((p) => p.createdAt instanceof Date));
    assert("All tickets have subjects", state.tickets.every((t) => typeof t.subject === "string" && t.subject.length > 0));
    assert("All opportunities have values", state.opportunities.every((o) => o.value > 0));
    assert("All users have roles", state.users.every((u) => ROLES.includes(u.role)));

    return results;
  }

  // ============================
  // Permission Assignment
  // ============================
  const assignPermissions = (user) => {
    const base = { resource: "customers", action: "read" };
    if (user.role === "owner" || user.role === "admin") {
      state.permissions.push({ id: generateId("PERM"), userId: user.id, accountId: user.accountId, role: user.role, resource: "customers", action: "admin" });
      state.permissions.push({ id: generateId("PERM"), userId: user.id, accountId: user.accountId, role: user.role, resource: "invoices", action: "write" });
      state.permissions.push({ id: generateId("PERM"), userId: user.id, accountId: user.accountId, role: user.role, resource: "subscriptions", action: "write" });
    } else if (user.role === "manager") {
      state.permissions.push({ id: generateId("PERM"), userId: user.id, accountId: user.accountId, role: user.role, resource: "tickets", action: "write" });
    } else if (user.role === "member") {
      state.permissions.push({ id: generateId("PERM"), userId: user.id, accountId: user.accountId, role: user.role, resource: "tickets", action: "read" });
    }
  };

  // ============================
  // Account Balance Finalization
  // ============================
  const finalizeAccountBalances = () => {
    for (const account of state.accounts) {
      const unpaid = state.invoices.filter((i) => i.accountId === account.id && i.status === "unpaid");
      account.unpaidInvoiceCount = unpaid.length;
      account.outstandingBalance = roundMoney(unpaid.reduce((sum, i) => sum + i.amount, 0));
      const paid = state.invoices.filter((i) => i.accountId === account.id && i.status === "paid");
      account.totalRevenue = roundMoney(paid.reduce((sum, i) => sum + i.amount, 0));
    }
  };

  // ============================
  // Kick Off
  // ============================
  await main();

  const results = state.metrics;
  console.log("=== Enterprise SaaS Simulation Summary ===");
  console.log(`Customers: ${results.totalCustomers} (active: ${results.activeCustomers}, churned: ${results.churnedCustomers})`);
  console.log(`MRR: $${results.MRR} | ARR: $${results.ARR}`);
  console.log(`Avg Revenue/Customer: $${results.averageRevenuePerCustomer} | Churn Rate: ${results.churnRate}%`);
  console.log(`Invoices: ${results.totalInvoices} | Outstanding: $${results.outstandingRevenue}`);
  console.log(`Payments: $${results.totalPayments} | Failed: ${results.failedPayments} | Refunds: $${results.refunds}`);
  console.log(`Open Tickets: ${results.openTickets} | Avg Resolution: ${results.averageResolutionTime}m`);
  console.log(`Pipeline: $${results.pipelineValue} | Closed Won: $${results.closedWonRevenue}`);
  console.log(`API Requests: ${results.APIRequests} | API Errors: ${results.APIErrors}`);
  console.log("All invariants validated successfully.");

  return state;
}

module.exports = runEnterpriseSimulation;

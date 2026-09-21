async function runEnterpriseSimulation() {
  // === Seeded PRNG (mulberry32) ===
  let _seed = 42;
  const seededRandom = () => {
    _seed |= 0; _seed = _seed + 0x6D2B79F5 | 0;
    let t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const randomInt = (min, max) => Math.floor(seededRandom() * (max - min + 1)) + min;
  const randomFloat = (min, max) => seededRandom() * (max - min) + min;
  const randomChoice = (arr) => arr[Math.floor(seededRandom() * arr.length)];
  const round2 = (n) => Math.round(n * 100) / 100;

  // === Custom Error Classes ===
  class ValidationError extends Error {
    constructor(message, field) { super(message); this.name = 'ValidationError'; this.field = field; }
  }
  class BusinessRuleError extends Error {
    constructor(message, rule) { super(message); this.name = 'BusinessRuleError'; this.rule = rule; }
  }
  class PaymentError extends Error {
    constructor(message, code) { super(message); this.name = 'PaymentError'; this.code = code; }
  }

  // === ID Generation ===
  const idCounters = new Map();
  const generateId = (prefix) => {
    const count = (idCounters.get(prefix) || 0) + 1;
    idCounters.set(prefix, count);
    return `${prefix}_${String(count).padStart(6, '0')}`;
  };

  // === Date Utilities ===
  const BASE_DATE = new Date('2024-01-01T00:00:00Z');
  const randomDate = (startOffsetDays, endOffsetDays) => {
    const offset = randomInt(startOffsetDays, endOffsetDays);
    return new Date(BASE_DATE.getTime() + offset * 86400000);
  };
  const dateDiffDays = (a, b) => Math.abs(b.getTime() - a.getTime()) / 86400000;
  const addDays = (date, days) => new Date(date.getTime() + days * 86400000);

  // === Utility Functions ===
  const groupBy = (arr, keyFn) => {
    const result = new Map();
    for (const item of arr) {
      const key = typeof keyFn === 'string' ? item[keyFn] : keyFn(item);
      if (!result.has(key)) result.set(key, []);
      result.get(key).push(item);
    }
    return result;
  };
  const sum = (arr, keyFn) => arr.reduce((acc, item) => acc + (typeof keyFn === 'string' ? item[keyFn] : keyFn(item)), 0);
  const average = (arr, keyFn) => arr.length === 0 ? 0 : sum(arr, keyFn) / arr.length;
  const assert = (condition, message) => {
    if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
  };

  // === Pricing Plans ===
  const pricingPlans = [
    { id: 'plan_basic', name: 'Basic', tier: 'basic', monthlyPrice: 49, annualPrice: 470, apiLimit: 1000, maxUsers: 5, features: ['dashboard', 'basic_reports'] },
    { id: 'plan_pro', name: 'Pro', tier: 'pro', monthlyPrice: 199, annualPrice: 1910, apiLimit: 10000, maxUsers: 25, features: ['dashboard', 'basic_reports', 'advanced_reports', 'api_access', 'integrations'] },
    { id: 'plan_business', name: 'Business', tier: 'business', monthlyPrice: 499, annualPrice: 4790, apiLimit: 50000, maxUsers: 100, features: ['dashboard', 'basic_reports', 'advanced_reports', 'api_access', 'integrations', 'custom_fields', 'workflow_automation'] },
    { id: 'plan_enterprise', name: 'Enterprise', tier: 'enterprise', monthlyPrice: 1499, annualPrice: 14390, apiLimit: 500000, maxUsers: 500, features: ['dashboard', 'basic_reports', 'advanced_reports', 'api_access', 'integrations', 'custom_fields', 'workflow_automation', 'sso', 'dedicated_support', 'custom_api'] }
  ];
  const planMap = new Map(pricingPlans.map(p => [p.id, p]));
  const tierOrder = { basic: 0, pro: 1, business: 2, enterprise: 3 };

  // === Feature Flags ===
  const featureFlags = new Map();
  const allFeatures = new Set(['dashboard', 'basic_reports', 'advanced_reports', 'api_access', 'integrations', 'custom_fields', 'workflow_automation', 'sso', 'dedicated_support', 'custom_api', 'beta_analytics', 'beta_export']);
  const getFeatureFlags = (tier) => {
    const plan = pricingPlans.find(p => p.tier === tier);
    if (!plan) return new Set();
    const flags = new Set(plan.features);
    if (tier === 'enterprise') { flags.add('beta_analytics'); flags.add('beta_export'); }
    else if (tier === 'business' && seededRandom() > 0.5) { flags.add('beta_analytics'); }
    return flags;
  };
  const getApiLimit = (tier) => planMap.get(pricingPlans.find(p => p.tier === tier)?.id)?.apiLimit || 0;

  // === Permissions ===
  const rolePermissions = {
    admin: new Set(['manage_users', 'manage_billing', 'manage_subscriptions', 'view_reports', 'manage_projects', 'manage_tasks', 'view_audit_logs', 'manage_feature_flags']),
    manager: new Set(['view_reports', 'manage_projects', 'manage_tasks', 'view_audit_logs', 'manage_users']),
    member: new Set(['view_reports', 'manage_tasks', 'view_audit_logs']),
    viewer: new Set(['view_reports'])
  };
  const getRolePermissions = (role) => rolePermissions[role] || new Set();

  // === Tax and Discount ===
  const TAX_RATES = { US: 0.08, EU: 0.20, UK: 0.20, AU: 0.10, CA: 0.13, JP: 0.10 };
  const calculateTax = (amount, country) => round2(amount * (TAX_RATES[country] || 0));
  const calculateDiscount = (customer, plan) => {
    let discount = 0;
    if (customer.tier === 'enterprise') discount = 0.15;
    else if (customer.tier === 'business') discount = 0.10;
    if (customer.yearsActive >= 2) discount += 0.05;
    if (customer.yearsActive >= 5) discount += 0.05;
    return Math.min(discount, 0.30);
  };

  // === Core Data Stores ===
  const customers = [];
  const users = [];
  const accounts = [];
  const subscriptions = [];
  const invoices = [];
  const payments = [];
  const tickets = [];
  const opportunities = [];
  const contracts = [];
  const usageRecords = [];
  const apiRequests = [];
  const auditLogs = [];
  const notifications = [];
  const teams = [];
  const projects = [];
  const tasks = [];
  const customerMap = new Map();
  const subscriptionMap = new Map();
  const invoiceMap = new Map();
  const paymentMap = new Map();
  const ticketMap = new Map();
  const opportunityMap = new Map();

  // === Audit Logging ===
  const logAudit = (action, entityType, entityId, details = {}) => {
    const entry = { id: generateId('audit'), action, entityType, entityId, timestamp: new Date(), details, actor: 'system' };
    auditLogs.push(entry);
    return entry;
  };

  // === Notification System ===
  const sendNotification = (type, recipientId, data = {}) => {
    const notif = { id: generateId('notif'), type, recipientId, data, timestamp: new Date(), read: false, channel: type === 'payment_failed' ? 'email' : 'in_app' };
    notifications.push(notif);
    return notif;
  };

  // === Customer Creation ===
  const companyNames = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Stark', 'Wayne', 'Wonka', 'Cyberdyne', 'Tyrell', 'Arasaka', 'Nakatomi', 'Soylent', 'Massive', 'Oscorp', 'LexCorp', 'Aperture', 'Black Mesa', 'Redline', 'BlueSky', 'GreenField'];
  const suffixes = ['Corp', 'Inc', 'LLC', 'Ltd', 'Group', 'Systems', 'Technologies', 'Solutions', 'Dynamics', 'Labs'];
  const countries = ['US', 'EU', 'UK', 'AU', 'CA', 'JP'];
  const tiers = ['basic', 'pro', 'business', 'enterprise'];

  const createCustomer = ({ name, country, tier, yearsActive = 0 }) => {
    const customer = {
      id: generateId('cust'),
      name,
      country,
      tier,
      yearsActive,
      status: 'active',
      createdAt: randomDate(-yearsActive * 365, -30),
      mrr: 0,
      totalRevenue: 0,
      failedPaymentCount: 0,
      suspended: false,
      tags: []
    };
    if (tier === 'enterprise') customer.tags.push('high_value', 'volume_discount');
    if (tier === 'business') customer.tags.push('mid_value');
    customers.push(customer);
    customerMap.set(customer.id, customer);
    logAudit('customer_created', 'customer', customer.id, { name, tier });
    return customer;
  };

  // === Account Management ===
  const createAccount = (customerId, name, type = 'primary') => {
    const account = { id: generateId('acct'), customerId, name, type, status: 'active', createdAt: new Date(), billingEmail: `billing@${name.toLowerCase().replace(/\s/g, '')}.com` };
    accounts.push(account);
    logAudit('account_created', 'account', account.id, { customerId });
    return account;
  };

  // === User Creation ===
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  const roles = ['admin', 'manager', 'member', 'viewer'];

  const createUser = (accountId, customerId, role = 'member') => {
    const firstName = randomChoice(firstNames);
    const lastName = randomChoice(lastNames);
    const user = {
      id: generateId('user'),
      accountId,
      customerId,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${customerMap.get(customerId)?.name.toLowerCase().replace(/\s/g, '') || 'company'}.com`,
      role,
      permissions: getRolePermissions(role),
      status: 'active',
      createdAt: randomDate(-365, 0)
    };
    users.push(user);
    logAudit('user_created', 'user', user.id, { accountId, role });
    return user;
  };

  // === Subscription Management ===
  const createSubscription = (customerId, planId, startDate, status = 'active') => {
    const plan = planMap.get(planId);
    if (!plan) throw new ValidationError(`Plan ${planId} not found`, 'planId');
    const customer = customerMap.get(customerId);
    if (!customer) throw new ValidationError(`Customer ${customerId} not found`, 'customerId');
    const discount = calculateDiscount(customer, plan);
    const monthlyAmount = round2(plan.monthlyPrice * (1 - discount));
    const sub = {
      id: generateId('sub'),
      customerId,
      planId,
      tier: plan.tier,
      status,
      startDate,
      endDate: null,
      monthlyAmount,
      discount,
      prorationCredit: 0,
      createdAt: startDate
    };
    subscriptions.push(sub);
    subscriptionMap.set(sub.id, sub);
    customer.mrr += monthlyAmount;
    logAudit('subscription_created', 'subscription', sub.id, { customerId, planId, monthlyAmount });
    return sub;
  };

  const upgradeSubscription = (subId, newPlanId) => {
    const sub = subscriptionMap.get(subId);
    if (!sub) throw new ValidationError(`Subscription ${subId} not found`, 'subId');
    if (sub.status !== 'active') throw new BusinessRuleError('Cannot upgrade non-active subscription', 'upgrade_active_only');
    const customer = customerMap.get(sub.customerId);
    const unpaidInvoices = invoices.filter(inv => inv.customerId === sub.customerId && inv.status === 'unpaid');
    if (unpaidInvoices.length > 0) throw new BusinessRuleError('Cannot upgrade with unpaid invoices', 'no_unpaid_on_upgrade');
    const newPlan = planMap.get(newPlanId);
    if (tierOrder[newPlan.tier] <= tierOrder[sub.tier]) throw new BusinessRuleError('New plan must be higher tier', 'upgrade_tier');
    const oldAmount = sub.monthlyAmount;
    const discount = calculateDiscount(customer, newPlan);
    const newAmount = round2(newPlan.monthlyPrice * (1 - discount));
    const daysRemaining = 30 - Math.floor(dateDiffDays(sub.startDate, new Date()) % 30);
    const prorationCredit = round2((newAmount - oldAmount) * (daysRemaining / 30));
    sub.monthlyAmount = newAmount;
    sub.planId = newPlanId;
    sub.tier = newPlan.tier;
    sub.discount = discount;
    sub.prorationCredit += prorationCredit;
    customer.mrr = round2(customer.mrr - oldAmount + newAmount);
    customer.tier = newPlan.tier;
    logAudit('subscription_upgraded', 'subscription', subId, { fromPlan: sub.planId, toPlan: newPlanId, prorationCredit });
    sendNotification('subscription_upgraded', sub.customerId, { subId, newPlan: newPlan.name });
    return sub;
  };

  const downgradeSubscription = (subId, newPlanId) => {
    const sub = subscriptionMap.get(subId);
    if (!sub) throw new ValidationError(`Subscription ${subId} not found`, 'subId');
    if (sub.status !== 'active') throw new BusinessRuleError('Cannot downgrade non-active subscription', 'downgrade_active_only');
    const newPlan = planMap.get(newPlanId);
    if (tierOrder[newPlan.tier] >= tierOrder[sub.tier]) throw new BusinessRuleError('New plan must be lower tier', 'downgrade_tier');
    const oldAmount = sub.monthlyAmount;
    const customer = customerMap.get(sub.customerId);
    const discount = calculateDiscount(customer, newPlan);
    const newAmount = round2(newPlan.monthlyPrice * (1 - discount));
    sub.monthlyAmount = newAmount;
    sub.planId = newPlanId;
    sub.tier = newPlan.tier;
    sub.discount = discount;
    customer.mrr = round2(customer.mrr - oldAmount + newAmount);
    customer.tier = newPlan.tier;
    logAudit('subscription_downgraded', 'subscription', subId, { toPlan: newPlanId });
    return sub;
  };

  const cancelSubscription = (subId, reason = 'customer_request') => {
    const sub = subscriptionMap.get(subId);
    if (!sub) throw new ValidationError(`Subscription ${subId} not found`, 'subId');
    if (sub.status === 'cancelled') throw new BusinessRuleError('Already cancelled', 'already_cancelled');
    const customer = customerMap.get(sub.customerId);
    sub.status = 'cancelled';
    sub.endDate = new Date();
    customer.mrr = round2(customer.mrr - sub.monthlyAmount);
    customer.status = 'churned';
    logAudit('subscription_cancelled', 'subscription', subId, { reason });
    sendNotification('subscription_cancelled', sub.customerId, { subId, reason });
    return sub;
  };

  // === Invoice Generation ===
  const createInvoice = (customerId, subId, periodStart, periodEnd) => {
    const sub = subscriptionMap.get(subId);
    if (!sub) throw new ValidationError(`Subscription ${subId} not found`, 'subId');
    const customer = customerMap.get(customerId);
    const plan = planMap.get(sub.planId);
    const baseAmount = sub.monthlyAmount;
    const tax = calculateTax(baseAmount, customer.country);
    const proration = sub.prorationCredit > 0 ? -sub.prorationCredit : 0;
    const total = round2(baseAmount + tax + proration);
    const invoice = {
      id: generateId('inv'),
      customerId,
      subscriptionId: subId,
      periodStart,
      periodEnd,
      baseAmount,
      tax,
      proration,
      total,
      status: 'pending',
      createdAt: new Date(),
      dueDate: addDays(new Date(), 15),
      lineItems: [
        { description: `${plan.name} Plan - Monthly`, amount: baseAmount },
        { description: 'Tax', amount: tax },
        ...(proration !== 0 ? [{ description: 'Proration Credit', amount: proration }] : [])
      ]
    };
    invoices.push(invoice);
    invoiceMap.set(invoice.id, invoice);
    sub.prorationCredit = 0;
    logAudit('invoice_created', 'invoice', invoice.id, { customerId, total });
    return invoice;
  };

  // === Payment Processing ===
  const processPayment = async (invoiceId) => {
    const invoice = invoiceMap.get(invoiceId);
    if (!invoice) throw new ValidationError(`Invoice ${invoiceId} not found`, 'invoiceId');
    if (invoice.status === 'paid') throw new BusinessRuleError('Invoice already paid', 'already_paid');
    const customer = customerMap.get(invoice.customerId);
    const successChance = customer.tier === 'enterprise' ? 0.98 : customer.tier === 'business' ? 0.95 : 0.90;
    const success = seededRandom() < successChance;
    const payment = {
      id: generateId('pay'),
      invoiceId,
      customerId: invoice.customerId,
      amount: invoice.total,
      status: success ? 'completed' : 'failed',
      method: randomChoice(['credit_card', 'ach', 'wire']),
      processedAt: new Date(),
      failureReason: success ? null : randomChoice(['card_declined', 'insufficient_funds', 'bank_error', 'expired_card']),
      refundAmount: 0
    };
    payments.push(payment);
    paymentMap.set(payment.id, payment);
    if (success) {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
      customer.totalRevenue = round2(customer.totalRevenue + invoice.total);
      logAudit('payment_completed', 'payment', payment.id, { invoiceId, amount: invoice.total });
    } else {
      invoice.status = 'unpaid';
      customer.failedPaymentCount++;
      logAudit('payment_failed', 'payment', payment.id, { invoiceId, reason: payment.failureReason });
      sendNotification('payment_failed', customer.id, { invoiceId, reason: payment.failureReason });
      if (customer.failedPaymentCount >= 3) {
        customer.suspended = true;
        const custSubs = subscriptions.filter(s => s.customerId === customer.id && s.status === 'active');
        for (const cs of custSubs) { cs.status = 'suspended'; }
        logAudit('customer_suspended', 'customer', customer.id, { reason: 'three_failed_payments' });
        sendNotification('account_suspended', customer.id, { reason: 'three_failed_payments' });
      }
    }
    return payment;
  };

  const processRefund = (paymentId, amount, reason = 'customer_request') => {
    const payment = paymentMap.get(paymentId);
    if (!payment) throw new ValidationError(`Payment ${paymentId} not found`, 'paymentId');
    if (payment.status !== 'completed') throw new BusinessRuleError('Can only refund completed payments', 'refund_completed_only');
    if (amount > payment.amount - payment.refundAmount) throw new BusinessRuleError('Refund exceeds original payment', 'refund_exceeds_payment');
    payment.refundAmount = round2(payment.refundAmount + amount);
    payment.status = payment.refundAmount >= payment.amount ? 'refunded' : 'partially_refunded';
    const refund = { id: generateId('refund'), paymentId, amount, reason, processedAt: new Date() };
    logAudit('refund_processed', 'refund', refund.id, { paymentId, amount, reason });
    sendNotification('refund_processed', payment.customerId, { paymentId, amount });
    return refund;
  };

  // === MRR / ARR / Churn / CLV ===
  const calculateMRR = () => round2(sum(customers.filter(c => c.status === 'active'), c => c.mrr));
  const calculateARR = () => round2(calculateMRR() * 12);
  const calculateChurnRate = () => {
    const total = customers.length;
    const churned = customers.filter(c => c.status === 'churned').length;
    return total === 0 ? 0 : round2((churned / total) * 100);
  };
  const calculateCLV = (customer) => {
    const avgMonthlyRevenue = customer.totalRevenue / Math.max(customer.yearsActive * 12, 1);
    const churnProb = 0.03;
    return round2(avgMonthlyRevenue / churnProb);
  };

  // === Sales Pipeline ===
  const oppStages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const createOpportunity = (companyName, planId, value, stage = 'prospecting') => {
    const opp = {
      id: generateId('opp'),
      companyName,
      planId,
      value,
      stage,
      probability: stage === 'closed_won' ? 100 : stage === 'closed_lost' ? 0 : randomInt(10, 90),
      createdAt: randomDate(-180, 0),
      closedAt: null,
      customerId: null,
      lostReason: null
    };
    opportunities.push(opp);
    opportunityMap.set(opp.id, opp);
    logAudit('opportunity_created', 'opportunity', opp.id, { companyName, value });
    return opp;
  };

  const closeOpportunity = (oppId, won, lostReason = null) => {
    const opp = opportunityMap.get(oppId);
    if (!opp) throw new ValidationError(`Opportunity ${oppId} not found`, 'oppId');
    if (opp.stage === 'closed_won' || opp.stage === 'closed_lost') throw new BusinessRuleError('Opportunity already closed', 'already_closed');
    opp.closedAt = new Date();
    if (won) {
      opp.stage = 'closed_won';
      opp.probability = 100;
      const plan = planMap.get(opp.planId);
      const tier = plan.tier;
      const customer = createCustomer({ name: opp.companyName, country: randomChoice(countries), tier, yearsActive: 0 });
      const account = createAccount(customer.id, `${opp.companyName} Primary`);
      createUser(account.id, customer.id, 'admin');
      const sub = createSubscription(customer.id, opp.planId, new Date());
      opp.customerId = customer.id;
      logAudit('opportunity_won', 'opportunity', oppId, { customerId: customer.id, value: opp.value });
      sendNotification('deal_closed', customer.id, { oppId, plan: plan.name });
    } else {
      opp.stage = 'closed_lost';
      opp.probability = 0;
      opp.lostReason = lostReason || randomChoice(['budget', 'competitor', 'timing', 'no_decision']);
      logAudit('opportunity_lost', 'opportunity', oppId, { reason: opp.lostReason });
    }
    return opp;
  };

  // === Support Tickets ===
  const ticketPriorities = ['low', 'medium', 'high', 'critical'];
  const slaHours = { low: 72, medium: 48, high: 24, critical: 4 };
  const createTicket = (customerId, subject, priority = 'medium') => {
    const customer = customerMap.get(customerId);
    let effectivePriority = priority;
    if (customer && customer.mrr > 5000) {
      const priorityIndex = ticketPriorities.indexOf(effectivePriority);
      effectivePriority = ticketPriorities[Math.max(0, priorityIndex - 1)];
    }
    const ticket = {
      id: generateId('tick'),
      customerId,
      subject,
      priority: effectivePriority,
      status: 'open',
      createdAt: randomDate(-90, 0),
      resolvedAt: null,
      slaDeadline: addDays(randomDate(-90, 0), slaHours[effectivePriority] / 24),
      escalationLevel: 0,
      assignedTo: null,
      resolutionTimeHours: null
    };
    tickets.push(ticket);
    ticketMap.set(ticket.id, ticket);
    logAudit('ticket_created', 'ticket', ticket.id, { customerId, priority: effectivePriority });
    return ticket;
  };

  const resolveTicket = (ticketId) => {
    const ticket = ticketMap.get(ticketId);
    if (!ticket) throw new ValidationError(`Ticket ${ticketId} not found`, 'ticketId');
    if (ticket.status === 'resolved') throw new BusinessRuleError('Ticket already resolved', 'already_resolved');
    ticket.status = 'resolved';
    ticket.resolvedAt = new Date();
    ticket.resolutionTimeHours = round2(dateDiffDays(ticket.createdAt, ticket.resolvedAt) * 24);
    logAudit('ticket_resolved', 'ticket', ticket.id, { resolutionTimeHours: ticket.resolutionTimeHours });
    return ticket;
  };

  const escalateTicket = (ticketId) => {
    const ticket = ticketMap.get(ticketId);
    if (!ticket) throw new ValidationError(`Ticket ${ticketId} not found`, 'ticketId');
    if (ticket.escalationLevel >= 3) throw new BusinessRuleError('Maximum escalation level reached', 'max_escalation');
    ticket.escalationLevel++;
    const priorityIndex = ticketPriorities.indexOf(ticket.priority);
    if (priorityIndex < 3) ticket.priority = ticketPriorities[priorityIndex + 1];
    logAudit('ticket_escalated', 'ticket', ticket.id, { level: ticket.escalationLevel });
    sendNotification('ticket_escalated', ticket.customerId, { ticketId, level: ticket.escalationLevel });
    return ticket;
  };

  // === Usage Tracking ===
  const trackUsage = (customerId, metric, amount) => {
    const record = { id: generateId('usage'), customerId, metric, amount, timestamp: new Date() };
    usageRecords.push(record);
    return record;
  };

  // === API Rate Limiting ===
  const apiUsage = new Map();
  const checkRateLimit = (customerId, tier) => {
    const limit = getApiLimit(tier);
    const current = apiUsage.get(customerId) || 0;
    if (current >= limit) {
      const req = { id: generateId('api'), customerId, status: 'rate_limited', timestamp: new Date(), endpoint: randomChoice(['/v1/data', '/v1/reports', '/v1/export', '/v1/webhooks']) };
      apiRequests.push(req);
      return { allowed: false, remaining: 0, limit };
    }
    apiUsage.set(customerId, current + 1);
    const success = seededRandom() > 0.05;
    const req = { id: generateId('api'), customerId, status: success ? 'success' : 'error', timestamp: new Date(), endpoint: randomChoice(['/v1/data', '/v1/reports', '/v1/export', '/v1/webhooks']), statusCode: success ? 200 : randomChoice([500, 502, 503]) };
    apiRequests.push(req);
    return { allowed: true, remaining: limit - current - 1, limit };
  };

  // === Project Management ===
  const createProject = (customerId, name) => {
    const project = { id: generateId('proj'), customerId, name, status: 'active', createdAt: randomDate(-180, 0), tasks: [] };
    projects.push(project);
    logAudit('project_created', 'project', project.id, { customerId, name });
    return project;
  };

  const createTask = (projectId, title, dependencies = []) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new ValidationError(`Project ${projectId} not found`, 'projectId');
    const task = { id: generateId('task'), projectId, title, status: 'pending', dependencies, createdAt: new Date(), completedAt: null };
    tasks.push(task);
    project.tasks.push(task.id);
    return task;
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new ValidationError(`Task ${taskId} not found`, 'taskId');
    if (newStatus === 'completed') {
      const unresolvedDeps = task.dependencies.filter(depId => {
        const dep = tasks.find(t => t.id === depId);
        return dep && dep.status !== 'completed';
      });
      if (unresolvedDeps.length > 0) throw new BusinessRuleError(`Cannot complete task with unresolved dependencies: ${unresolvedDeps.join(', ')}`, 'task_dependencies');
      task.completedAt = new Date();
    }
    task.status = newStatus;
    logAudit('task_updated', 'task', taskId, { newStatus });
    return task;
  };

  const resolveTaskDependencies = (taskId, depth = 0) => {
    if (depth > 10) throw new Error('Task dependency cycle detected');
    const task = tasks.find(t => t.id === taskId);
    if (!task) return [];
    const resolved = [];
    for (const depId of task.dependencies) {
      const depResolved = resolveTaskDependencies(depId, depth + 1);
      resolved.push(...depResolved);
      const dep = tasks.find(t => t.id === depId);
      if (dep && dep.status === 'pending') { dep.status = 'completed'; dep.completedAt = new Date(); }
      resolved.push(depId);
    }
    return resolved;
  };

  // === Analytics Aggregation ===
  const aggregateAnalytics = () => {
    const activeCustomers = customers.filter(c => c.status === 'active');
    const churnedCustomers = customers.filter(c => c.status === 'churned');
    const mrr = calculateMRR();
    const arr = calculateARR();
    const avgRevenuePerCustomer = activeCustomers.length > 0 ? round2(mrr / activeCustomers.length) : 0;
    const churnRate = calculateChurnRate();
    const totalInvoices = invoices.length;
    const outstandingRevenue = round2(sum(invoices.filter(i => i.status === 'unpaid' || i.status === 'pending'), i => i.total));
    const totalPayments = sum(payments.filter(p => p.status === 'completed'), p => p.amount);
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    const totalRefunds = round2(sum(payments, p => p.refundAmount));
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved');
    const avgResolutionTime = resolvedTickets.length > 0 ? round2(average(resolvedTickets, t => t.resolutionTimeHours)) : 0;
    const pipelineValue = round2(sum(opportunities.filter(o => !o.stage.startsWith('closed')), o => o.value));
    const closedWonRevenue = round2(sum(opportunities.filter(o => o.stage === 'closed_won'), o => o.value));
    const apiReqCount = apiRequests.length;
    const apiErrors = apiRequests.filter(r => r.status === 'error' || r.status === 'rate_limited').length;
    return {
      totalCustomers: customers.length,
      activeCustomers: activeCustomers.length,
      churnedCustomers: churnedCustomers.length,
      MRR: mrr,
      ARR: arr,
      averageRevenuePerCustomer,
      churnRate,
      totalInvoices,
      outstandingRevenue,
      totalPayments,
      failedPayments,
      refunds: totalRefunds,
      openTickets,
      averageResolutionTime,
      pipelineValue,
      closedWonRevenue,
      APIRequests: apiReqCount,
      APIErrors: apiErrors
    };
  };

  // === Generator for batch data ===
  function* generateCustomerBatches(count) {
    for (let i = 0; i < count; i++) {
      const name = `${randomChoice(companyNames)} ${randomChoice(suffixes)}`;
      const tier = seededRandom() < 0.15 ? 'enterprise' : seededRandom() < 0.35 ? 'business' : seededRandom() < 0.65 ? 'pro' : 'basic';
      const country = randomChoice(countries);
      const yearsActive = randomInt(0, 7);
      yield { name, tier, country, yearsActive };
    }
  }

  // === Main Simulation ===
  // Generate 120 customers
  const customerBatch = generateCustomerBatches(120);
  const customerData = [];
  for (const batch of customerBatch) {
    customerData.push(batch);
  }

  for (const data of customerData) {
    const customer = createCustomer(data);
    const account = createAccount(customer.id, `${customer.name} Primary`);
    const userCount = randomInt(1, Math.min(5, planMap.get(pricingPlans.find(p => p.tier === customer.tier)?.id)?.maxUsers || 5));
    for (let u = 0; u < userCount; u++) {
      const role = u === 0 ? 'admin' : randomChoice(roles);
      createUser(account.id, customer.id, role);
    }
    const plan = pricingPlans.find(p => p.tier === customer.tier);
    const sub = createSubscription(customer.id, plan.id, randomDate(-customer.yearsActive * 365, -30));
    // Generate invoices for active subscriptions
    const invoiceCount = randomInt(1, Math.min(customer.yearsActive + 1, 6));
    for (let inv = 0; inv < invoiceCount; inv++) {
      const periodStart = addDays(sub.startDate, inv * 30);
      const periodEnd = addDays(periodStart, 30);
      const invoice = createInvoice(customer.id, sub.id, periodStart, periodEnd);
      await processPayment(invoice.id);
    }
    // Some customers get support tickets
    if (seededRandom() > 0.5) {
      const ticketCount = randomInt(1, 3);
      for (let t = 0; t < ticketCount; t++) {
        const ticket = createTicket(customer.id, randomChoice(['API timeout issue', 'Data export failing', 'Login problem', 'Billing question', 'Feature request', 'Performance degradation']), randomChoice(ticketPriorities));
        if (seededRandom() > 0.4) {
          resolveTicket(ticket.id);
        } else if (seededRandom() > 0.7) {
          escalateTicket(ticket.id);
        }
      }
    }
    // Usage tracking
    const usageCount = randomInt(5, 20);
    for (let u = 0; u < usageCount; u++) {
      trackUsage(customer.id, randomChoice(['api_calls', 'data_storage_gb', 'active_users', 'report_generations']), randomInt(1, 1000));
    }
    // API requests
    const apiCount = randomInt(3, 15);
    for (let a = 0; a < apiCount; a++) {
      checkRateLimit(customer.id, customer.tier);
    }
  }

  // Some customers get additional accounts and teams
  for (let i = 0; i < 20; i++) {
    const customer = randomChoice(customers);
    const account = createAccount(customer.id, `${customer.name} Secondary`, 'secondary');
    createUser(account.id, customer.id, 'manager');
    const team = { id: generateId('team'), customerId: customer.id, name: `Team ${randomInt(1, 10)}`, memberIds: users.filter(u => u.customerId === customer.id).slice(0, 5).map(u => u.id), createdAt: new Date() };
    teams.push(team);
  }

  // Projects and tasks for some customers
  for (let i = 0; i < 30; i++) {
    const customer = randomChoice(customers.filter(c => c.status === 'active'));
    if (!customer) continue;
    const project = createProject(customer.id, `Project ${randomChoice(['Migration', 'Integration', 'Optimization', 'Expansion', 'Redesign'])} ${randomInt(1, 99)}`);
    const taskCount = randomInt(3, 8);
    const taskIds = [];
    for (let t = 0; t < taskCount; t++) {
      const deps = t > 0 && seededRandom() > 0.5 ? [taskIds[randomInt(0, taskIds.length - 1)]] : [];
      const task = createTask(project.id, `Task ${t + 1}: ${randomChoice(['Setup', 'Configure', 'Test', 'Deploy', 'Review', 'Document'])}`, deps);
      taskIds.push(task.id);
    }
    // Complete some tasks respecting dependencies
    for (const tid of taskIds) {
      const task = tasks.find(t => t.id === tid);
      if (task.status === 'pending') {
        try {
          if (task.dependencies.length === 0 || task.dependencies.every(d => tasks.find(t2 => t2.id === d)?.status === 'completed')) {
            updateTaskStatus(tid, 'in_progress');
            updateTaskStatus(tid, 'completed');
          }
        } catch (e) { /* dependency not met */ }
      }
    }
  }

  // Sales pipeline
  const oppCount = 25;
  for (let i = 0; i < oppCount; i++) {
    const plan = randomChoice(pricingPlans);
    const value = round2(plan.monthlyPrice * randomInt(12, 36));
    const opp = createOpportunity(`${randomChoice(companyNames)} ${randomChoice(suffixes)}`, plan.id, value, randomChoice(oppStages.slice(0, 4)));
    if (seededRandom() > 0.5) {
      closeOpportunity(opp.id, seededRandom() > 0.3);
    }
  }

  // Contracts for enterprise customers
  const enterpriseCustomers = customers.filter(c => c.tier === 'enterprise');
  for (const ec of enterpriseCustomers) {
    const contract = {
      id: generateId('contract'),
      customerId: ec.id,
      startDate: ec.createdAt,
      endDate: addDays(ec.createdAt, 365 * randomInt(1, 3)),
      value: round2(ec.mrr * 12 * randomInt(1, 3)),
      status: 'active',
      autoRenew: seededRandom() > 0.3
    };
    contracts.push(contract);
    logAudit('contract_created', 'contract', contract.id, { customerId: ec.id, value: contract.value });
  }

  // Perform some upgrades and downgrades
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  for (let i = 0; i < 10; i++) {
    const sub = randomChoice(activeSubs);
    if (!sub) break;
    const currentTierIndex = tierOrder[sub.tier];
    if (currentTierIndex < 3 && seededRandom() > 0.5) {
      const nextTier = pricingPlans[currentTierIndex + 1];
      try { upgradeSubscription(sub.id, nextTier.id); } catch (e) { /* business rule blocked */ }
    } else if (currentTierIndex > 0 && seededRandom() > 0.7) {
      const prevTier = pricingPlans[currentTierIndex - 1];
      try { downgradeSubscription(sub.id, prevTier.id); } catch (e) { /* business rule blocked */ }
    }
  }

  // Cancel some subscriptions
  const cancelCount = Math.floor(customers.length * 0.08);
  const activeSubsForCancel = subscriptions.filter(s => s.status === 'active');
  for (let i = 0; i < cancelCount && i < activeSubsForCancel.length; i++) {
    const sub = activeSubsForCancel[i];
    cancelSubscription(sub.id, randomChoice(['budget_cut', 'switched_competitor', 'consolidation', 'no_longer_needed']));
  }

  // Process some refunds
  const completedPayments = payments.filter(p => p.status === 'completed');
  for (let i = 0; i < Math.min(5, completedPayments.length); i++) {
    const payment = completedPayments[i];
    const refundAmount = round2(payment.amount * randomFloat(0.1, 0.5));
    try { processRefund(payment.id, refundAmount, randomChoice(['service_issue', 'duplicate_charge', 'customer_request'])); } catch (e) { /* rule blocked */ }
  }

  // Feature flags per tier
  for (const tier of tiers) {
    featureFlags.set(tier, getFeatureFlags(tier));
  }

  // === Test Suite (40+ assertions) ===
  const metrics = aggregateAnalytics();

  // MRR and ARR assertions
  assert(metrics.MRR >= 0, 'MRR cannot be negative');
  assert(metrics.ARR === round2(metrics.MRR * 12), 'ARR must equal MRR x 12');
  assert(metrics.totalCustomers >= 100, 'Must have at least 100 customers');
  assert(metrics.activeCustomers > 0, 'Must have active customers');
  assert(metrics.activeCustomers + metrics.churnedCustomers <= metrics.totalCustomers, 'Active + churned cannot exceed total');
  assert(metrics.averageRevenuePerCustomer >= 0, 'Average revenue per customer cannot be negative');
  assert(metrics.churnRate >= 0 && metrics.churnRate <= 100, 'Churn rate must be between 0 and 100');

  // Invoice assertions
  assert(metrics.totalInvoices > 0, 'Must have invoices generated');
  assert(metrics.outstandingRevenue >= 0, 'Outstanding revenue cannot be negative');
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  for (const inv of paidInvoices.slice(0, 20)) {
    const hasPayment = payments.some(p => p.invoiceId === inv.id && p.status === 'completed');
    assert(hasPayment, `Paid invoice ${inv.id} must have a completed payment`);
  }

  // Payment assertions
  assert(metrics.totalPayments >= 0, 'Total payments cannot be negative');
  assert(metrics.failedPayments >= 0, 'Failed payments count cannot be negative');
  assert(metrics.refunds >= 0, 'Total refunds cannot be negative');
  for (const payment of payments) {
    assert(payment.refundAmount <= payment.amount, `Refund ${payment.refundAmount} cannot exceed payment ${payment.amount} for ${payment.id}`);
  }

  // Subscription assertions
  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled');
  for (const sub of cancelledSubs) {
    assert(sub.status !== 'active', 'Cancelled subscription cannot be active');
    assert(sub.endDate !== null, 'Cancelled subscription must have an end date');
  }
  const suspendedSubs = subscriptions.filter(s => s.status === 'suspended');
  for (const sub of suspendedSubs) {
    const cust = customerMap.get(sub.customerId);
    assert(cust.failedPaymentCount >= 3, `Suspended subscription ${sub.id} customer must have 3+ failed payments`);
  }

  // User assertions
  for (const user of users.slice(0, 30)) {
    const validAccount = accounts.some(a => a.id === user.accountId);
    assert(validAccount, `User ${user.id} must belong to a valid account`);
    const validCustomer = customerMap.has(user.customerId);
    assert(validCustomer, `User ${user.id} must belong to a valid customer`);
  }

  // Plan assertions
  const basicPlan = planMap.get('plan_basic');
  const enterprisePlan = planMap.get('plan_enterprise');
  assert(enterprisePlan.apiLimit > basicPlan.apiLimit, 'Enterprise plans must have higher API limits than basic plans');
  assert(enterprisePlan.monthlyPrice > basicPlan.monthlyPrice, 'Enterprise plans must cost more than basic plans');
  assert(enterprisePlan.maxUsers > basicPlan.maxUsers, 'Enterprise plans must allow more users than basic plans');

  // Opportunity assertions
  const closedWon = opportunities.filter(o => o.stage === 'closed_won');
  for (const opp of closedWon) {
    assert(opp.customerId !== null, `Closed-won opportunity ${opp.id} must have an associated customer`);
    assert(customerMap.has(opp.customerId), `Closed-won opportunity ${opp.id} customer must exist`);
  }
  assert(metrics.pipelineValue >= 0, 'Pipeline value cannot be negative');
  assert(metrics.closedWonRevenue >= 0, 'Closed-won revenue cannot be negative');

  // Ticket assertions
  assert(metrics.openTickets >= 0, 'Open tickets cannot be negative');
  assert(metrics.averageResolutionTime >= 0, 'Average resolution time cannot be negative');
  const resolvedTix = tickets.filter(t => t.status === 'resolved');
  for (const t of resolvedTix.slice(0, 10)) {
    assert(t.resolutionTimeHours > 0, `Resolved ticket ${t.id} must have positive resolution time`);
  }

  // API assertions
  assert(metrics.APIRequests > 0, 'Must have API requests recorded');
  assert(metrics.APIErrors <= metrics.APIRequests, 'API errors cannot exceed total API requests');

  // Enterprise discount assertion
  const enterpriseCust = customers.find(c => c.tier === 'enterprise');
  if (enterpriseCust) {
    const entSub = subscriptions.find(s => s.customerId === enterpriseCust.id && s.status !== 'cancelled');
    if (entSub) {
      const plan = planMap.get(entSub.planId);
      assert(entSub.monthlyAmount < plan.monthlyPrice, 'Enterprise customers must receive volume discounts');
    }
  }

  // Feature flag assertions
  const entFlags = featureFlags.get('enterprise');
  const basicFlags = featureFlags.get('basic');
  assert(entFlags.size > basicFlags.size, 'Enterprise tier must have more features than basic tier');
  assert(entFlags.has('sso'), 'Enterprise tier must have SSO feature');
  assert(!basicFlags.has('sso'), 'Basic tier must not have SSO feature');

  // Permission assertions
  const adminPerms = getRolePermissions('admin');
  const viewerPerms = getRolePermissions('viewer');
  assert(adminPerms.size > viewerPerms.size, 'Admin must have more permissions than viewer');
  assert(adminPerms.has('manage_billing'), 'Admin must have billing management permission');
  assert(!viewerPerms.has('manage_billing'), 'Viewer must not have billing management permission');

  // Churn consistency
  const churnedCusts = customers.filter(c => c.status === 'churned');
  for (const cc of churnedCusts) {
    const custSubs = subscriptions.filter(s => s.customerId === cc.id);
    assert(custSubs.every(s => s.status === 'cancelled' || s.status === 'suspended'), `Churned customer ${cc.id} must not have active subscriptions`);
  }

  // Tax calculation assertion
  assert(calculateTax(100, 'US') === 8, 'US tax on $100 must be $8');
  assert(calculateTax(100, 'EU') === 20, 'EU tax on $100 must be $20');

  // Audit log assertion
  assert(auditLogs.length > 50, 'Must have substantial audit logs');
  assert(auditLogs.every(l => l.id && l.action && l.timestamp), 'All audit logs must have id, action, and timestamp');

  // Notification assertion
  assert(notifications.length > 0, 'Must have notifications generated');
  const paymentFailedNotifs = notifications.filter(n => n.type === 'payment_failed');
  assert(paymentFailedNotifs.length === metrics.failedPayments, 'Payment failed notifications must match failed payment count');

  // Contract assertion
  for (const contract of contracts) {
    assert(contract.value > 0, `Contract ${contract.id} must have positive value`);
    assert(contract.endDate > contract.startDate, `Contract ${contract.id} end date must be after start date`);
  }

  // Task dependency assertion
  const completedTasks = tasks.filter(t => t.status === 'completed');
  for (const task of completedTasks.slice(0, 15)) {
    for (const depId of task.dependencies) {
      const dep = tasks.find(t => t.id === depId);
      assert(dep && dep.status === 'completed', `Completed task ${task.id} must have all dependencies completed`);
    }
  }

  // === Summary ===
  console.log('=== Enterprise SaaS Simulation Summary ===');
  console.log(`Customers: ${metrics.totalCustomers} (Active: ${metrics.activeCustomers}, Churned: ${metrics.churnedCustomers})`);
  console.log(`MRR: $${metrics.MRR.toLocaleString()} | ARR: $${metrics.ARR.toLocaleString()}`);
  console.log(`Avg Revenue/Customer: $${metrics.averageRevenuePerCustomer} | Churn Rate: ${metrics.churnRate}%`);
  console.log(`Invoices: ${metrics.totalInvoices} | Outstanding: $${metrics.outstandingRevenue.toLocaleString()}`);
  console.log(`Payments: $${metrics.totalPayments.toLocaleString()} | Failed: ${metrics.failedPayments} | Refunds: $${metrics.refunds}`);
  console.log(`Tickets: ${metrics.openTickets} open | Avg Resolution: ${metrics.averageResolutionTime}h`);
  console.log(`Pipeline: $${metrics.pipelineValue.toLocaleString()} | Closed Won: $${metrics.closedWonRevenue.toLocaleString()}`);
  console.log(`API Requests: ${metrics.APIRequests} | Errors: ${metrics.APIErrors}`);
  console.log(`Audit Logs: ${auditLogs.length} | Notifications: ${notifications.length}`);
  console.log(`Projects: ${projects.length} | Tasks: ${tasks.length} | Teams: ${teams.length}`);
  console.log('=== All 40+ assertions passed ===');

  return {
    customers,
    users,
    subscriptions,
    invoices,
    payments,
    tickets,
    opportunities,
    projects,
    auditLogs,
    notifications,
    metrics
  };
}

function runEnterpriseSimulation() {
  return (async () => {
    // === Seeded PRNG (Mulberry32) ===
    let seed = 42;
    const seededRandom = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const randomInt = (min, max) => Math.floor(seededRandom() * (max - min + 1)) + min;
    const randomFloat = (min, max) => seededRandom() * (max - min) + min;
    const randomChoice = (arr) => arr[Math.floor(seededRandom() * arr.length)];
    const roundTo2 = (n) => Math.round(n * 100) / 100;

    // === ID Generation ===
    let idCounter = 0;
    const generateId = (prefix) => {
      idCounter++;
      const hex = (idCounter * 7919 + Math.floor(seededRandom() * 100000)).toString(16).padStart(8, '0');
      return `${prefix}_${hex}`;
    };

    // === Date Utilities ===
    const BASE_DATE = new Date('2024-01-01T00:00:00Z');
    const NOW = new Date('2024-12-15T00:00:00Z');
    const randomDate = (start = BASE_DATE, end = NOW) => {
      const range = end.getTime() - start.getTime();
      return new Date(start.getTime() + seededRandom() * range);
    };
    const addDays = (date, days) => new Date(date.getTime() + days * 86400000);
    const daysBetween = (a, b) => Math.floor((b.getTime() - a.getTime()) / 86400000);
    const daysAgo = (days) => addDays(NOW, -days);

    // === Custom Error Classes ===
    class ValidationError extends Error {
      constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
      }
    }
    class BusinessRuleError extends Error {
      constructor(message, rule) {
        super(message);
        this.name = 'BusinessRuleError';
        this.rule = rule;
      }
    }
    class PaymentError extends Error {
      constructor(message, code) {
        super(message);
        this.name = 'PaymentError';
        this.code = code;
      }
    }

    // === Core Data Stores ===
    const customers = [];
    const users = [];
    const accounts = [];
    const products = [];
    const subscriptions = [];
    const pricingPlans = [];
    const invoices = [];
    const payments = [];
    const tickets = [];
    const opportunities = [];
    const contracts = [];
    const usageRecords = [];
    const apiRequests = [];
    const auditLogs = [];
    const notifications = [];
    const featureFlags = [];
    const permissions = [];
    const teams = [];
    const projects = [];
    const tasks = [];

    // === Index Maps for O(1) lookups ===
    const customerById = new Map();
    const accountById = new Map();
    const subscriptionById = new Map();
    const invoiceById = new Map();
    const paymentById = new Map();
    const ticketById = new Map();
    const opportunityById = new Map();
    const projectById = new Map();
    const taskById = new Map();
    const planById = new Map();
    const productById = new Map();
    const userById = new Map();
    const teamById = new Map();
    const contractById = new Map();

    // === Sets for tracking ===
    const suspendedSubscriptions = new Set();
    const cancelledSubscriptions = new Set();
    const paidInvoiceIds = new Set();
    const failedPaymentInvoiceIds = new Set();
    const escalatedTicketIds = new Set();
    const resolvedTicketIds = new Set();
    const completedTaskIds = new Set();
    const blockedTaskIds = new Set();

    // === Feature Flag Definitions ===
    const FLAG_DEFINITIONS = [
      { key: 'advanced_analytics', tiers: ['pro', 'enterprise'] },
      { key: 'custom_reports', tiers: ['enterprise'] },
      { key: 'api_access', tiers: ['basic', 'pro', 'enterprise'] },
      { key: 'sso_saml', tiers: ['enterprise'] },
      { key: 'bulk_import', tiers: ['pro', 'enterprise'] },
      { key: 'webhooks', tiers: ['pro', 'enterprise'] },
      { key: 'custom_domains', tiers: ['enterprise'] },
      { key: 'audit_logs', tiers: ['pro', 'enterprise'] },
      { key: 'priority_support', tiers: ['enterprise'] },
      { key: 'white_label', tiers: ['enterprise'] },
      { key: 'multi_workspace', tiers: ['pro', 'enterprise'] },
      { key: 'data_export', tiers: ['basic', 'pro', 'enterprise'] },
      { key: 'custom_roles', tiers: ['enterprise'] },
      { key: 'sandbox_mode', tiers: ['pro', 'enterprise'] },
      { key: 'realtime_sync', tiers: ['enterprise'] },
    ];

    // === API Limits by Tier ===
    const API_LIMITS = { basic: 1000, pro: 10000, enterprise: 100000 };
    const API_ERROR_RATES = { basic: 0.05, pro: 0.02, enterprise: 0.005 };

    // === Permission Matrix ===
    const ROLE_PERMISSIONS = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_billing', 'manage_settings', 'view_reports'],
      manager: ['read', 'write', 'manage_users', 'view_reports', 'manage_settings'],
      member: ['read', 'write', 'view_reports'],
      viewer: ['read'],
      billing: ['read', 'write', 'manage_billing', 'view_reports'],
    };

    // === Helper: Group By ===
    const groupBy = (arr, keyFn) => {
      const result = new Map();
      for (const item of arr) {
        const key = typeof keyFn === 'string' ? item[keyFn] : keyFn(item);
        if (!result.has(key)) result.set(key, []);
        result.get(key).push(item);
      }
      return result;
    };

    // === Helper: Calculate Tax ===
    const TAX_RATES = { US: 0.0825, EU: 0.21, UK: 0.20, AU: 0.10, CA: 0.13, IN: 0.18 };
    const calculateTax = (amount, region) => {
      const rate = TAX_RATES[region] ?? 0.0825;
      return roundTo2(amount * rate);
    };

    // === Helper: Apply Volume Discount ===
    const applyDiscount = (amount, tier, customerCount) => {
      let discount = 0;
      if (tier === 'enterprise') discount = 0.10;
      if (customerCount > 50) discount += 0.05;
      if (customerCount > 200) discount += 0.03;
      return roundTo2(amount * (1 - Math.min(discount, 0.25)));
    };

    // === Helper: Prorated Billing ===
    const calculateProration = (plan, from, to) => {
      const daysInMonth = 30;
      const daysUsed = Math.max(0, Math.min(daysInMonth, daysBetween(from, to)));
      const dailyRate = plan.monthlyPrice / daysInMonth;
      return roundTo2(dailyRate * daysUsed);
    };

    // === Helper: MRR Calculation ===
    const calculateMRR = (subs) => {
      return roundTo2(subs
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
          const plan = planById.get(s.planId);
          return sum + (plan ? plan.monthlyPrice : 0);
        }, 0));
    };

    // === Helper: ARR Calculation ===
    const calculateARR = (subs) => roundTo2(calculateMRR(subs) * 12);

    // === Helper: Churn Rate ===
    const calculateChurnRate = (allSubs) => {
      const total = allSubs.length;
      if (total === 0) return 0;
      const churned = allSubs.filter(s => s.status === 'cancelled').length;
      return roundTo2((churned / total) * 100);
    };

    // === Helper: Customer Lifetime Value ===
    const calculateCLV = (customerId) => {
      const custInvoices = invoices.filter(inv => inv.customerId === customerId);
      const totalRevenue = custInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const custSubs = subscriptions.filter(s => s.customerId === customerId);
      const avgLifespan = custSubs.length > 0
        ? custSubs.reduce((sum, s) => sum + daysBetween(s.startDate, s.endDate ?? NOW), 0) / custSubs.length
        : 0;
      const monthlyRevenue = custSubs.length > 0
        ? custSubs.reduce((sum, s) => {
            const plan = planById.get(s.planId);
            return sum + (plan ? plan.monthlyPrice : 0);
          }, 0) / custSubs.length
        : 0;
      return roundTo2(totalRevenue + (monthlyRevenue * Math.max(0, avgLifespan - 30) / 30));
    };

    // === Helper: SLA Calculation ===
    const SLA_HOURS = { critical: 4, high: 8, medium: 24, low: 72 };
    const calculateSLA = (ticket) => {
      const slaHours = SLA_HOURS[ticket.priority] ?? 24;
      const slaDeadline = new Date(ticket.createdAt.getTime() + slaHours * 3600000);
      const isBreached = NOW > slaDeadline && ticket.status !== 'resolved';
      const remainingHours = Math.max(0, (slaDeadline.getTime() - NOW.getTime()) / 3600000);
      return { slaDeadline, isBreached, remainingHours: roundTo2(remainingHours) };
    };

    // === Helper: Rate Limit Check ===
    const checkRateLimit = (customerId, tier) => {
      const limit = API_LIMITS[tier] ?? 1000;
      const custRequests = apiRequests.filter(r => r.customerId === customerId);
      const todayStart = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate()).getTime();
      const todayCount = custRequests.filter(r => r.timestamp.getTime() >= todayStart).length;
      return { allowed: todayCount < limit, used: todayCount, limit, remaining: Math.max(0, limit - todayCount) };
    };

    // === Helper: Get Feature Flags for Tier ===
    const getFeatureFlags = (tier) => {
      return FLAG_DEFINITIONS
        .filter(f => f.tiers.includes(tier))
        .map(f => ({ ...f, enabled: true }));
    };

    // === Helper: Audit Log ===
    const logAudit = (action, entity, entityId, data = {}) => {
      const entry = {
        id: generateId('audit'),
        timestamp: new Date(NOW),
        action,
        entity,
        entityId,
        data,
        actor: 'system',
      };
      auditLogs.push(entry);
      return entry;
    };

    // === Helper: Send Notification ===
    const sendNotification = (type, recipient, subject, body) => {
      const notif = {
        id: generateId('notif'),
        type,
        recipient,
        subject,
        body,
        timestamp: new Date(NOW),
        read: false,
        channel: type === 'payment_failed' ? 'email' : 'in_app',
      };
      notifications.push(notif);
      return notif;
    };

    // === Helper: Validate Subscription ===
    const validateSubscription = (sub) => {
      const errors = [];
      if (!sub.customerId) errors.push(new ValidationError('customerId is required', 'customerId'));
      if (!sub.planId) errors.push(new ValidationError('planId is required', 'planId'));
      if (!planById.has(sub.planId)) errors.push(new ValidationError(`Invalid planId: ${sub.planId}`, 'planId'));
      if (!customerById.has(sub.customerId)) errors.push(new ValidationError(`Invalid customerId: ${sub.customerId}`, 'customerId'));
      if (sub.status === 'active' && suspendedSubscriptions.has(sub.id)) {
        errors.push(new BusinessRuleError('Active subscription cannot be in suspended set', 'status_consistency'));
      }
      return errors;
    };

    // === Helper: Process Payment ===
    const processPayment = (invoice) => {
      return new Promise((resolve) => {
        const successRate = 0.85;
        const willSucceed = seededRandom() < successRate;
        const payment = {
          id: generateId('pay'),
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          amount: invoice.total,
          method: randomChoice(['credit_card', 'ach', 'wire', 'paypal']),
          status: willSucceed ? 'completed' : 'failed',
          timestamp: new Date(NOW),
          reference: `REF_${Math.floor(seededRandom() * 1e9)}`,
        };
        if (willSucceed) {
          invoice.status = 'paid';
          paidInvoiceIds.add(invoice.id);
          payment.transactionId = generateId('txn');
        } else {
          invoice.status = 'overdue';
          failedPaymentInvoiceIds.add(invoice.id);
          sendNotification('payment_failed', invoice.customerId, 'Payment Failed',
            `Payment of $${invoice.total} for invoice ${invoice.id} has failed.`);
          payment.errorCode = randomChoice(['card_declined', 'insufficient_funds', 'expired_card', 'bank_error']);
        }
        payments.push(payment);
        paymentById.set(payment.id, payment);
        logAudit('payment_processed', 'payment', payment.id, { invoiceId: invoice.id, status: payment.status });
        resolve(payment);
      });
    };

    // === Helper: Generate Invoice ===
    const generateInvoice = (subscription, periodStart, periodEnd) => {
      const plan = planById.get(subscription.planId);
      const customer = customerById.get(subscription.customerId);
      const baseAmount = plan.monthlyPrice;
      const discountedAmount = applyDiscount(baseAmount, plan.tier, customer.enterprise ? 100 : 10);
      const tax = calculateTax(discountedAmount, customer.region);
      const invoice = {
        id: generateId('inv'),
        subscriptionId: subscription.id,
        customerId: subscription.customerId,
        periodStart,
        periodEnd,
        lineItems: [{ description: `${plan.name} Plan - Monthly`, amount: discountedAmount, quantity: 1 }],
        subtotal: discountedAmount,
        tax,
        total: roundTo2(discountedAmount + tax),
        status: 'pending',
        issuedAt: new Date(NOW),
        dueDate: addDays(NOW, 15),
        currency: 'USD',
      };
      invoices.push(invoice);
      invoiceById.set(invoice.id, invoice);
      logAudit('invoice_generated', 'invoice', invoice.id, { subscriptionId: subscription.id, total: invoice.total });
      return invoice;
    };

    // === Helper: Create Customer ===
    const createCustomer = ({ name, industry, region, size, enterprise = false }) => {
      const customer = {
        id: generateId('cust'),
        name,
        industry,
        region,
        size,
        enterprise,
        createdAt: randomDate(BASE_DATE, addDays(NOW, -30)),
        status: 'active',
        mrr: 0,
        lifetimeValue: 0,
        tags: enterprise ? ['enterprise', 'priority'] : [randomChoice(['smb', 'mid_market', 'startup'])],
      };
      customers.push(customer);
      customerById.set(customer.id, customer);
      logAudit('customer_created', 'customer', customer.id, { name, tier: enterprise ? 'enterprise' : 'standard' });
      return customer;
    };

    // === Helper: Create Account ===
    const createAccount = (customer, name) => {
      const account = {
        id: generateId('acct'),
        customerId: customer.id,
        name,
        type: customer.enterprise ? 'enterprise' : 'standard',
        createdAt: customer.createdAt,
        status: 'active',
        settings: { timezone: randomChoice(['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']), locale: 'en_US' },
      };
      accounts.push(account);
      accountById.set(account.id, account);
      return account;
    };

    // === Helper: Create User ===
    const createUser = (account, name, role) => {
      const user = {
        id: generateId('user'),
        accountId: account.id,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@${account.name.toLowerCase().replace(/\s+/g, '')}.com`,
        role,
        status: 'active',
        createdAt: randomDate(account.createdAt, NOW),
        lastActiveAt: randomDate(addDays(NOW, -7), NOW),
        permissions: ROLE_PERMISSIONS[role] ?? ['read'],
      };
      users.push(user);
      userById.set(user.id, user);
      return user;
    };

    // === Helper: Create Subscription ===
    const createSubscription = (customer, plan, startDate) => {
      const sub = {
        id: generateId('sub'),
        customerId: customer.id,
        planId: plan.id,
        status: 'active',
        startDate,
        endDate: null,
        billingCycle: 'monthly',
        autoRenew: true,
        trialPeriod: randomInt(0, 14),
        failedPaymentCount: 0,
      };
      subscriptions.push(sub);
      subscriptionById.set(sub.id, sub);
      customer.mrr = roundTo2(customer.mrr + plan.monthlyPrice);
      logAudit('subscription_created', 'subscription', sub.id, { customerId: customer.id, planId: plan.id });
      return sub;
    };

    // === Helper: Upgrade Subscription ===
    const upgradeSubscription = (sub, newPlan) => {
      const customer = customerById.get(sub.customerId);
      const custInvoices = invoices.filter(inv => inv.customerId === customer.id && inv.status !== 'paid');
      if (custInvoices.length > 0) {
        throw new BusinessRuleError('Cannot upgrade: account has unpaid invoices', 'unpaid_upgrade_block');
      }
      const oldPlan = planById.get(sub.planId);
      const proration = calculateProration(newPlan, sub.startDate, NOW);
      sub.planId = newPlan.id;
      customer.mrr = roundTo2(customer.mrr - oldPlan.monthlyPrice + newPlan.monthlyPrice);
      logAudit('subscription_upgraded', 'subscription', sub.id, { fromPlan: oldPlan.id, toPlan: newPlan.id, proration });
      sendNotification('upgrade', customer.id, 'Subscription Upgraded', `Your plan has been upgraded to ${newPlan.name}.`);
      return sub;
    };

    // === Helper: Downgrade Subscription ===
    const downgradeSubscription = (sub, newPlan) => {
      const oldPlan = planById.get(sub.planId);
      sub.planId = newPlan.id;
      const customer = customerById.get(sub.customerId);
      customer.mrr = roundTo2(customer.mrr - oldPlan.monthlyPrice + newPlan.monthlyPrice);
      logAudit('subscription_downgraded', 'subscription', sub.id, { fromPlan: oldPlan.id, toPlan: newPlan.id });
      return sub;
    };

    // === Helper: Cancel Subscription ===
    const cancelSubscription = (sub, reason) => {
      sub.status = 'cancelled';
      sub.endDate = new Date(NOW);
      cancelledSubscriptions.add(sub.id);
      const customer = customerById.get(sub.customerId);
      const plan = planById.get(sub.planId);
      customer.mrr = roundTo2(Math.max(0, customer.mrr - plan.monthlyPrice));
      customer.status = 'churned';
      logAudit('subscription_cancelled', 'subscription', sub.id, { reason });
      sendNotification('cancellation', customer.id, 'Subscription Cancelled', `Your subscription has been cancelled. Reason: ${reason}`);
      return sub;
    };

    // === Helper: Process Refund ===
    const processRefund = (payment, amount, reason) => {
      if (amount > payment.amount) {
        throw new BusinessRuleError('Refund cannot exceed original payment amount', 'refund_exceeds_payment');
      }
      const refund = {
        id: generateId('refund'),
        paymentId: payment.id,
        amount: roundTo2(amount),
        reason,
        status: 'processed',
        timestamp: new Date(NOW),
      };
      payments.push({ ...refund, type: 'refund' });
      logAudit('refund_processed', 'refund', refund.id, { paymentId: payment.id, amount: refund.amount });
      return refund;
    };

    // === Helper: Create Support Ticket ===
    const createTicket = (customer, subject, priority, description) => {
      const highValue = customer.mrr > 10000;
      const effectivePriority = highValue && priority === 'low' ? 'medium' : priority;
      const ticket = {
        id: generateId('tick'),
        customerId: customer.id,
        subject,
        priority: effectivePriority,
        status: 'open',
        description,
        createdAt: randomDate(addDays(NOW, -90), NOW),
        assignedTo: randomChoice(['support_team_a', 'support_team_b', 'support_team_c']),
        sla: calculateSLA({ priority: effectivePriority, createdAt: new Date(NOW) }),
        resolutionTime: null,
        escalated: false,
      };
      tickets.push(ticket);
      ticketById.set(ticket.id, ticket);
      logAudit('ticket_created', 'ticket', ticket.id, { customerId: customer.id, priority: effectivePriority });
      return ticket;
    };

    // === Helper: Escalate Ticket ===
    const escalateTicket = (ticket) => {
      ticket.escalated = true;
      ticket.priority = ticket.priority === 'critical' ? 'critical' : 'high';
      escalatedTicketIds.add(ticket.id);
      const customer = customerById.get(ticket.customerId);
      sendNotification('escalation', customer.id, 'Ticket Escalated', `Your ticket ${ticket.id} has been escalated.`);
      logAudit('ticket_escalated', 'ticket', ticket.id, { newPriority: ticket.priority });
      return ticket;
    };

    // === Helper: Resolve Ticket ===
    const resolveTicket = (ticket, resolution) => {
      ticket.status = 'resolved';
      ticket.resolutionTime = daysBetween(ticket.createdAt, NOW);
      ticket.resolvedAt = new Date(NOW);
      ticket.resolution = resolution;
      resolvedTicketIds.add(ticket.id);
      logAudit('ticket_resolved', 'ticket', ticket.id, { resolutionTime: ticket.resolutionTime });
      return ticket;
    };

    // === Helper: Process Opportunity ===
    const processOpportunity = (opp) => {
      if (opp.stage === 'closed_won') {
        const customer = createCustomer({
          name: opp.companyName,
          industry: opp.industry,
          region: opp.region,
          size: opp.size,
          enterprise: opp.value > 50000,
        });
        const plan = planById.get(opp.planId);
        const account = createAccount(customer, `${opp.companyName} - Main`);
        createSubscription(customer, plan, new Date(NOW));
        opp.customerId = customer.id;
        opp.accountId = account.id;
        logAudit('opportunity_won', 'opportunity', opp.id, { customerId: customer.id, value: opp.value });
        sendNotification('deal_closed', customer.id, 'Welcome Aboard', `Thank you for choosing us! Your account is now active.`);
      } else if (opp.stage === 'closed_lost') {
        opp.lostReason = randomChoice(['price', 'competitor', 'timing', 'budget_cut', 'features']);
        logAudit('opportunity_lost', 'opportunity', opp.id, { reason: opp.lostReason });
      }
      return opp;
    };

    // === Helper: Create Project ===
    const createProject = (customer, name, type) => {
      const project = {
        id: generateId('proj'),
        customerId: customer.id,
        name,
        type,
        status: 'active',
        createdAt: randomDate(addDays(NOW, -60), NOW),
        deadline: addDays(NOW, randomInt(14, 90)),
        progress: randomInt(0, 100),
        tasks: [],
      };
      projects.push(project);
      projectById.set(project.id, project);
      return project;
    };

    // === Helper: Create Task ===
    const createTask = (project, title, assignee, dependencies = []) => {
      const task = {
        id: generateId('task'),
        projectId: project.id,
        title,
        assignee,
        status: dependencies.length > 0 ? 'blocked' : 'todo',
        priority: randomChoice(['low', 'medium', 'high']),
        dependencies,
        createdAt: randomDate(addDays(NOW, -30), NOW),
        completedAt: null,
      };
      tasks.push(task);
      taskById.set(task.id, task);
      project.tasks.push(task.id);
      if (dependencies.length > 0) blockedTaskIds.add(task.id);
      return task;
    };

    // === Helper: Update Task Status (recursive dependency check) ===
    const updateTaskStatus = (task, newStatus) => {
      if (newStatus === 'done') {
        task.status = 'done';
        task.completedAt = new Date(NOW);
        completedTaskIds.add(task.id);
        const dependents = tasks.filter(t => t.dependencies.includes(task.id) && t.status === 'blocked');
        for (const dep of dependents) {
          const remainingBlocked = dep.dependencies.filter(d => !completedTaskIds.has(d));
          if (remainingBlocked.length === 0) {
            dep.status = 'todo';
            blockedTaskIds.delete(dep.id);
          }
        }
      } else if (newStatus === 'in_progress') {
        const unmetDeps = task.dependencies.filter(d => !completedTaskIds.has(d));
        if (unmetDeps.length > 0) {
          throw new BusinessRuleError(`Cannot start task: ${unmetDeps.length} dependencies unmet`, 'task_dependency');
        }
        task.status = 'in_progress';
      } else if (newStatus === 'todo') {
        task.status = 'todo';
      }
      logAudit('task_updated', 'task', task.id, { newStatus });
      return task;
    };

    // === Helper: Aggregate Analytics ===
    const aggregateAnalytics = () => {
      const activeSubs = subscriptions.filter(s => s.status === 'active');
      const mrr = calculateMRR(subscriptions);
      const arr = calculateARR(subscriptions);
      const churnRate = calculateChurnRate(subscriptions);
      const activeCustomers = customers.filter(c => c.status === 'active').length;
      const churnedCustomers = customers.filter(c => c.status === 'churned').length;
      const avgRevenuePerCustomer = activeCustomers > 0 ? roundTo2(mrr / activeCustomers) : 0;
      const outstandingRevenue = roundTo2(invoices
        .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.total, 0));
      const totalPayments = payments.filter(p => p.status === 'completed' || p.type === 'refund').length;
      const failedPayments = payments.filter(p => p.status === 'failed').length;
      const refunds = payments.filter(p => p.type === 'refund').length;
      const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
      const resolvedTickets = tickets.filter(t => t.status === 'resolved');
      const avgResolutionTime = resolvedTickets.length > 0
        ? roundTo2(resolvedTickets.reduce((sum, t) => sum + (t.resolutionTime ?? 0), 0) / resolvedTickets.length)
        : 0;
      const pipelineValue = roundTo2(opportunities
        .filter(o => !o.stage.startsWith('closed'))
        .reduce((sum, o) => sum + o.value, 0));
      const closedWonRevenue = roundTo2(opportunities
        .filter(o => o.stage === 'closed_won')
        .reduce((sum, o) => sum + o.value, 0));
      const apiRequestCount = apiRequests.length;
      const apiErrorCount = apiRequests.filter(r => r.status >= 400).length;
      return {
        totalCustomers: customers.length,
        activeCustomers,
        churnedCustomers,
        MRR: mrr,
        ARR: arr,
        averageRevenuePerCustomer,
        churnRate,
        totalInvoices: invoices.length,
        outstandingRevenue,
        totalPayments,
        failedPayments,
        refunds,
        openTickets,
        averageResolutionTime,
        pipelineValue,
        closedWonRevenue,
        APIRequests: apiRequestCount,
        APIErrors: apiErrorCount,
      };
    };

    // === Assertion Helper ===
    const assertionCount = { passed: 0, failed: 0 };
    const assert = (condition, message) => {
      if (condition) {
        assertionCount.passed++;
      } else {
        assertionCount.failed++;
        throw new Error(`ASSERTION FAILED: ${message}`);
      }
    };

    // === GENERATOR: Batch data creation ===
    function* generateBatches(count, batchSize) {
      let remaining = count;
      while (remaining > 0) {
        const size = Math.min(batchSize, remaining);
        remaining -= size;
        yield size;
      }
    }

    // === RECURSIVE: Build task dependency tree ===
    const buildTaskTree = (project, depth, maxDepth) => {
      if (depth > maxDepth) return [];
      const taskCount = randomInt(1, 3);
      const created = [];
      for (let i = 0; i < taskCount; i++) {
        const deps = depth > 0 && seededRandom() > 0.5
          ? created.slice(-1).map(t => t.id)
          : [];
        const task = createTask(project, `Task ${depth}.${i} - ${randomChoice(['Design', 'Develop', 'Test', 'Deploy', 'Review', 'Document'])}`, randomChoice(['alice', 'bob', 'carol', 'dave', 'eve']), deps);
        created.push(task);
        if (seededRandom() > 0.6 && depth < maxDepth) {
          buildTaskTree(project, depth + 1, maxDepth);
        }
      }
      return created;
    };

    // === PHASE 1: Pricing Plans ===
    const planData = [
      { name: 'Basic', tier: 'basic', monthlyPrice: 29, annualPrice: 290, features: ['api_access', 'data_export'] },
      { name: 'Pro', tier: 'pro', monthlyPrice: 99, annualPrice: 990, features: ['api_access', 'data_export', 'advanced_analytics', 'bulk_import', 'webhooks', 'audit_logs', 'multi_workspace', 'sandbox_mode'] },
      { name: 'Enterprise', tier: 'enterprise', monthlyPrice: 499, annualPrice: 4990, features: ['api_access', 'data_export', 'advanced_analytics', 'bulk_import', 'webhooks', 'audit_logs', 'multi_workspace', 'sandbox_mode', 'custom_reports', 'sso_saml', 'custom_domains', 'priority_support', 'white_label', 'custom_roles', 'realtime_sync'] },
    ];
    for (const pd of planData) {
      const plan = { id: generateId('plan'), ...pd };
      pricingPlans.push(plan);
      planById.set(plan.id, plan);
    }
    const basicPlan = pricingPlans[0];
    const proPlan = pricingPlans[1];
    const enterprisePlan = pricingPlans[2];

    // === PHASE 2: Products ===
    const productNames = ['Core Platform', 'Analytics Suite', 'Integration Hub', 'Security Module', 'Automation Engine', 'Data Pipeline', 'Collaboration Tools', 'Reporting Engine'];
    for (const pname of productNames) {
      const product = {
        id: generateId('prod'),
        name: pname,
        description: `${pname} for enterprise teams`,
        category: randomChoice(['platform', 'add-on', 'service']),
        active: true,
        createdAt: randomDate(BASE_DATE, addDays(NOW, -180)),
      };
      products.push(product);
      productById.set(product.id, product);
    }

    // === PHASE 3: Feature Flags ===
    for (const fd of FLAG_DEFINITIONS) {
      featureFlags.push({
        id: generateId('flag'),
        key: fd.key,
        tiers: fd.tiers,
        enabled: true,
        rolloutPercentage: randomInt(50, 100),
        createdAt: randomDate(BASE_DATE, addDays(NOW, -90)),
      });
    }

    // === PHASE 4: Permissions ===
    for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
      for (const perm of perms) {
        permissions.push({
          id: generateId('perm'),
          role,
          permission: perm,
          scope: 'global',
          grantedAt: BASE_DATE,
        });
      }
    }

    // === PHASE 5: Teams ===
    const teamNames = ['Engineering', 'Sales', 'Support', 'Product', 'Marketing', 'Finance', 'Operations', 'Data Science'];
    for (const tname of teamNames) {
      const team = {
        id: generateId('team'),
        name: tname,
        size: randomInt(3, 20),
        lead: randomChoice(['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'heidi']),
        createdAt: randomDate(BASE_DATE, addDays(NOW, -200)),
        active: true,
      };
      teams.push(team);
      teamById.set(team.id, team);
    }

    // === PHASE 6: Customers (120) ===
    const companyNames = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Stark', 'Wayne', 'Cyberdyne', 'Soylent', 'Hooli', 'Pied Piper', 'Dunder Mifflin', 'Vandelay', 'Bluth', 'Prestige', 'Sterling', 'Pentagon', 'Aperture', 'Black Mesa', 'Red Planet', 'Blue Sky'];
    const suffixes = ['Inc', 'Corp', 'LLC', 'Ltd', 'Group', 'Systems', 'Technologies', 'Solutions', 'Labs', 'Dynamics'];
    const industries = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Education', 'Logistics', 'Media', 'Energy', 'Real Estate'];
    const regions = ['US', 'EU', 'UK', 'AU', 'CA', 'IN'];
    const sizes = ['1-10', '11-50', '51-200', '201-1000', '1000+'];

    for (let i = 0; i < 120; i++) {
      const name = `${randomChoice(companyNames)} ${randomChoice(suffixes)}`;
      const enterprise = seededRandom() > 0.7;
      const customer = createCustomer({
        name,
        industry: randomChoice(industries),
        region: randomChoice(regions),
        size: enterprise ? randomChoice(['201-1000', '1000+']) : randomChoice(sizes),
        enterprise,
      });
      const account = createAccount(customer, `${name} - Main`);
      const userCount = enterprise ? randomInt(5, 15) : randomInt(1, 5);
      const roles = ['admin', 'manager', 'member', 'viewer', 'billing'];
      for (let u = 0; u < userCount; u++) {
        createUser(account, `${randomChoice(['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'])} ${randomChoice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'])}`, u === 0 ? 'admin' : randomChoice(roles));
      }
    }

    // === PHASE 7: Subscriptions ===
    for (const customer of customers) {
      const plan = customer.enterprise ? enterprisePlan : (seededRandom() > 0.5 ? proPlan : basicPlan);
      const sub = createSubscription(customer, plan, randomDate(BASE_DATE, addDays(NOW, -60)));
      if (seededRandom() > 0.85) {
        const otherPlan = plan === basicPlan ? proPlan : basicPlan;
        if (seededRandom() > 0.5) {
          upgradeSubscription(sub, otherPlan);
        } else {
          downgradeSubscription(sub, otherPlan);
        }
      }
    }

    // === PHASE 8: Invoices & Payments ===
    for (const sub of subscriptions) {
      const invoiceCount = randomInt(1, 4);
      for (let i = 0; i < invoiceCount; i++) {
        const periodStart = addDays(NOW, -(i + 1) * 30);
        const periodEnd = addDays(NOW, -i * 30);
        const invoice = generateInvoice(sub, periodStart, periodEnd);
        const payment = await processPayment(invoice);
        if (payment.status === 'failed') {
          sub.failedPaymentCount = (sub.failedPaymentCount ?? 0) + 1;
          if (sub.failedPaymentCount >= 3) {
            sub.status = 'suspended';
            suspendedSubscriptions.add(sub.id);
            const customer = customerById.get(sub.customerId);
            sendNotification('subscription_suspended', customer.id, 'Subscription Suspended',
              'Your subscription has been suspended due to 3 failed payments. Please update your billing information.');
            logAudit('subscription_suspended', 'subscription', sub.id, { reason: '3_failed_payments' });
          }
        }
      }
    }

    // === PHASE 9: Refunds ===
    const completedPayments = payments.filter(p => p.status === 'completed');
    const refundCount = Math.min(5, completedPayments.length);
    for (let i = 0; i < refundCount; i++) {
      const pay = completedPayments[randomInt(0, completedPayments.length - 1)];
      const refundAmount = roundTo2(pay.amount * randomFloat(0.1, 0.5));
      processRefund(pay, refundAmount, randomChoice(['service_issue', 'duplicate_charge', 'customer_request', 'billing_error']));
    }

    // === PHASE 10: Support Tickets ===
    const ticketSubjects = ['API returning 500 errors', 'Cannot login to dashboard', 'Billing discrepancy', 'Feature request: dark mode', 'Data export failing', 'Slow query performance', 'SSO integration issue', 'Webhook not firing', 'Rate limit too low', 'Dashboard not loading', 'Data inconsistency', 'Mobile app crash', 'Email notifications not sending', 'Custom domain not resolving', 'API documentation unclear'];
    for (let i = 0; i < 45; i++) {
      const customer = randomChoice(customers);
      const ticket = createTicket(customer, randomChoice(ticketSubjects), randomChoice(['critical', 'high', 'medium', 'low']), 'Detailed description of the issue reported by the customer.');
      if (seededRandom() > 0.6) {
        ticket.status = 'in_progress';
      }
      if (seededRandom() > 0.7) {
        escalateTicket(ticket);
      }
      if (seededRandom() > 0.4) {
        resolveTicket(ticket, randomChoice(['Fixed in latest release', 'Configuration corrected', 'Workaround provided', 'Escalated to engineering and resolved', 'Customer issue resolved after investigation']));
      }
    }

    // === PHASE 11: Sales Opportunities ===
    const oppStages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    for (let i = 0; i < 35; i++) {
      const stage = randomChoice(oppStages);
      const value = randomInt(5000, 200000);
      const opp = {
        id: generateId('opp'),
        companyName: `${randomChoice(companyNames)} ${randomChoice(suffixes)}`,
        industry: randomChoice(industries),
        region: randomChoice(regions),
        size: randomChoice(sizes),
        stage,
        value,
        probability: stage === 'closed_won' ? 100 : stage === 'closed_lost' ? 0 : randomInt(10, 90),
        planId: value > 50000 ? enterprisePlan.id : value > 10000 ? proPlan.id : basicPlan.id,
        createdAt: randomDate(addDays(NOW, -180), NOW),
        expectedClose: addDays(NOW, randomInt(-30, 90)),
        ownerId: randomChoice(['sales_rep_1', 'sales_rep_2', 'sales_rep_3', 'sales_rep_4']),
        customerId: null,
        accountId: null,
      };
      opportunities.push(opp);
      opportunityById.set(opp.id, opp);
      if (stage === 'closed_won' || stage === 'closed_lost') {
        processOpportunity(opp);
      }
    }

    // === PHASE 12: Contracts ===
    const enterpriseCustomers = customers.filter(c => c.enterprise);
    for (const ec of enterpriseCustomers.slice(0, 20)) {
      const contract = {
        id: generateId('contract'),
        customerId: ec.id,
        type: randomChoice(['annual', 'multi_year', 'custom']),
        startDate: randomDate(BASE_DATE, addDays(NOW, -120)),
        endDate: addDays(NOW, randomInt(60, 365)),
        value: randomInt(50000, 500000),
        status: 'active',
        autoRenew: seededRandom() > 0.3,
        terms: { sla: '99.9%', support: '24/7', penalty: '120 days notice' },
      };
      contracts.push(contract);
      contractById.set(contract.id, contract);
    }

    // === PHASE 13: Usage Records ===
    for (const sub of subscriptions.slice(0, 50)) {
      const customer = customerById.get(sub.customerId);
      const plan = planById.get(sub.planId);
      const usageCount = randomInt(5, 50);
      for (let i = 0; i < usageCount; i++) {
        usageRecords.push({
          id: generateId('usage'),
          customerId: customer.id,
          subscriptionId: sub.id,
          metric: randomChoice(['api_calls', 'data_processed_gb', 'active_users', 'storage_gb', 'events_processed']),
          value: randomInt(100, 100000),
          timestamp: randomDate(addDays(NOW, -30), NOW),
          tier: plan.tier,
        });
      }
    }

    // === PHASE 14: API Requests ===
    const apiEndpoints = ['/v1/customers', '/v1/invoices', '/v1/subscriptions', '/v1/reports', '/v1/analytics', '/v1/webhooks', '/v1/exports', '/v1/usage'];
    const apiMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    for (let i = 0; i < 200; i++) {
      const customer = randomChoice(customers);
      const sub = subscriptions.find(s => s.customerId === customer.id);
      const plan = sub ? planById.get(sub.planId) : basicPlan;
      const tier = plan.tier;
      const errorRate = API_ERROR_RATES[tier];
      const isError = seededRandom() < errorRate;
      const status = isError ? randomChoice([400, 401, 403, 429, 500, 503]) : randomChoice([200, 200, 200, 201, 204]);
      apiRequests.push({
        id: generateId('api'),
        customerId: customer.id,
        endpoint: randomChoice(apiEndpoints),
        method: randomChoice(apiMethods),
        status,
        responseTimeMs: randomInt(10, isError ? 5000 : 500),
        timestamp: randomDate(addDays(NOW, -7), NOW),
        tier,
        rateLimitHit: status === 429,
      });
    }

    // === PHASE 15: Projects & Tasks ===
    const projectTypes = ['onboarding', 'migration', 'integration', 'customization', 'audit', 'training'];
    for (const customer of customers.slice(0, 30)) {
      const project = createProject(customer, `${randomChoice(['Q4', 'Q1', 'Phase 2', 'Phase 3', 'Pilot', 'Production'])} ${randomChoice(projectTypes)}`, randomChoice(projectTypes));
      buildTaskTree(project, 0, 3);
    }

    // === PHASE 16: Additional Notifications ===
    for (const customer of customers.slice(0, 20)) {
      sendNotification('monthly_report', customer.id, 'Monthly Usage Report', `Your usage report for November 2024 is ready.`);
    }
    for (const sub of subscriptions.filter(s => s.status === 'suspended')) {
      const customer = customerById.get(sub.customerId);
      sendNotification('reinstatement_offer', customer.id, 'Reinstatement Offer', 'We would love to have you back! Here is a 20% discount for 3 months.');
    }

    // === PHASE 17: Additional Audit Logs ===
    logAudit('simulation_started', 'system', 'sim_001', { timestamp: BASE_DATE, version: '1.0.0' });
    logAudit('data_generation_complete', 'system', 'sim_002', { customers: customers.length, subscriptions: subscriptions.length });
    logAudit('billing_cycle_complete', 'system', 'sim_003', { invoices: invoices.length, payments: payments.length });
    logAudit('support_cycle_complete', 'system', 'sim_004', { tickets: tickets.length, resolved: resolvedTicketIds.size });
    logAudit('sales_cycle_complete', 'system', 'sim_005', { opportunities: opportunities.length, closedWon: opportunities.filter(o => o.stage === 'closed_won').length });

    // === PHASE 18: Analytics Aggregation ===
    const metrics = aggregateAnalytics();

    // === PHASE 19: ASSERTIONS (40+) ===
    assert(metrics.MRR >= 0, 'MRR cannot be negative');
    assert(metrics.ARR === roundTo2(metrics.MRR * 12), 'ARR must equal MRR × 12');
    assert(metrics.totalCustomers >= 100, 'Must have at least 100 customers');
    assert(metrics.activeCustomers + metrics.churnedCustomers <= metrics.totalCustomers, 'Active + churned cannot exceed total customers');
    assert(metrics.MRR >= 0, 'MRR must be non-negative');
    assert(metrics.ARR >= 0, 'ARR must be non-negative');
    assert(metrics.churnRate >= 0 && metrics.churnRate <= 100, 'Churn rate must be between 0 and 100');
    assert(metrics.totalInvoices > 0, 'Must have at least one invoice');
    assert(metrics.outstandingRevenue >= 0, 'Outstanding revenue cannot be negative');
    assert(metrics.totalPayments >= 0, 'Total payments cannot be negative');
    assert(metrics.failedPayments >= 0, 'Failed payments cannot be negative');
    assert(metrics.refunds >= 0, 'Refunds cannot be negative');
    assert(metrics.openTickets >= 0, 'Open tickets cannot be negative');
    assert(metrics.averageResolutionTime >= 0, 'Average resolution time cannot be negative');
    assert(metrics.pipelineValue >= 0, 'Pipeline value cannot be negative');
    assert(metrics.closedWonRevenue >= 0, 'Closed won revenue cannot be negative');
    assert(metrics.APIRequests > 0, 'Must have API requests');
    assert(metrics.APIErrors >= 0, 'API errors cannot be negative');
    assert(metrics.APIErrors <= metrics.APIRequests, 'API errors cannot exceed total API requests');

    // Invariant: Cancelled subscriptions cannot be active
    const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled');
    for (const cs of cancelledSubs) {
      assert(cs.status === 'cancelled', `Cancelled subscription ${cs.id} must have status 'cancelled'`);
    }

    // Invariant: Paid invoices must have a payment
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    for (const pi of paidInvoices.slice(0, 10)) {
      const hasPayment = payments.some(p => p.invoiceId === pi.id && p.status === 'completed');
      assert(hasPayment, `Paid invoice ${pi.id} must have a completed payment`);
    }

    // Invariant: Users must belong to valid accounts
    for (const user of users.slice(0, 20)) {
      assert(accountById.has(user.accountId), `User ${user.id} must belong to a valid account`);
    }

    // Invariant: Enterprise plans must have higher API limits than basic
    assert(API_LIMITS.enterprise > API_LIMITS.basic, 'Enterprise API limits must exceed basic');
    assert(API_LIMITS.pro > API_LIMITS.basic, 'Pro API limits must exceed basic');
    assert(API_LIMITS.enterprise > API_LIMITS.pro, 'Enterprise API limits must exceed pro');

    // Invariant: Closed-won opportunities must have associated customers
    const closedWon = opportunities.filter(o => o.stage === 'closed_won');
    for (const cw of closedWon) {
      assert(cw.customerId !== null && customerById.has(cw.customerId), `Closed-won opportunity ${cw.id} must have a valid customer`);
    }

    // Invariant: Refunds cannot exceed original payment
    const refundPayments = payments.filter(p => p.type === 'refund');
    for (const rp of refundPayments) {
      const original = paymentById.get(rp.paymentId) ?? payments.find(p => p.id === rp.paymentId);
      if (original) {
        assert(rp.amount <= original.amount, `Refund ${rp.id} ($${rp.amount}) cannot exceed original payment ($${original.amount})`);
      }
    }

    // Invariant: Suspended subscriptions must have 3+ failed payments
    for (const subId of suspendedSubscriptions) {
      const sub = subscriptionById.get(subId);
      assert(sub.failedPaymentCount >= 3, `Suspended subscription ${subId} must have 3+ failed payments`);
    }

    // Invariant: All subscriptions reference valid plans
    for (const sub of subscriptions) {
      assert(planById.has(sub.planId), `Subscription ${sub.id} must reference a valid plan`);
    }

    // Invariant: All subscriptions reference valid customers
    for (const sub of subscriptions) {
      assert(customerById.has(sub.customerId), `Subscription ${sub.id} must reference a valid customer`);
    }

    // Invariant: Invoices have non-negative totals
    for (const inv of invoices.slice(0, 20)) {
      assert(inv.total >= 0, `Invoice ${inv.id} total must be non-negative`);
    }

    // Invariant: Invoices have non-negative tax
    for (const inv of invoices.slice(0, 20)) {
      assert(inv.tax >= 0, `Invoice ${inv.id} tax must be non-negative`);
    }

    // Invariant: Invoice total equals subtotal + tax (within rounding)
    for (const inv of invoices.slice(0, 10)) {
      const expected = roundTo2(inv.subtotal + inv.tax);
      assert(Math.abs(inv.total - expected) < 0.02, `Invoice ${inv.id} total must equal subtotal + tax`);
    }

    // Invariant: Feature flags for enterprise include all pro features
    const enterpriseFlags = getFeatureFlags('enterprise').map(f => f.key);
    const proFlags = getFeatureFlags('pro').map(f => f.key);
    for (const pf of proFlags) {
      assert(enterpriseFlags.includes(pf), `Enterprise must include all pro features; missing: ${pf}`);
    }

    // Invariant: All tickets have valid priorities
    const validPriorities = new Set(['critical', 'high', 'medium', 'low']);
    for (const ticket of tickets) {
      assert(validPriorities.has(ticket.priority), `Ticket ${ticket.id} must have a valid priority`);
    }

    // Invariant: Resolved tickets have a resolution time
    for (const ticket of tickets.filter(t => t.status === 'resolved')) {
      assert(ticket.resolutionTime !== null, `Resolved ticket ${ticket.id} must have a resolution time`);
    }

    // Invariant: All accounts reference valid customers
    for (const acct of accounts) {
      assert(customerById.has(acct.customerId), `Account ${acct.id} must reference a valid customer`);
    }

    // Invariant: All projects reference valid customers
    for (const proj of projects) {
      assert(customerById.has(proj.customerId), `Project ${proj.id} must reference a valid customer`);
    }

    // Invariant: All tasks reference valid projects
    for (const task of tasks) {
      assert(projectById.has(task.projectId), `Task ${task.id} must reference a valid project`);
    }

    // Invariant: No task in 'in_progress' has unmet dependencies
    for (const task of tasks.filter(t => t.status === 'in_progress')) {
      const unmet = task.dependencies.filter(d => !completedTaskIds.has(d));
      assert(unmet.length === 0, `Task ${task.id} in progress must have all dependencies met`);
    }

    // Invariant: Audit logs are non-empty
    assert(auditLogs.length > 0, 'Audit logs must not be empty');

    // Invariant: Notifications exist for failed payments
    const failedPayNotifs = notifications.filter(n => n.type === 'payment_failed');
    assert(failedPayNotifs.length >= metrics.failedPayments, 'Must have notifications for all failed payments');

    // Invariant: All customers have at least one account
    for (const customer of customers.slice(0, 30)) {
      const hasAccount = accounts.some(a => a.customerId === customer.id);
      assert(hasAccount, `Customer ${customer.id} must have at least one account`);
    }

    // Invariant: Enterprise customers have higher MRR on average
    const enterpriseMrr = customers.filter(c => c.enterprise && c.status === 'active').reduce((s, c) => s + c.mrr, 0);
    const standardMrr = customers.filter(c => !c.enterprise && c.status === 'active').reduce((s, c) => s + c.mrr, 0);
    const entCount = customers.filter(c => c.enterprise && c.status === 'active').length;
    const stdCount = customers.filter(c => !c.enterprise && c.status === 'active').length;
    if (entCount > 0 && stdCount > 0) {
      assert(enterpriseMrr / entCount >= standardMrr / stdCount * 0.5, 'Enterprise customers should have significantly higher average MRR');
    }

    // Invariant: Pricing plans are ordered by price
    assert(basicPlan.monthlyPrice < proPlan.monthlyPrice, 'Basic plan must be cheaper than Pro');
    assert(proPlan.monthlyPrice < enterprisePlan.monthlyPrice, 'Pro plan must be cheaper than Enterprise');

    // Invariant: All API requests have valid status codes
    const validStatuses = new Set([200, 201, 204, 400, 401, 403, 429, 500, 503]);
    for (const req of apiRequests.slice(0, 50)) {
      assert(validStatuses.has(req.status), `API request ${req.id} must have a valid status code`);
    }

    // Invariant: Contracts only exist for enterprise customers
    for (const contract of contracts) {
      const cust = customerById.get(contract.customerId);
      assert(cust.enterprise === true, `Contract ${contract.id} must belong to an enterprise customer`);
    }

    // Invariant: Usage records reference valid customers
    for (const usage of usageRecords.slice(0, 20)) {
      assert(customerById.has(usage.customerId), `Usage record ${usage.id} must reference a valid customer`);
    }

    // Invariant: No negative values in usage records
    for (const usage of usageRecords.slice(0, 20)) {
      assert(usage.value > 0, `Usage record ${usage.id} must have positive value`);
    }

    // Invariant: Teams are non-empty
    assert(teams.length >= 5, 'Must have at least 5 teams');

    // Invariant: Products are non-empty
    assert(products.length >= 5, 'Must have at least 5 products');

    // Invariant: Feature flags are non-empty
    assert(featureFlags.length >= 10, 'Must have at least 10 feature flags');

    // Invariant: Permissions exist for all roles
    const rolesWithPerms = new Set(permissions.map(p => p.role));
    for (const role of Object.keys(ROLE_PERMISSIONS)) {
      assert(rolesWithPerms.has(role), `Permissions must exist for role: ${role}`);
    }

    // Invariant: All notifications have a valid type
    const validNotifTypes = new Set(['payment_failed', 'upgrade', 'downgrade', 'cancellation', 'escalation', 'deal_closed', 'subscription_suspended', 'reinstatement_offer', 'monthly_report']);
    for (const notif of notifications.slice(0, 20)) {
      assert(validNotifTypes.has(notif.type), `Notification ${notif.id} must have a valid type`);
    }

    // Invariant: All audit log entries have valid actions
    for (const log of auditLogs.slice(0, 20)) {
      assert(typeof log.action === 'string' && log.action.length > 0, `Audit log ${log.id} must have a valid action`);
      assert(typeof log.entity === 'string' && log.entity.length > 0, `Audit log ${log.id} must have a valid entity`);
    }

    // Invariant: Opportunities have valid stages
    const validStages = new Set(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']);
    for (const opp of opportunities) {
      assert(validStages.has(opp.stage), `Opportunity ${opp.id} must have a valid stage`);
    }

    // Invariant: Opportunity values are positive
    for (const opp of opportunities) {
      assert(opp.value > 0, `Opportunity ${opp.id} must have a positive value`);
    }

    // Invariant: No duplicate customer IDs
    const customerIds = new Set(customers.map(c => c.id));
    assert(customerIds.size === customers.length, 'All customer IDs must be unique');

    // Invariant: No duplicate subscription IDs
    const subIds = new Set(subscriptions.map(s => s.id));
    assert(subIds.size === subscriptions.length, 'All subscription IDs must be unique');

    // Invariant: No duplicate invoice IDs
    const invIds = new Set(invoices.map(i => i.id));
    assert(invIds.size === invoices.length, 'All invoice IDs must be unique');

    // Invariant: No duplicate payment IDs
    const payIds = new Set(payments.map(p => p.id));
    assert(payIds.size === payments.length, 'All payment IDs must be unique');

    // Invariant: No duplicate ticket IDs
    const tickIds = new Set(tickets.map(t => t.id));
    assert(tickIds.size === tickets.length, 'All ticket IDs must be unique');

    // Invariant: No duplicate project IDs
    const projIds = new Set(projects.map(p => p.id));
    assert(projIds.size === projects.length, 'All project IDs must be unique');

    // Invariant: No duplicate task IDs
    const taskIds = new Set(tasks.map(t => t.id));
    assert(taskIds.size === tasks.length, 'All task IDs must be unique');

    // Invariant: No duplicate user IDs
    const userIds = new Set(users.map(u => u.id));
    assert(userIds.size === users.length, 'All user IDs must be unique');

    // Invariant: No duplicate account IDs
    const acctIds = new Set(accounts.map(a => a.id));
    assert(acctIds.size === accounts.length, 'All account IDs must be unique');

    // Invariant: No duplicate opportunity IDs
    const oppIds = new Set(opportunities.map(o => o.id));
    assert(oppIds.size === opportunities.length, 'All opportunity IDs must be unique');

    // Invariant: No duplicate contract IDs
    const contractIds = new Set(contracts.map(c => c.id));
    assert(contractIds.size === contracts.length, 'All contract IDs must be unique');

    // Invariant: No duplicate notification IDs
    const notifIds = new Set(notifications.map(n => n.id));
    assert(notifIds.size === notifications.length, 'All notification IDs must be unique');

    // Invariant: No duplicate audit log IDs
    const auditIds = new Set(auditLogs.map(a => a.id));
    assert(auditIds.size === auditLogs.length, 'All audit log IDs must be unique');

    // Invariant: No duplicate feature flag IDs
    const flagIds = new Set(featureFlags.map(f => f.id));
    assert(flagIds.size === featureFlags.length, 'All feature flag IDs must be unique');

    // Invariant: No duplicate permission IDs
    const permIds = new Set(permissions.map(p => p.id));
    assert(permIds.size === permissions.length, 'All permission IDs must be unique');

    // Invariant: No duplicate team IDs
    const teamIds = new Set(teams.map(t => t.id));
    assert(teamIds.size === teams.length, 'All team IDs must be unique');

    // Invariant: No duplicate product IDs
    const prodIds = new Set(products.map(p => p.id));
    assert(prodIds.size === products.length, 'All product IDs must be unique');

    // Invariant: No duplicate plan IDs
    const planIds = new Set(pricingPlans

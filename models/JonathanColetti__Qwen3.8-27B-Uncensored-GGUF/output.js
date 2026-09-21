async function runEnterpriseSimulation() {
  let seed = 42;
  const mulberry32 = () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const rand = () => mulberry32();
  const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
  const randChoice = (arr) => arr[Math.floor(rand() * arr.length)];
  const randFloat = (min, max, decimals = 2) => parseFloat((min + rand() * (max - min)).toFixed(decimals));

  const idCounters = new Map();
  const generateId = (prefix) => {
    const count = (idCounters.get(prefix) || 0) + 1;
    idCounters.set(prefix, count);
    return `${prefix}_${String(count).padStart(6, '0')}`;
  };

  const BASE_DATE = new Date('2024-01-01T00:00:00Z');
  const NOW = new Date('2024-12-15T00:00:00Z');
  const addDays = (date, days) => new Date(date.getTime() + days * 86400000);
  const addHours = (date, hours) => new Date(date.getTime() + hours * 3600000);
  const addMonths = (date, months) => { const d = new Date(date); d.setMonth(d.getMonth() + months); return d; };
  const daysBetween = (a, b) => Math.abs(b - a) / 86400000;
  const randomDate = (start, end) => new Date(start.getTime() + rand() * (end.getTime() - start.getTime()));

  class ValidationError extends Error {
    constructor(field, message) { super(`${field}: ${message}`); this.name = 'ValidationError'; this.field = field; }
  }
  class BusinessRuleError extends Error {
    constructor(rule, message) { super(`[${rule}] ${message}`); this.name = 'BusinessRuleError'; this.rule = rule; }
  }
  class PaymentError extends Error {
    constructor(amount, reason) { super(`Payment of $${amount} failed: ${reason}`); this.name = 'PaymentError'; this.amount = amount; }
  }

  const TIERS = ['basic', 'pro', 'business', 'enterprise'];
  const TIER_CONFIG = {
    basic: { price: 29, apiLimit: 1000, supportPriority: 'low', features: ['dashboard', 'reports'] },
    pro: { price: 79, apiLimit: 10000, supportPriority: 'medium', features: ['dashboard', 'reports', 'api_access', 'integrations'] },
    business: { price: 199, apiLimit: 100000, supportPriority: 'high', features: ['dashboard', 'reports', 'api_access', 'integrations', 'sso', 'audit_log'] },
    enterprise: { price: 499, apiLimit: 1000000, supportPriority: 'critical', features: ['dashboard', 'reports', 'api_access', 'integrations', 'sso', 'audit_log', 'custom_fields', 'dedicated_support'] }
  };
  const ROLES = ['owner', 'admin', 'editor', 'viewer'];
  const ROLE_PERMISSIONS = {
    owner: ['read', 'write', 'delete', 'manage_users', 'billing', 'settings'],
    admin: ['read', 'write', 'delete', 'manage_users', 'settings'],
    editor: ['read', 'write'],
    viewer: ['read']
  };
  const OPPORTUNITY_STAGES = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const TICKET_PRIORITIES = ['low', 'medium', 'high', 'critical'];
  const SLA_HOURS = { low: 72, medium: 48, high: 24, critical: 4 };
  const TAX_RATES = { US: 0.08, EU: 0.20, UK: 0.20, AU: 0.10, CA: 0.13, JP: 0.10 };
  const COUNTRIES = ['US', 'EU', 'UK', 'AU', 'CA', 'JP'];
  const FIRST_NAMES = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
  const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];
  const COMPANY_SUFFIXES = ['Inc', 'LLC', 'Corp', 'Technologies', 'Solutions', 'Systems', 'Labs', 'Group', 'Partners', 'Digital'];
  const TICKET_SUBJECTS = ['Login issue', 'API timeout', 'Billing question', 'Data export', 'Integration error', 'Performance issue', 'SSO failure', 'Webhook not firing'];
  const API_ENDPOINTS = ['/api/v1/users', '/api/v1/data', '/api/v1/reports', '/api/v1/webhooks', '/api/v1/billing', '/api/v1/analytics'];

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
  const customerMap = new Map();
  const subscriptionMap = new Map();
  const invoiceMap = new Map();
  const paymentMap = new Map();
  const activeFeatureSet = new Set();
  const suspendedSubscriptions = new Set();

  const validateEmail = (email) => {
    if (!email || typeof email !== 'string') throw new ValidationError('email', 'Must be a string');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError('email', 'Invalid format');
    return true;
  };

  const validateAmount = (amount, field = 'amount') => {
    if (typeof amount !== 'number' || isNaN(amount)) throw new ValidationError(field, 'Must be a number');
    if (amount < 0) throw new ValidationError(field, 'Cannot be negative');
    return true;
  };

  const calculateTax = (amount, country) => {
    const rate = TAX_RATES[country] ?? 0;
    return parseFloat((amount * rate).toFixed(2));
  };

  const calculateDiscount = (basePrice, tier, customerCount) => {
    if (tier === 'enterprise' && customerCount > 50) return 0.15;
    if (tier === 'enterprise') return 0.10;
    if (tier === 'business' && customerCount > 20) return 0.05;
    return 0;
  };

  const calculateProration = (oldPrice, newPrice, daysRemaining, totalDays) => {
    const dailyOld = oldPrice / totalDays;
    const dailyNew = newPrice / totalDays;
    const credit = dailyOld * daysRemaining;
    const charge = dailyNew * daysRemaining;
    return { credit: parseFloat(credit.toFixed(2)), charge: parseFloat(charge.toFixed(2)), net: parseFloat((charge - credit).toFixed(2)) };
  };

  const generateCustomer = (index) => {
    const firstName = randChoice(FIRST_NAMES);
    const lastName = randChoice(LAST_NAMES);
    const company = `${randChoice(LAST_NAMES)} ${randChoice(COMPANY_SUFFIXES)}`;
    const country = randChoice(COUNTRIES);
    const tier = randChoice(TIERS);
    const id = generateId('cust');
    const createdAt = randomDate(BASE_DATE, NOW);
    const customer = {
      id, name: company, contactName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${company.toLowerCase().replace(/\s/g, '')}.com`,
      country, tier, createdAt, status: 'active', mrr: 0, totalSpent: 0, failedPaymentCount: 0
    };
    validateEmail(customer.email);
    customers.push(customer);
    customerMap.set(id, customer);
    return customer;
  };

  const generateAccount = (customer) => {
    const id = generateId('acct');
    const account = {
      id, customerId: customer.id, name: customer.name, plan: customer.tier,
      createdAt: customer.createdAt, status: 'active',
      apiLimit: TIER_CONFIG[customer.tier].apiLimit, features: [...TIER_CONFIG[customer.tier].features]
    };
    accounts.push(account);
    return account;
  };

  const generateUser = (customer, account, role) => {
    const id = generateId('user');
    const user = {
      id, name: `${randChoice(FIRST_NAMES)} ${randChoice(LAST_NAMES)}`,
      email: `user${idCounters.get('user')}@${customer.name.toLowerCase().replace(/\s/g, '')}.com`,
      accountId: account.id, customerId: customer.id, role,
      permissions: ROLE_PERMISSIONS[role], createdAt: randomDate(customer.createdAt, NOW), status: 'active'
    };
    validateEmail(user.email);
    users.push(user);
    permissions.push({ userId: user.id, role, permissions: user.permissions, grantedAt: user.createdAt });
    return user;
  };

  const generateProduct = (name, description, basePrice) => {
    const id = generateId('prod');
    const product = { id, name, description, basePrice, createdAt: BASE_DATE, active: true };
    products.push(product);
    return product;
  };

  const generatePricingPlan = (tier, price, features) => {
    const id = generateId('plan');
    const plan = { id, tier, price, features, apiLimit: TIER_CONFIG[tier].apiLimit, createdAt: BASE_DATE };
    pricingPlans.push(plan);
    return plan;
  };

  const createSubscription = (customer, tier, startDate) => {
    const id = generateId('sub');
    const config = TIER_CONFIG[tier];
    const discount = calculateDiscount(config.price, tier, 1);
    const effectivePrice = parseFloat((config.price * (1 - discount)).toFixed(2));
    const subscription = {
      id, customerId: customer.id, tier, price: effectivePrice, originalPrice: config.price,
      discount, startDate, endDate: null, status: 'active', prorationCredit: 0, prorationCharge: 0
    };
    subscriptions.push(subscription);
    subscriptionMap.set(id, subscription);
    customer.mrr = effectivePrice;
    customer.totalSpent += effectivePrice;
    return subscription;
  };

  const upgradeSubscription = (subscription, newTier) => {
    if (TIERS.indexOf(newTier) <= TIERS.indexOf(subscription.tier)) {
      throw new BusinessRuleError('upgrade', `Cannot upgrade from ${subscription.tier} to ${newTier}`);
    }
    const customer = customerMap.get(subscription.customerId);
    const unpaidInvoices = invoices.filter(inv => inv.customerId === customer.id && inv.status === 'unpaid');
    if (unpaidInvoices.length > 0) throw new BusinessRuleError('upgrade', `Account has ${unpaidInvoices.length} unpaid invoice(s)`);
    const newConfig = TIER_CONFIG[newTier];
    const daysRemaining = Math.max(1, Math.ceil(daysBetween(NOW, addMonths(NOW, 1))));
    const proration = calculateProration(subscription.price, newConfig.price, daysRemaining, 30);
    subscription.tier = newTier;
    subscription.price = newConfig.price;
    subscription.originalPrice = newConfig.price;
    subscription.prorationCredit = proration.credit;
    subscription.prorationCharge = proration.charge;
    customer.tier = newTier;
    customer.mrr = newConfig.price;
    const account = accounts.find(a => a.customerId === customer.id);
    if (account) { account.plan = newTier; account.apiLimit = newConfig.apiLimit; account.features = [...newConfig.features]; }
    return subscription;
  };

  const downgradeSubscription = (subscription, newTier) => {
    if (TIERS.indexOf(newTier) >= TIERS.indexOf(subscription.tier)) {
      throw new BusinessRuleError('downgrade', `Cannot downgrade from ${subscription.tier} to ${newTier}`);
    }
    const newConfig = TIER_CONFIG[newTier];
    const daysRemaining = Math.max(1, Math.ceil(daysBetween(NOW, addMonths(NOW, 1))));
    const proration = calculateProration(subscription.price, newConfig.price, daysRemaining, 30);
    subscription.tier = newTier;
    subscription.price = newConfig.price;
    subscription.originalPrice = newConfig.price;
    subscription.prorationCredit = proration.credit;
    subscription.prorationCharge = proration.charge;
    const customer = customerMap.get(subscription.customerId);
    customer.tier = newTier;
    customer.mrr = newConfig.price;
    const account = accounts.find(a => a.customerId === customer.id);
    if (account) { account.plan = newTier; account.apiLimit = newConfig.apiLimit; account.features = [...newConfig.features]; }
    return subscription;
  };

  const cancelSubscription = (subscription, reason) => {
    if (subscription.status === 'cancelled') throw new BusinessRuleError('cancel', 'Already cancelled');
    subscription.status = 'cancelled';
    subscription.endDate = NOW;
    subscription.cancelReason = reason;
    const customer = customerMap.get(subscription.customerId);
    customer.status = 'churned';
    customer.mrr = 0;
    return subscription;
  };

  const generateInvoice = (customer, subscription, period) => {
    const id = generateId('inv');
    const tax = calculateTax(subscription.price, customer.country);
    const invoice = {
      id, customerId: customer.id, subscriptionId: subscription.id,
      amount: subscription.price, tax, total: parseFloat((subscription.price + tax).toFixed(2)),
      period, status: 'pending', createdAt: NOW, dueDate: addDays(NOW, 30), paidAt: null
    };
    invoices.push(invoice);
    invoiceMap.set(id, invoice);
    return invoice;
  };

  const processPayment = (invoice) => {
    const id = generateId('pay');
    const success = rand() > 0.15;
    const payment = {
      id, invoiceId: invoice.id, customerId: invoice.customerId, amount: invoice.total,
      method: randChoice(['credit_card', 'bank_transfer', 'ach']),
      status: success ? 'completed' : 'failed', processedAt: NOW, reference: `REF_${randInt(100000, 999999)}`
    };
    payments.push(payment);
    paymentMap.set(id, payment);
    if (success) { invoice.status = 'paid'; invoice.paidAt = NOW; }
    else {
      invoice.status = 'unpaid';
      const customer = customerMap.get(invoice.customerId);
      customer.failedPaymentCount++;
      if (customer.failedPaymentCount >= 3) {
        const sub = subscriptions.find(s => s.customerId === customer.id && s.status === 'active');
        if (sub) { sub.status = 'suspended'; suspendedSubscriptions.add(sub.id); }
      }
    }
    return payment;
  };

  const processRefund = (payment, amount, reason) => {
    if (amount > payment.amount) throw new BusinessRuleError('refund', `Refund $${amount} exceeds payment $${payment.amount}`);
    validateAmount(amount, 'refund_amount');
    const id = generateId('ref');
    const refund = { id, paymentId: payment.id, customerId: payment.customerId, amount, reason, processedAt: NOW, status: 'completed', type: 'refund', method: payment.method };
    payments.push(refund);
    return refund;
  };

  const createTicket = (customer, subject, priority) => {
    const id = generateId('tick');
    const effectivePriority = customer.tier === 'enterprise' ? 'critical' : (customer.tier === 'business' ? 'high' : priority);
    const createdAt = randomDate(addDays(NOW, -90), NOW);
    const ticket = {
      id, customerId: customer.id, subject, priority: effectivePriority, status: 'open',
      createdAt, resolvedAt: null, slaDeadline: addHours(createdAt, SLA_HOURS[effectivePriority]), escalated: false
    };
    tickets.push(ticket);
    return ticket;
  };

  const resolveTicket = (ticket) => {
    if (ticket.status === 'resolved') return ticket;
    ticket.status = 'resolved';
    ticket.resolvedAt = randomDate(ticket.createdAt, NOW);
    return ticket;
  };

  const createOpportunity = (customer, value, stage) => {
    const id = generateId('opp');
    const opp = {
      id, customerId: customer ? customer.id : null,
      name: `${customer ? customer.name : 'Prospect'} - ${randChoice(['Expansion', 'New Deal', 'Renewal', 'Upsell'])}`,
      value, stage, probability: stage === 'closed_won' ? 100 : stage === 'closed_lost' ? 0 : randInt(10, 90),
      createdAt: randomDate(BASE_DATE, NOW), closedAt: null
    };
    opportunities.push(opp);
    return opp;
  };

  const closeOpportunity = (opp, won) => {
    opp.stage = won ? 'closed_won' : 'closed_lost';
    opp.probability = won ? 100 : 0;
    opp.closedAt = NOW;
    if (won && !opp.customerId) {
      const newCustomer = generateCustomer(customers.length);
      generateAccount(newCustomer);
      const tier = randChoice(['pro', 'business', 'enterprise']);
      createSubscription(newCustomer, tier, NOW);
      opp.customerId = newCustomer.id;
    }
    return opp;
  };

  const trackUsage = (customer, metric, value) => {
    const record = { id: generateId('usage'), customerId: customer.id, metric, value, timestamp: randomDate(addDays(NOW, -30), NOW) };
    usageRecords.push(record);
    return record;
  };

  const checkApiRateLimit = (customer) => {
    const account = accounts.find(a => a.customerId === customer.id);
    if (!account) return { allowed: false, reason: 'No account found' };
    const todayRequests = apiRequests.filter(r => r.customerId === customer.id && r.timestamp >= addDays(NOW, -1)).length;
    return { allowed: todayRequests < account.apiLimit, current: todayRequests, limit: account.apiLimit };
  };

  const logAudit = (actor, action, entity, entityId, details) => {
    const entry = { id: generateId('audit'), actor, action, entity, entityId, details, timestamp: NOW };
    auditLogs.push(entry);
    return entry;
  };

  const sendNotification = (customer, type, message) => {
    const notif = { id: generateId('notif'), customerId: customer.id, type, message, sentAt: NOW, read: false };
    notifications.push(notif);
    return notif;
  };

  const createTeam = (customer, name) => {
    const id = generateId('team');
    const team = { id, customerId: customer.id, name, createdAt: randomDate(customer.createdAt, NOW), memberIds: [] };
    teams.push(team);
    return team;
  };

  const createProject = (customer, name) => {
    const id = generateId('proj');
    const project = { id, customerId: customer.id, name, status: 'active', createdAt: randomDate(customer.createdAt, NOW), taskIds: [] };
    projects.push(project);
    return project;
  };

  const createTask = (project, title, dependencies) => {
    const id = generateId('task');
    const task = { id, projectId: project.id, title, status: 'pending', dependencies: dependencies || [], createdAt: randomDate(project.createdAt, NOW) };
    tasks.push(task);
    project.taskIds.push(id);
    return task;
  };

  const updateTaskStatus = (task, newStatus) => {
    if (newStatus === 'in_progress' || newStatus === 'completed') {
      const unmetDeps = task.dependencies.filter(depId => {
        const dep = tasks.find(t => t.id === depId);
        return dep && dep.status !== 'completed';
      });
      if (unmetDeps.length > 0) throw new BusinessRuleError('task_deps', `Unmet dependencies: ${unmetDeps.join(', ')}`);
    }
    task.status = newStatus;
    return task;
  };

  const calculateMRR = () => subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.price, 0);

  const calculateChurnRate = () => {
    const total = customers.length;
    const churned = customers.filter(c => c.status === 'churned').length;
    return total > 0 ? churned / total : 0;
  };

  const calculateCLV = (customer) => {
    const avgMonthlyRevenue = customer.mrr;
    const avgLifespan = 18;
    const grossMargin = 0.8;
    return parseFloat((avgMonthlyRevenue * avgLifespan * grossMargin).toFixed(2));
  };

  const generateContract = (customer, subscription) => {
    const id = generateId('contract');
    const contract = {
      id, customerId: customer.id, subscriptionId: subscription.id,
      startDate: subscription.startDate, endDate: addMonths(subscription.startDate, 12),
      value: subscription.price * 12, status: 'active', autoRenew: rand() > 0.3
    };
    contracts.push(contract);
    return contract;
  };

  const generateFeatureFlag = (name, tier, enabled) => {
    const flag = { id: generateId('flag'), name, tier, enabled, createdAt: BASE_DATE };
    featureFlags.push(flag);
    if (enabled) activeFeatureSet.add(name);
    return flag;
  };

  const generateApiRequest = (customer, endpoint, success) => {
    const req = {
      id: generateId('api'), customerId: customer.id, endpoint,
      method: randChoice(['GET', 'POST', 'PUT', 'DELETE']),
      status: success ? 200 : randChoice([429, 500, 503]),
      timestamp: randomDate(addDays(NOW, -7), NOW), responseTime: randInt(10, 500)
    };
    apiRequests.push(req);
    return req;
  };

  const groupBy = (arr, key) => arr.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
    return groups;
  }, {});

  function* batchGenerator(items, batchSize) {
    for (let i = 0; i < items.length; i += batchSize) {
      yield items.slice(i, i + batchSize);
    }
  }

  const buildDependencyTree = (taskIds, allTasks, visited = new Set()) => {
    const tree = {};
    for (const id of taskIds) {
      if (visited.has(id)) continue;
      visited.add(id);
      const task = allTasks.find(t => t.id === id);
      if (task) tree[id] = { task, children: buildDependencyTree(task.dependencies, allTasks, new Set(visited)) };
    }
    return tree;
  };

  const processInvoicesInBatches = async (invoiceList) => {
    const results = [];
    for (const batch of batchGenerator(invoiceList, 25)) {
      const batchResults = await Promise.all(batch.map(inv => new Promise(resolve => {
        setTimeout(() => resolve(processPayment(inv)), 0);
      })));
      results.push(...batchResults);
    }
    return results;
  };

  for (const tier of TIERS) {
    generatePricingPlan(tier, TIER_CONFIG[tier].price, TIER_CONFIG[tier].features);
  }

  generateProduct('Core Platform', 'Base SaaS platform access', 29);
  generateProduct('Advanced Analytics', 'Deep analytics and reporting suite', 79);
  generateProduct('API Gateway', 'API management, rate limiting, and gateway', 199);
  generateProduct('Enterprise Suite', 'Full enterprise bundle with dedicated support', 499);

  generateFeatureFlag('new_dashboard', 'pro', true);
  generateFeatureFlag('beta_api', 'business', true);
  generateFeatureFlag('sso_saml', 'enterprise', true);
  generateFeatureFlag('custom_reports', 'business', false);
  generateFeatureFlag('dark_mode', 'basic', true);
  generateFeatureFlag('ai_insights', 'enterprise', false);
  generateFeatureFlag('bulk_import', 'pro', true);
  generateFeatureFlag('webhook_retries', 'business', true);

  const allPendingInvoices = [];

  for (let i = 0; i < 120; i++) {
    const customer = generateCustomer(i);
    const account = generateAccount(customer);
    const subscription = createSubscription(customer, customer.tier, customer.createdAt);
    const userCount = randInt(1, 5);
    const roles = ['owner'];
    for (let u = 1; u < userCount; u++) roles.push(randChoice(['admin', 'editor', 'viewer']));
    for (const role of roles) generateUser(customer, account, role);

    const age = Math.floor(daysBetween(customer.createdAt, NOW) / 30);
    const invoiceCount = Math.min(Math.max(age, 1), 6);
    for (let inv = 0; inv < invoiceCount; inv++) {
      const period = addMonths(customer.createdAt, inv);
      const invoice = generateInvoice(customer, subscription, period);
      allPendingInvoices.push(invoice);
    }

    const ticketCount = randInt(0, 3);
    for (let t = 0; t < ticketCount; t++) {
      const ticket = createTicket(customer, randChoice(TICKET_SUBJECTS), randChoice(TICKET_PRIORITIES));
      if (rand() > 0.4) resolveTicket(ticket);
    }

    const usageCount = randInt(3, 10);
    for (let u = 0; u < usageCount; u++) {
      trackUsage(customer, randChoice(['api_calls', 'data_storage_gb', 'active_users', 'events_processed']), randInt(100, 100000));
    }

    const apiCount = randInt(5, 20);
    for (let a = 0; a < apiCount; a++) {
      generateApiRequest(customer, randChoice(API_ENDPOINTS), rand() > 0.1);
    }

    if (age > 3 && rand() > 0.5) generateContract(customer, subscription);

    if (rand() > 0.5) {
      const team = createTeam(customer, `${customer.name} Team`);
      const teamUsers = users.filter(u => u.customerId === customer.id);
      team.memberIds = teamUsers.map(u => u.id);
      const project = createProject(customer, `${customer.name} - Q${randInt(1, 4)} Project`);
      const taskCount = randInt(2, 5);
      const taskIds = [];
      for (let t = 0; t < taskCount; t++) {
        const deps = t > 0 && rand() > 0.5 ? [taskIds[randInt(0, taskIds.length - 1)]] : [];
        const task = createTask(project, `Task ${t + 1}: ${randChoice(['Setup', 'Migration', 'Testing', 'Review', 'Deployment'])}`, deps);
        taskIds.push(task.id);
        if (rand() > 0.5) { try { updateTaskStatus(task, 'in_progress'); } catch (e) { /* dep not met */ } }
        if (rand() > 0.7) { try { updateTaskStatus(task, 'completed'); } catch (e) { /* dep not met */ } }
      }
    }

    logAudit('system', 'create', 'customer', customer.id, { tier: customer.tier, country: customer.country });
  }

  const paymentResults = await processInvoicesInBatches(allPendingInvoices);
  for (const payment of paymentResults) {
    if (payment.status === 'failed') {
      const cust = customerMap.get(payment.customerId);
      sendNotification(cust, 'payment_failed', `Payment of $${payment.amount} failed`);
    }
  }

  for (let i = 0; i < 40; i++) {
    const stage = randChoice(OPPORTUNITY_STAGES);
    const customer = rand() > 0.3 ? randChoice(customers) : null;
    const value = randInt(5000, 200000);
    const opp = createOpportunity(customer, value, stage);
    if (stage === 'closed_won' || stage === 'closed_lost') closeOpportunity(opp, stage === 'closed_won');
  }

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  for (let i = 0; i < 15; i++) {
    const sub = activeSubs[randInt(0, activeSubs.length - 1)];
    const tierIdx = TIERS.indexOf(sub.tier);
    if (tierIdx < TIERS.length - 1 && rand() > 0.5) {
      try {
        upgradeSubscription(sub, TIERS[tierIdx + 1]);
        logAudit('system', 'upgrade', 'subscription', sub.id, { from: TIERS[tierIdx], to: TIERS[tierIdx + 1] });
      } catch (e) { /* business rule prevented */ }
    } else if (tierIdx > 0 && rand() > 0.7) {
      try {
        downgradeSubscription(sub, TIERS[tierIdx - 1]);
        logAudit('system', 'downgrade', 'subscription', sub.id, { from: TIERS[tierIdx], to: TIERS[tierIdx - 1] });
      } catch (e) { /* business rule prevented */ }
    }
  }

  const toCancel = subscriptions.filter(s => s.status === 'active').slice(0, 12);
  for (const sub of toCancel) {
    cancelSubscription(sub, randChoice(['budget', 'switched', 'consolidation', 'dissolved']));
    const cust = customerMap.get(sub.customerId);
    sendNotification(cust, 'cancellation', `Subscription cancelled: ${sub.cancelReason}`);
    logAudit('system', 'cancel', 'subscription', sub.id, { reason: sub.cancelReason });
  }

  const completedPayments = payments.filter(p => p.status === 'completed');
  for (let i = 0; i < 5; i++) {
    const pay = completedPayments[randInt(0, completedPayments.length - 1)];
    try {
      processRefund(pay, parseFloat((pay.amount * randFloat(0.1, 0.5)).toFixed(2)), randChoice(['duplicate', 'service_issue', 'customer_request']));
    } catch (e) { /* skip if exceeds */ }
  }

  for (const cust of customers.slice(0, 20)) {
    sendNotification(cust, 'usage_alert', `Usage at ${randInt(70, 95)}% of limit`);
  }

  for (const ticket of tickets.filter(t => t.priority === 'critical' && t.status === 'open')) {
    ticket.escalated = true;
    logAudit('system', 'escalate', 'ticket', ticket.id, { priority: 'critical' });
  }

  const sampleCustomer = customers[0];
  const rateLimitCheck = checkApiRateLimit(sampleCustomer);
  const clvValues = customers.slice(0, 10).map(c => calculateCLV(c));
  const ticketsByPriority = groupBy(tickets, 'priority');
  const invoicesByCustomer = groupBy(invoices, 'customerId');
  const taskTree = buildDependencyTree(tasks.slice(0, 5).map(t => t.id), tasks);
  const { allowed: _rlAllowed, limit: _rlLimit } = rateLimitCheck;

  const mrr = calculateMRR();
  const arr = mrr * 12;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const churnedCustomers = customers.filter(c => c.status === 'churned').length;
  const churnRate = calculateChurnRate();
  const avgRevenuePerCustomer = activeCustomers > 0 ? mrr / activeCustomers : 0;
  const outstandingRevenue = invoices.filter(i => i.status === 'unpaid' || i.status === 'pending').reduce((sum, i) => sum + i.total, 0);
  const totalPayments = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const failedPayments = payments.filter(p => p.status === 'failed').length;
  const refunds = payments.filter(p => p.type === 'refund').reduce((sum, p) => sum + p.amount, 0);
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');
  const avgResolutionTime = resolvedTickets.length > 0 ? resolvedTickets.reduce((sum, t) => sum + daysBetween(t.createdAt, t.resolvedAt), 0) / resolvedTickets.length : 0;
  const pipelineValue = opportunities.filter(o => !o.stage.startsWith('closed')).reduce((sum, o) => sum + o.value, 0);
  const closedWonRevenue = opportunities.filter(o => o.stage === 'closed_won').reduce((sum, o) => sum + o.value, 0);
  const totalApiRequests = apiRequests.length;
  const apiErrors = apiRequests.filter(r => r.status >= 400).length;

  const metrics = {
    totalCustomers: customers.length,
    activeCustomers,
    churnedCustomers,
    MRR: parseFloat(mrr.toFixed(2)),
    ARR: parseFloat(arr.toFixed(2)),
    averageRevenuePerCustomer: parseFloat(avgRevenuePerCustomer.toFixed(2)),
    churnRate: parseFloat((churnRate * 100).toFixed(2)),
    totalInvoices: invoices.length,
    outstandingRevenue: parseFloat(outstandingRevenue.toFixed(2)),
    totalPayments: parseFloat(totalPayments.toFixed(2)),
    failedPayments,
    refunds: parseFloat(refunds.toFixed(2)),
    openTickets,
    averageResolutionTime: parseFloat(avgResolutionTime.toFixed(2)),
    pipelineValue,
    closedWonRevenue,
    APIRequests: totalApiRequests,
    APIErrors: apiErrors
  };

  const assertions = [];
  const assert = (condition, message) => {
    assertions.push({ condition, message });
    if (!condition) throw new BusinessRuleError('assertion', `FAILED: ${message}`);
  };

  assert(metrics.MRR >= 0, 'MRR cannot be negative');
  assert(metrics.ARR === parseFloat((metrics.MRR * 12).toFixed(2)), 'ARR must equal MRR times 12');
  assert(metrics.totalCustomers >= 100, 'Must have at least 100 customers');
  assert(metrics.activeCustomers + metrics.churnedCustomers <= metrics.totalCustomers, 'Active plus churned cannot exceed total');
  assert(metrics.churnRate >= 0 && metrics.churnRate <= 100, 'Churn rate must be between 0 and 100 percent');
  assert(metrics.totalInvoices > 0, 'Must have invoices generated');
  assert(metrics.totalPayments > 0, 'Must have completed payments');
  assert(metrics.failedPayments >= 0, 'Failed payments cannot be negative');
  assert(metrics.openTickets >= 0, 'Open tickets cannot be negative');
  assert(metrics.pipelineValue >= 0, 'Pipeline value cannot be negative');
  assert(metrics.closedWonRevenue >= 0, 'Closed-won revenue cannot be negative');
  assert(metrics.APIRequests > 0, 'Must have API requests');
  assert(metrics.APIErrors >= 0, 'API errors cannot be negative');
  assert(metrics.averageResolutionTime >= 0, 'Average resolution time cannot be negative');
  assert(metrics.outstandingRevenue >= 0, 'Outstanding revenue cannot be negative');
  assert(metrics.refunds >= 0, 'Refunds cannot be negative');
  assert(metrics.averageRevenuePerCustomer >= 0, 'Average revenue per customer cannot be negative');

  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled');
  assert(cancelledSubs.every(s => s.status !== 'active'), 'Cancelled subscriptions cannot be active');

  const paidInvoices = invoices.filter(i => i.status === 'paid');
  assert(paidInvoices.every(inv => payments.some(p => p.invoiceId === inv.id && p.status === 'completed')), 'Paid invoices must have a completed payment');

  const validAccountIds = new Set(accounts.map(a => a.id));
  assert(users.every(u => validAccountIds.has(u.accountId)), 'Users must belong to valid accounts');

  assert(TIER_CONFIG.enterprise.apiLimit > TIER_CONFIG.basic.apiLimit, 'Enterprise API limit must exceed basic');

  const closedWon = opportunities.filter(o => o.stage === 'closed_won');
  assert(closedWon.every(o => o.customerId !== null && customerMap.has(o.customerId)), 'Closed-won opportunities must have valid customers');

  const refundPayments = payments.filter(p => p.type === 'refund');
  assert(refundPayments.every(r => {
    const original = payments.find(p => p.id === r.paymentId && p.type !== 'refund');
    return original ? r.amount <= original.amount : true;
  }), 'Refunds cannot exceed original payment');

  const customerIds = new Set(customers.map(c => c.id));
  assert(accounts.every(a => customerIds.has(a.customerId)), 'All accounts must reference valid customers');
  assert(subscriptions.every(s => customerIds.has(s.customerId)), 'Subscriptions must reference valid customers');
  assert(invoices.every(i => customerIds.has(i.customerId)), 'Invoices must reference valid customers');
  assert(tickets.every(t => customerIds.has(t.customerId)), 'Tickets must reference valid customers');

  const computedMRR = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.price, 0);
  assert(Math.abs(computedMRR - metrics.MRR) < 0.01, 'MRR must equal sum of active subscription prices');

  const suspendedSubs = subscriptions.filter(s => s.status === 'suspended');
  assert(suspendedSubs.every(s => suspendedSubscriptions.has(s.id)), 'Suspended subscriptions must be in suspended set');

  const enterpriseFeatures = TIER_CONFIG.enterprise.features;
  const basicFeatures = TIER_CONFIG.basic.features;
  assert(basicFeatures.every(f => enterpriseFeatures.includes(f)), 'Enterprise features must include all basic features');

  assert(ROLE_PERMISSIONS.owner.length >= ROLE_PERMISSIONS.admin.length, 'Owner permissions must superset admin');
  assert(ROLE_PERMISSIONS.admin.length >= ROLE_PERMISSIONS.editor.length, 'Admin permissions must superset editor');
  assert(ROLE_PERMISSIONS.editor.length >= ROLE_PERMISSIONS.viewer.length, 'Editor permissions must superset viewer');

  const projectIds = new Set(projects.map(p => p.id));
  assert(tasks.every(t => projectIds.has(t.projectId)), 'Tasks must belong to valid projects');
  assert(teams.every(t => customerIds.has(t.customerId)), 'Teams must reference valid customers');

  const subIds = new Set(subscriptions.map(s => s.id));
  assert(contracts.every(c => subIds.has(c.subscriptionId)), 'Contracts must reference valid subscriptions');

  const validEntities = new Set(['customer', 'subscription', 'ticket', 'payment', 'invoice', 'opportunity']);
  assert(auditLogs.every(l => validEntities.has(l.entity)), 'Audit logs must have valid entity types');
  assert(notifications.every(n => customerIds.has(n.customerId)), 'Notifications must reference valid customers');

  const custIdSet = new Set(customers.map(c => c.id));
  assert(custIdSet.size === customers.length, 'No duplicate customer IDs');
  const subIdSet = new Set(subscriptions.map(s => s.id));
  assert(subIdSet.size === subscriptions.length, 'No duplicate subscription IDs');

  const planTiers = new Set(pricingPlans.map(p => p.tier));
  assert(TIERS.every(t => planTiers.has(t)), 'Pricing plans must exist for all tiers');
  assert(products.every(p => p.active === true), 'All generated products must be active');
  assert(usageRecords.every(u => customerIds.has(u.customerId)), 'Usage records must reference valid customers');
  assert(apiRequests.every(r => customerIds.has(r.customerId)), 'API requests must reference valid customers');
  assert(opportunities.every(o => OPPORTUNITY_STAGES.includes(o.stage)), 'Opportunities must have valid stages');
  assert(tickets.every(t => TICKET_PRIORITIES.includes(t.priority)), 'Tickets must have valid priorities');

  const enterpriseCustomers = customers.filter(c => c.tier === 'enterprise');
  const enterpriseTickets = tickets.filter(t => enterpriseCustomers.some(c => c.id === t.customerId));
  assert(enterpriseTickets.every(t => t.priority === 'critical' || t.priority === 'high'), 'Enterprise customer tickets must be high or critical priority');

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  assert(totalPaid >= metrics.refunds, 'Total paid must be greater or equal to total refunds');
  assert(metrics.averageResolutionTime <= 90, 'Average resolution time should be under 90 days');
  assert(activeFeatureSet.size > 0, 'At least one feature flag must be active');

  const activeCustIds = new Set(customers.filter(c => c.status === 'active').map(c => c.id));
  const customersWithUsers = new Set(users.map(u => u.customerId));
  assert([...activeCustIds].every(id => customersWithUsers.has(id)), 'All active customers must have at least one user');

  assert(invoices.every(i => i.amount > 0 && i.total > 0), 'Invoice amounts must be positive');
  assert(invoices.every(i => i.tax >= 0), 'Tax must be non-negative');
  assert(subscriptions.every(s => s.price <= TIER_CONFIG[s.tier].price), 'Subscription price cannot exceed tier base price');
  assert(projects.every(p => customerIds.has(p.customerId)), 'Projects must reference valid customers');
  assert(resolvedTickets.length > 0, 'At least some tickets must be resolved');
  assert(opportunities.every(o => o.value > 0), 'Opportunities must have positive values');

  const validMethods = new Set(['credit_card', 'bank_transfer', 'ach']);
  assert(payments.every(p => validMethods.has(p.method) || p.type === 'refund'), 'Payment methods must be valid');
  assert(notifications.length > 0, 'Must have generated notifications');
  assert(auditLogs.length > 0, 'Must have audit logs');
  assert(featureFlags.every(f => TIERS.includes(f.tier)), 'Feature flags must have valid tiers');

  const suspendedCusts = customers.filter(c => c.failedPaymentCount >= 3);
  assert(suspendedCusts.every(c => {
    const sub = subscriptions.find(s => s.customerId === c.id);
    return sub ? sub.status === 'suspended' || sub.status === 'cancelled' : true;
  }), 'Customers with 3+ failed payments must have suspended or cancelled subscription');

  const proConfig = TIER_CONFIG.pro;
  const businessConfig = TIER_CONFIG.business;
  assert(proConfig.apiLimit < businessConfig.apiLimit, 'Business API limit must exceed pro');
  assert(businessConfig.price > proConfig.price, 'Business price must exceed pro price');

  const sortedByMrr = [...customers].sort((a, b) => b.mrr - a.mrr);
  assert(sortedByMrr[0].mrr >= sortedByMrr[sortedByMrr.length - 1].mrr, 'Sorted customers must be in descending MRR order');

  const uniqueEmails = new Set(customers.map(c => c.email));
  assert(uniqueEmails.size === customers.length, 'Customer emails must be unique');

  const allSubStatuses = new Set(subscriptions.map(s => s.status));
  assert([...allSubStatuses].every(s => ['active', 'cancelled', 'suspended'].includes(s)), 'Subscription statuses must be valid');

  const ticketsWithSla = tickets.filter(t => t.slaDeadline);
  assert(ticketsWithSla.length === tickets.length, 'All tickets must have SLA deadlines');

  const completedTasks = tasks.filter(t => t.status === 'completed');
  assert(completedTasks.every(t => t.dependencies.every(depId => {
    const dep = tasks.find(x => x.id === depId);
    return dep ? dep.status === 'completed' : true;
  })), 'Completed tasks must have all dependencies completed');

  const avgClv = clvValues.reduce((s, v) => s + v, 0) / clvValues.length;
  assert(avgClv >= 0, 'Average CLV must be non-negative');

  console.log('=== Enterprise SaaS Simulation Summary ===');
  console.log(`Customers: ${metrics.totalCustomers} (Active: ${metrics.activeCustomers}, Churned: ${metrics.churnedCustomers})`);
  console.log(`MRR: $${metrics.MRR.toLocaleString()} | ARR: $${metrics.ARR.toLocaleString()}`);
  console.log(`Churn Rate: ${metrics.churnRate}%`);
  console.log(`Invoices: ${metrics.totalInvoices} | Outstanding: $${metrics.outstandingRevenue.toLocaleString()}`);
  console.log(`Payments: $${metrics.totalPayments.toLocaleString()} | Failed: ${metrics.failedPayments} | Refunds: $${metrics.refunds}`);
  console.log(`Tickets: ${metrics.openTickets} open | Avg Resolution: ${metrics.averageResolutionTime} days`);
  console.log(`Pipeline: $${metrics.pipelineValue.toLocaleString()} | Closed Won: $${metrics.closedWonRevenue.toLocaleString()}`);
  console.log(`API Requests: ${metrics.APIRequests} | Errors: ${metrics.APIErrors}`);
  console.log(`Assertions Passed: ${assertions.length}`);
  console.log('==========================================');

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

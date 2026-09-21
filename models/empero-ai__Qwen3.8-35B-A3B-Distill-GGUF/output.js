function runEnterpriseSimulation() {
  const SEED = 42;
  let seedState = SEED;

  function seededRandom() {
    seedState = (seedState * 1103515245 + 12345) & 0x7fffffff;
    return seedState / 0x7fffffff;
  }

  function seededRandomInt(min, max) {
    return Math.floor(seededRandom() * (max - min + 1)) + min;
  }

  function seededRandomChoice(arr) {
    return arr[seededRandomInt(0, arr.length - 1)];
  }

  function generateId(prefix) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = prefix + "-";
    for (let i = 0; i < 12; i++) {
      id += chars[seededRandomInt(0, chars.length - 1)];
    }
    return id;
  }

  function generateDate(startYear, endYear) {
    const start = new Date(startYear, 0, 1).getTime();
    const end = new Date(endYear, 11, 31).getTime();
    const random = seededRandom() * (end - start) + start;
    return new Date(random);
  }

  function generateDateRange(startYear, endYear) {
    const start = generateDate(startYear, endYear);
    const days = seededRandomInt(1, 365);
    const end = new Date(start.getTime() + days * 86400000);
    return { start, end };
  }

  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  function daysBetween(a, b) {
    return Math.round((b - a) / 86400000);
  }

  function monthsBetween(a, b) {
    return (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function groupBy(arr, keyFn) {
    const map = new Map();
    for (const item of arr) {
      const key = keyFn(item);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return map;
  }

  function sumBy(arr, keyFn) {
    return arr.reduce((acc, item) => acc + keyFn(item), 0);
  }

  function average(arr) {
    if (arr.length === 0) return 0;
    return sumBy(arr, (x) => x) / arr.length;
  }

  function percentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[clamp(index, 0, sorted.length - 1)];
  }

  function generateEmail(first, last) {
    const domains = ["acme.com", "techcorp.io", "globalnet.org", "innovate.co", "dataflow.net"];
    const domain = seededRandomChoice(domains);
    return `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`;
  }

  function generateName() {
    const firstNames = ["James", "Sarah", "Michael", "Emily", "David", "Lisa", "Robert", "Jennifer", "William", "Maria", "Thomas", "Anna", "Daniel", "Rachel", "Christopher", "Laura", "Matthew", "Sophie", "Andrew", "Emma", "Kevin", "Olivia", "Brian", "Grace", "Steven", "Natalie", "Paul", "Hannah", "Mark", "Jessica", "Timothy", "Amanda", "George", "Rebecca", "Charles", "Stephanie", "Edward", "Michelle", "Ronald", "Karen"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"];
    return { first: seededRandomChoice(firstNames), last: seededRandomChoice(lastNames) };
  }

  function generateAddress() {
    const streets = ["Oak", "Maple", "Cedar", "Pine", "Elm", "Birch", "Willow", "Spruce", "Ash", "Walnut"];
    const cities = ["New York", "San Francisco", "Chicago", "Austin", "Seattle", "Boston", "Denver", "Portland", "Miami", "Atlanta"];
    const states = ["NY", "CA", "IL", "TX", "WA", "MA", "CO", "OR", "FL", "GA"];
    return {
      street: `${seededRandomInt(100, 9999)} ${seededRandomChoice(streets)} ${seededRandomChoice(["St", "Ave", "Blvd", "Dr", "Ln"])}`,
      city: seededRandomChoice(cities),
      state: seededRandomChoice(states),
      zip: `${seededRandomInt(10000, 99999)}`,
      country: seededRandomChoice(["US", "CA", "UK", "DE", "FR", "AU", "JP", "BR"])
    };
  }

  function generatePhone() {
    const area = seededRandomInt(200, 999);
    const prefix = seededRandomInt(200, 999);
    const suffix = seededRandomInt(1000, 9999);
    return `+1-${area}-${prefix}-${suffix}`;
  }

  function generateCompany() {
    const prefixes = ["Tech", "Data", "Cloud", "Net", "Sys", "Dev", "Code", "Web", "App", "Soft", "Inno", "Global", "Prime", "Elite", "Apex", "Nova", "Zen", "Core", "Base", "Next"];
    const suffixes = ["Corp", "Inc", "Labs", "IO", "Tech", "Solutions", "Systems", "Group", "Partners", "Ventures", "Dynamics", "Works", "Hub", "Flow", "Stack", "Forge", "Craft", "Bridge", "Pulse", "Wave"];
    return {
      name: `${seededRandomChoice(prefixes)}${seededRandomChoice(suffixes)}`,
      industry: seededRandomChoice(["Technology", "Healthcare", "Finance", "Retail", "Manufacturing", "Education", "Media", "Real Estate", "Logistics", "Energy"]),
      size: seededRandomChoice(["Startup", "Small", "Medium", "Large", "Enterprise"]),
      revenue: seededRandomInt(500000, 500000000)
    };
  }

  function generatePlanId() {
    return generateId("plan");
  }

  function generateCustomerId() {
    return generateId("cust");
  }

  function generateAccountId() {
    return generateId("acct");
  }

  function generateUserId() {
    return generateId("user");
  }

  function generateSubscriptionId() {
    return generateId("sub");
  }

  function generateInvoiceId() {
    return generateId("inv");
  }

  function generatePaymentId() {
    return generateId("pay");
  }

  function generateTicketId() {
    return generateId("tkt");
  }

  function generateOpportunityId() {
    return generateId("opp");
  }

  function generateContractId() {
    return generateId("ctr");
  }

  function generateProjectId() {
    return generateId("proj");
  }

  function generateTaskId() {
    return generateId("task");
  }

  function generateAuditId() {
    return generateId("audit");
  }

  function generateNotificationId() {
    return generateId("notif");
  }

  function generateUsageId() {
    return generateId("usage");
  }

  function generateApiRequestId() {
    return generateId("api");
  }

  const PLANS = [
    { id: generatePlanId(), name: "Free", tier: "free", monthlyPrice: 0, annualPrice: 0, apiLimit: 1000, maxUsers: 3, maxProjects: 1, features: ["basic_analytics", "email_support"], slug: "free" },
    { id: generatePlanId(), name: "Starter", tier: "starter", monthlyPrice: 29, annualPrice: 290, apiLimit: 10000, maxUsers: 10, maxProjects: 5, features: ["basic_analytics", "email_support", "api_access", "custom_domains"], slug: "starter" },
    { id: generatePlanId(), name: "Professional", tier: "professional", monthlyPrice: 99, annualPrice: 990, apiLimit: 50000, maxUsers: 50, maxProjects: 20, features: ["advanced_analytics", "priority_support", "api_access", "custom_domains", "webhooks", "sso"], slug: "professional" },
    { id: generatePlanId(), name: "Business", tier: "business", monthlyPrice: 249, annualPrice: 2490, apiLimit: 200000, maxUsers: 200, maxProjects: 100, features: ["advanced_analytics", "priority_support", "api_access", "custom_domains", "webhooks", "sso", "sla_99", "dedicated_account_manager"], slug: "business" },
    { id: generatePlanId(), name: "Enterprise", tier: "enterprise", monthlyPrice: 799, annualPrice: 7990, apiLimit: 1000000, maxUsers: -1, maxProjects: -1, features: ["advanced_analytics", "priority_support", "api_access", "custom_domains", "webhooks", "sso", "sla_99", "dedicated_account_manager", "custom_integrations", "white_label", "audit_log", "compliance_reports"], slug: "enterprise" }
  ];

  const OPPORTUNITY_STAGES = ["discovery", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"];
  const TICKET_STATUSES = ["open", "in_progress", "pending", "resolved", "closed"];
  const TICKET_PRIORITIES = ["low", "medium", "high", "critical"];
  const TASK_STATUSES = ["todo", "in_progress", "in_review", "done", "blocked"];
  const TASK_PRIORITIES = ["low", "medium", "high", "urgent"];
  const NOTIFICATION_TYPES = ["email", "sms", "in_app", "webhook"];
  const AUDIT_ACTIONS = ["create", "update", "delete", "login", "logout", "upgrade", "downgrade", "cancel", "payment", "refund", "escalate", "assign", "resolve"];
  const API_ENDPOINTS = ["/api/v1/customers", "/api/v1/subscriptions", "/api/v1/invoices", "/api/v1/users", "/api/v1/products", "/api/v1/usage", "/api/v1/analytics", "/api/v1/reports", "/api/v1/teams", "/api/v1/projects"];
  const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  const customers = [];
  const users = [];
  const accounts = [];
  const products = [];
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
  const featureFlags = new Map();
  const permissions = new Map();
  const teams = [];
  const projects = [];
  const tasks = [];

  const taxRate = 0.08;
  const volumeDiscountThreshold = 100;
  const volumeDiscountRate = 0.15;
  const maxFailedPayments = 3;
  const slaHours = { low: 72, medium: 24, high: 8, critical: 4 };
  const featureFlagDefaults = {
    new_dashboard: true,
    dark_mode: true,
    beta_api: false,
    advanced_reporting: true,
    team_collaboration: true,
    export_to_csv: true,
    custom_fields: false,
    multi_currency: true,
    automated_workflows: false,
    ai_assistant: false
  };

  for (const [key, value] of Object.entries(featureFlagDefaults)) {
    featureFlags.set(key, value);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^\+\d{1,3}-\d{3}-\d{3}-\d{4}$/.test(phone);
  }

  function validateDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
  }

  function validatePositiveNumber(value) {
    return typeof value === "number" && value > 0;
  }

  function validateNonNegativeNumber(value) {
    return typeof value === "number" && value >= 0;
  }

  function validateString(value) {
    return typeof value === "string" && value.length > 0;
  }

  function validateId(id) {
    return typeof id === "string" && id.startsWith("id-") && id.length > 10;
  }

  function validateSubscription(subscription) {
    if (!validateId(subscription.id)) throw new Error("Invalid subscription ID");
    if (!validateId(subscription.customerId)) throw new Error("Invalid customer ID");
    if (!validateId(subscription.planId)) throw new Error("Invalid plan ID");
    if (!validateDate(subscription.startDate)) throw new Error("Invalid start date");
    if (!validateNonNegativeNumber(subscription.monthlyPrice)) throw new Error("Invalid monthly price");
    if (!validateNonNegativeNumber(subscription.annualPrice)) throw new Error("Invalid annual price");
    return true;
  }

  function validateInvoice(invoice) {
    if (!validateId(invoice.id)) throw new Error("Invalid invoice ID");
    if (!validateId(invoice.subscriptionId)) throw new Error("Invalid subscription ID");
    if (!validateNonNegativeNumber(invoice.total)) throw new Error("Invalid total");
    if (!validateDate(invoice.dueDate)) throw new Error("Invalid due date");
    return true;
  }

  function validatePayment(payment) {
    if (!validateId(payment.id)) throw new Error("Invalid payment ID");
    if (!validateId(payment.invoiceId)) throw new Error("Invalid invoice ID");
    if (!validateNonNegativeNumber(payment.amount)) throw new Error("Invalid amount");
    return true;
  }

  function validateTicket(ticket) {
    if (!validateId(ticket.id)) throw new Error("Invalid ticket ID");
    if (!validateId(ticket.customerId)) throw new Error("Invalid customer ID");
    if (!TICKET_STATUSES.includes(ticket.status)) throw new Error("Invalid ticket status");
    if (!TICKET_PRIORITIES.includes(ticket.priority)) throw new Error("Invalid ticket priority");
    return true;
  }

  function validateOpportunity(opportunity) {
    if (!validateId(opportunity.id)) throw new Error("Invalid opportunity ID");
    if (!validateId(opportunity.customerId)) throw new Error("Invalid customer ID");
    if (!OPPORTUNITY_STAGES.includes(opportunity.stage)) throw new Error("Invalid opportunity stage");
    if (!validateNonNegativeNumber(opportunity.value)) throw new Error("Invalid value");
    return true;
  }

  function validateProject(project) {
    if (!validateId(project.id)) throw new Error("Invalid project ID");
    if (!validateId(project.accountId)) throw new Error("Invalid account ID");
    if (!TASK_STATUSES.includes(project.status)) throw new Error("Invalid project status");
    return true;
  }

  function validateTask(task) {
    if (!validateId(task.id)) throw new Error("Invalid task ID");
    if (!validateId(task.projectId)) throw new Error("Invalid project ID");
    if (!TASK_STATUSES.includes(task.status)) throw new Error("Invalid task status");
    if (!TASK_PRIORITIES.includes(task.priority)) throw new Error("Invalid task priority");
    return true;
  }

  function validateAuditLog(log) {
    if (!validateId(log.id)) throw new Error("Invalid audit log ID");
    if (!validateId(log.actorId)) throw new Error("Invalid actor ID");
    if (!AUDIT_ACTIONS.includes(log.action)) throw new Error("Invalid action");
    return true;
  }

  function validateNotification(notification) {
    if (!validateId(notification.id)) throw new Error("Invalid notification ID");
    if (!NOTIFICATION_TYPES.includes(notification.type)) throw new Error("Invalid notification type");
    return true;
  }

  function validateUsageRecord(record) {
    if (!validateId(record.id)) throw new Error("Invalid usage ID");
    if (!validateId(record.customerId)) throw new Error("Invalid customer ID");
    if (!validateNonNegativeNumber(record.count)) throw new Error("Invalid count");
    return true;
  }

  function validateApiRequest(request) {
    if (!validateId(request.id)) throw new Error("Invalid API request ID");
    if (!HTTP_METHODS.includes(request.method)) throw new Error("Invalid HTTP method");
    if (!API_ENDPOINTS.includes(request.endpoint)) throw new Error("Invalid endpoint");
    return true;
  }

  function validateCustomer(customer) {
    if (!validateId(customer.id)) throw new Error("Invalid customer ID");
    if (!validateEmail(customer.email)) throw new Error("Invalid email");
    if (!validatePhone(customer.phone)) throw new Error("Invalid phone");
    if (!validateDate(customer.createdAt)) throw new Error("Invalid created date");
    return true;
  }

  function validateUser(user) {
    if (!validateId(user.id)) throw new Error("Invalid user ID");
    if (!validateEmail(user.email)) throw new Error("Invalid email");
    if (!validateId(user.accountId)) throw new Error("Invalid account ID");
    if (!["active", "inactive", "suspended"].includes(user.status)) throw new Error("Invalid user status");
    return true;
  }

  function validateAccount(account) {
    if (!validateId(account.id)) throw new Error("Invalid account ID");
    if (!validateId(account.customerId)) throw new Error("Invalid customer ID");
    if (!["active", "suspended", "churned"].includes(account.status)) throw new Error("Invalid account status");
    return true;
  }

  function createCustomer(company, contact) {
    const id = generateCustomerId();
    const customer = {
      id,
      email: generateEmail(contact.first, contact.last),
      phone: generatePhone(),
      company: company.name,
      industry: company.industry,
      size: company.size,
      revenue: company.revenue,
      address: generateAddress(),
      createdAt: generateDate(2020, 2024),
      updatedAt: new Date(),
      status: "active",
      tags: [],
      notes: ""
    };
    validateCustomer(customer);
    customers.push(customer);
    return customer;
  }

  function createAccount(customer) {
    const id = generateAccountId();
    const account = {
      id,
      customerId: customer.id,
      name: customer.company,
      status: "active",
      createdAt: customer.createdAt,
      updatedAt: new Date(),
      unpaidInvoiceCount: 0,
      totalPaid: 0,
      totalSpent: 0,
      lastPaymentDate: null,
      nextBillingDate: null
    };
    validateAccount(account);
    accounts.push(account);
    return account;
  }

  function createUser(account, role) {
    const contact = generateName();
    const id = generateUserId();
    const user = {
      id,
      accountId: account.id,
      email: generateEmail(contact.first, contact.last),
      firstName: contact.first,
      lastName: contact.last,
      role,
      status: "active",
      lastLoginAt: generateDate(2023, 2024),
      createdAt: generateDate(2022, 2024),
      updatedAt: new Date(),
      permissions: getRolePermissions(role)
    };
    validateUser(user);
    users.push(user);
    return user;
  }

  function getRolePermissions(role) {
    const roleMap = {
      admin: ["read", "write", "delete", "manage_users", "manage_billing", "manage_settings", "view_analytics", "export_data"],
      editor: ["read", "write", "manage_billing", "view_analytics"],
      viewer: ["read", "view_analytics"],
      billing: ["read", "write", "manage_billing", "view_analytics"],
      support: ["read", "write", "manage_billing"],
      developer: ["read", "write", "manage_settings", "view_analytics", "export_data"]
    };
    return roleMap[role] || ["read"];
  }

  function hasPermission(user, permission) {
    return user.permissions.includes(permission);
  }

  function canUpgrade(customer, newPlan) {
    const account = accounts.find((a) => a.customerId === customer.id);
    if (!account) return false;
    if (account.unpaidInvoiceCount > 0) return false;
    if (account.status !== "active") return false;
    return true;
  }

  function canDowngrade(customer, newPlan) {
    const account = accounts.find((a) => a.customerId === customer.id);
    if (!account) return false;
    if (account.status !== "active") return false;
    return true;
  }

  function canCancel(customer) {
    const account = accounts.find((a) => a.customerId === customer.id);
    if (!account) return false;
    if (account.status !== "active") return false;
    return true;
  }

  function createSubscription(customer, plan, startDate, endDate) {
    const id = generateSubscriptionId();
    const account = accounts.find((a) => a.customerId === customer.id);
    const volumeDiscount = customer.revenue > volumeDiscountThreshold ? volumeDiscountRate : 0;
    const monthlyPrice = plan.monthlyPrice * (1 - volumeDiscount);
    const annualPrice = plan.annualPrice * (1 - volumeDiscount);
    const subscription = {
      id,
      customerId: customer.id,
      planId: plan.id,
      planName: plan.name,
      planTier: plan.tier,
      monthlyPrice,
      annualPrice,
      startDate,
      endDate,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      cancelDate: null,
      cancellationReason: "",
      prorated: false,
      proratedAmount: 0,
      nextBillingDate: new Date(startDate.getTime() + 30 * 86400000),
      totalPaid: 0,
      totalSpent: 0,
      failedPaymentCount: 0,
      isEnterprise: plan.tier === "enterprise",
      hasVolumeDiscount: volumeDiscount > 0
    };
    validateSubscription(subscription);
    subscriptions.push(subscription);
    if (account) {
      account.nextBillingDate = new Date(startDate.getTime() + 30 * 86400000);
    }
    return subscription;
  }

  function upgradeSubscription(subscription, newPlan) {
    const customer = customers.find((c) => c.id === subscription.customerId);
    if (!canUpgrade(customer, newPlan)) {
      throw new Error(`Cannot upgrade customer ${customer.id}: account has unpaid invoices or is not active`);
    }
    const account = accounts.find((a) => a.customerId === customer.id);
    const proratedAmount = subscription.monthlyPrice * 0.5;
    const volumeDiscount = customer.revenue > volumeDiscountThreshold ? volumeDiscountRate : 0;
    const newMonthlyPrice = newPlan.monthlyPrice * (1 - volumeDiscount);
    const newAnnualPrice = newPlan.annualPrice * (1 - volumeDiscount);
    subscription.planId = newPlan.id;
    subscription.planName = newPlan.name;
    subscription.planTier = newPlan.tier;
    subscription.monthlyPrice = newMonthlyPrice;
    subscription.annualPrice = newAnnualPrice;
    subscription.startDate = new Date();
    subscription.endDate = new Date(subscription.startDate.getTime() + 365 * 86400000);
    subscription.prorated = true;
    subscription.proratedAmount = proratedAmount;
    subscription.status = "active";
    subscription.cancelDate = null;
    subscription.cancellationReason = "";
    subscription.nextBillingDate = new Date(subscription.startDate.getTime() + 30 * 86400000);
    subscription.updatedAt = new Date();
    if (account) {
      account.nextBillingDate = subscription.nextBillingDate;
    }
    auditLogs.push({
      id: generateAuditId(),
      actorId: "system",
      action: "upgrade",
      entityType: "subscription",
      entityId: subscription.id,
      details: { fromPlan: subscription.planName, toPlan: newPlan.name, proratedAmount },
      timestamp: new Date(),
      ip: "127.0.0.1"
    });
    return subscription;
  }

  function downgradeSubscription(subscription, newPlan) {
    const customer = customers.find((c) => c.id === subscription.customerId);
    if (!canDowngrade(customer, newPlan)) {
      throw new Error(`Cannot downgrade customer ${customer.id}: account is not active`);
    }
    const proratedAmount = subscription.monthlyPrice * 0.5;
    const volumeDiscount = customer.revenue > volumeDiscountThreshold ? volumeDiscountRate : 0;
    const newMonthlyPrice = newPlan.monthlyPrice * (1 - volumeDiscount);
    const newAnnualPrice = newPlan.annualPrice * (1 - volumeDiscount);
    subscription.planId = newPlan.id;
    subscription.planName = newPlan.name;
    subscription.planTier = newPlan.tier;
    subscription.monthlyPrice = newMonthlyPrice;
    subscription.annualPrice = newAnnualPrice;
    subscription.startDate = new Date();
    subscription.endDate = new Date(subscription.startDate.getTime() + 365 * 86400000);
    subscription.prorated = true;
    subscription.proratedAmount = proratedAmount;
    subscription.status = "active";
    subscription.cancelDate = null;
    subscription.cancellationReason = "";
    subscription.nextBillingDate = new Date(subscription.startDate.getTime() + 30 * 86400000);
    subscription.updatedAt = new Date();
    auditLogs.push({
      id: generateAuditId(),
      actorId: "system",
      action: "downgrade",
      entityType: "subscription",
      entityId: subscription.id,
      details: { fromPlan: subscription.planName, toPlan: newPlan.name, proratedAmount },
      timestamp: new Date(),
      ip: "127.0.0.1"
    });
    return subscription;
  }

  function cancelSubscription(subscription, reason) {
    const customer = customers.find((c) => c.id === subscription.customerId);
    if (!canCancel(customer)) {
      throw new Error(`Cannot cancel subscription for customer ${customer.id}`);
    }
    const proratedAmount = subscription.monthlyPrice * 0.3;
    subscription.status = "cancelled";
    subscription.cancelDate = new Date();
    subscription.cancellationReason = reason;
    subscription.prorated = true;
    subscription.proratedAmount = proratedAmount;
    subscription.updatedAt = new Date();
    const account = accounts.find((a) => a.customerId === customer.id);
    if (account) {
      account.status = "churned";
    }
    auditLogs.push({
      id: generateAuditId(),
      actorId: "system",
      action: "cancel",
      entityType: "subscription",
      entityId: subscription.id,
      details: { reason, proratedAmount },
      timestamp: new Date(),
      ip: "127.0.0.1"
    });
    return subscription;
  }

  function generateInvoice(subscription) {
    const id = generateInvoiceId();
    const startDate = new Date(subscription.nextBillingDate);
    const endDate = new Date(startDate.getTime() + 30 * 86400000);
    const subtotal = subscription.monthlyPrice;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const invoice = {
      id,
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
      planName: subscription.planName,
      startDate,
      endDate,
      subtotal,
      tax,
      total,
      status: "pending",
      dueDate: new Date(endDate.getTime() + 7 * 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
      paidAt: null,
      paymentId: null,
      discount: 0,
      credits: 0,
      notes: ""
    };
    validateInvoice(invoice);
    invoices.push(invoice);
    return invoice;
  }

  function processPayment(invoice) {
    const id = generatePaymentId();
    const success = seededRandom() > 0.1;
    const payment = {
      id,
      invoiceId: invoice.id,
      subscriptionId: invoice.subscriptionId,
      customerId: invoice.customerId,
      amount: invoice.total,
      status: success ? "succeeded" : "failed",
      method: seededRandomChoice(["credit_card", "bank_transfer", "paypal", "stripe"]),
      processedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      error: success ? null : "insufficient_funds",
      refundId: null
    };
    validatePayment(payment);
    payments.push(payment);
    if (success) {
      invoice.status = "paid";
      invoice.paidAt = new Date();
      invoice.paymentId = payment.id;
      invoice.updatedAt = new Date();
      const account = accounts.find((a) => a.customerId === invoice.customerId);
      if (account) {
        account.unpaidInvoiceCount = Math.max(0, account.unpaidInvoiceCount - 1);
        account.totalPaid += payment.amount;
        account.totalSpent += payment.amount;
        account.lastPaymentDate = new Date();
      }
      auditLogs.push({
        id: generateAuditId(),
        actorId: "system",
        action: "payment",
        entityType: "invoice",
        entityId: invoice.id,
        details: { amount: payment.amount, method: payment.method },
        timestamp: new Date(),
        ip: "127.0.0.1"
      });
    } else {
      invoice.status = "unpaid";
      invoice.updatedAt = new Date();
      const account = accounts.find((a) => a.customerId === invoice.customerId);
      if (account) {
        account.unpaidInvoiceCount++;
      }
      const subscription = subscriptions.find((s) => s.id === invoice.subscriptionId);
      if (subscription) {
        subscription.failedPaymentCount++;
        if (subscription.failedPaymentCount >= maxFailedPayments) {
          subscription.status = "suspended";
          subscription.updatedAt = new Date();
          notifications.push({
            id: generateNotificationId(),
            type: "in_app",
            customerId: invoice.customerId,
            title: "Subscription Suspended",
            message: `Your subscription has been suspended due to ${maxFailedPayments} failed payments.`,
            timestamp: new Date(),
            read: false,
            priority: "high"
          });
        }
      }
      notifications.push({
        id: generateNotificationId(),
        type: "email",
        customerId: invoice.customerId,
        title: "Payment Failed",
        message: `Your payment of $${invoice.total.toFixed(2)} failed. Please update your payment method.`,
        timestamp: new Date(),
        read: false,
        priority: "high"
      });
    }
    return payment;
  }

  function processRefund(payment) {
    if (payment.status !== "succeeded") {
      throw new Error("Cannot refund a non-succeeded payment");
    }
    if (payment.refundId) {
      throw new Error("Payment already refunded");
    }
    const refundId = generatePaymentId();
    const refundAmount = Math.min(payment.amount, payment.amount * seededRandom());
    const refund = {
      id: refundId,
      invoiceId: payment.invoiceId,
      subscriptionId: payment.subscriptionId,
      customerId: payment.customerId,
      amount: refundAmount,
      status: "refunded",
      method: "credit_card",
      processedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      error: null,
      refundId: null
    };
    validatePayment(refund);
    payments.push(refund);
    payment.refundId = refundId;
    payment.updatedAt = new Date();
    const invoice = invoices.find((i) => i.id === payment.invoiceId);
    if (invoice) {
      invoice.credits += refundAmount;
      invoice.updatedAt = new Date();
    }
    auditLogs.push({
      id: generateAuditId(),
      actorId: "system",
      action: "refund",
      entityType: "payment",
      entityId: payment.id,
      details: { amount: refundAmount },
      timestamp: new Date(),
      ip: "127.0.0.1"
    });
    notifications.push({
      id: generateNotificationId(),
      type: "email",
      customerId: payment.customerId,
      title: "Refund Processed",
      message: `A refund of $${refundAmount.toFixed(2)} has been processed.`,
      timestamp: new Date(),
      read: false,
      priority: "medium"
    });
    return refund;
  }

  function calculateMRR() {
    const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
    return sumBy(activeSubscriptions, (s) => s.monthlyPrice);
  }

  function calculateARR() {
    return calculateMRR() * 12;
  }

  function calculateChurnRate() {
    const totalCustomers = customers.length;
    const churnedCustomers = customers.filter((c) => {
      const account = accounts.find((a) => a.customerId === c.id);
      return account && account.status === "churned";
    }).length;
    return totalCustomers > 0 ? churnedCustomers / totalCustomers : 0;
  }

  function calculateChurnedCustomers() {
    return customers.filter((c) => {
      const account = accounts.find((a) => a.customerId === c.id);
      return account && account.status === "churned";
    }).length;
  }

  function calculateActiveCustomers() {
    return customers.filter((c) => {
      const account = accounts.find((a) => a.customerId === c.id);
      return account && account.status === "active";
    }).length;
  }

  function calculateAverageRevenuePerCustomer() {
    const active = calculateActiveCustomers();
    if (active === 0) return 0;
    return calculateMRR() / active;
  }

  function calculateOutstandingRevenue() {
    return sumBy(invoices.filter((i) => i.status === "unpaid"), (i) => i.total);
  }

  function calculateTotalPayments() {
    return sumBy(payments.filter((p) => p.status === "succeeded"), (p) => p.amount);
  }

  function calculateFailedPayments() {
    return payments.filter((p) => p.status === "failed").length;
  }

  function calculateRefunds() {
    return sumBy(payments.filter((p) => p.status === "refunded"), (p) => p.amount);
  }

  function calculateOpenTickets() {
    return tickets.filter((t) => t.status === "open").length;
  }

  function calculateAverageResolutionTime() {
    const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed");
    if (resolved.length === 0) return 0;
    const times = resolved.map((t) => daysBetween(t.createdAt, t.resolvedAt || t.updatedAt));
    return average(times);
  }

  function calculatePipelineValue() {
    return sumBy(opportunities.filter((o) => o.stage === "discovery" || o.stage === "qualification" || o.stage === "proposal" || o.stage === "negotiation"), (o) => o.value);
  }

  function calculateClosedWonRevenue() {
    return sumBy(opportunities.filter((o) => o.stage === "closed_won"), (o) => o.value);
  }

  function calculateCustomerLifetimeValue(customer) {
    const customerSubscriptions = subscriptions.filter((s) => s.customerId === customer.id);
    const totalSpent = sumBy(customerSubscriptions, (s) => s.totalSpent);
    const monthsActive = customerSubscriptions.reduce((acc, s) => {
      const months = monthsBetween(s.startDate, s.endDate || new Date());
      return acc + Math.max(0, months);
    }, 0);
    return monthsActive > 0 ? totalSpent / monthsActive : 0;
  }

  function createOpportunity(customer, value) {
    const id = generateOpportunityId();
    const stage = seededRandomChoice(["discovery", "qualification", "proposal", "negotiation"]);
    const opportunity = {
      id,
      customerId: customer.id,
      customerName: customer.company,
      stage,
      value,
      source: seededRandomChoice(["referral", "inbound", "outbound", "partner", "website"]),
      assignedTo: seededRandomChoice(users).id,
      createdAt: generateDate(2023, 2024),
      updatedAt: new Date(),
      closeDate: generateDate(2024, 2025),
      notes: "",
      products: [seededRandomChoice(products).id],
      probability: seededRandomInt(10, 90)
    };
    validateOpportunity(opportunity);
    opportunities.push(opportunity);
    return opportunity;
  }

  function closeOpportunity(opportunity, result) {
    if (result === "won") {
      opportunity.stage = "closed_won";
      opportunity.updatedAt = new Date();
      const customer = customers.find((c) => c.id === opportunity.customerId);
      if (customer) {
        const plan = seededRandomChoice(PLANS.slice(1));
        const subscription = createSubscription(customer, plan, new Date(), new Date(new Date().getTime() + 365 * 86400000));
        const invoice = generateInvoice(subscription);
        processPayment(invoice);
        auditLogs.push({
          id: generateAuditId(),
          actorId: "system",
          action: "create",
          entityType: "customer",
          entityId: customer.id,
          details: { source: "opportunity", opportunityId: opportunity.id },
          timestamp: new Date(),
          ip: "127.0.0.1"
        });
      }
    } else {
      opportunity.stage = "closed_lost";
      opportunity.updatedAt = new Date();
      opportunity.lossReason = seededRandomChoice(["budget", "competitor", "timing", "feature_gap", "no_response"]);
    }
    auditLogs.push({
      id: generateAuditId(),
      actorId: "system",
      action: "update",
      entityType: "opportunity",
      entityId: opportunity.id,
      details: { result },
      timestamp: new Date(),
      ip: "127.0.0.1"
    });
    return opportunity;
  }

  function createTicket(customer, priority, subject) {
    const id = generateTicketId();
    const status = seededRandomChoice(["open", "in_progress", "pending"]);
    const ticket = {
      id,
      customerId: customer.id,
      customerName: customer.company,
      subject,
      description: `Customer ${customer.company} reported an issue: ${subject}`,
      status,
      priority,
      assignedTo: seededRandomChoice(users).id,
      createdAt: generateDate(2023, 2024),
      updatedAt: new Date(),
      resolvedAt: null,
      resolvedBy: null,
      resolutionTime: null,
      tags: [seededRandomChoice(["bug", "feature_request", "billing", "onboarding", "integration"])],
      comments: [],
      slaDeadline: new Date(new Date().getTime() + slaHours[priority] * 3600000),
      escalated: false,
      escalationCount: 0
    };
    validateTicket(ticket);
    tickets.push(ticket);
    return ticket;
  }

  function resolveTicket(ticket) {
    ticket.status = "resolved";
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = "system";
    ticket.resolutionTime = daysBetween(ticket.createdAt, ticket.resolvedAt);
    ticket.updatedAt = new Date();
    auditLogs.push({
      id: generateAuditId(),
      actorId: "system",
      action: "resolve",
      entityType: "ticket",
      entityId: ticket.id,
      details: { resolutionTime: ticket.resolutionTime },
      timestamp: new Date(),
      ip: "127.0.0.1"
    });
    return ticket;
  }

  function escalateTicket(ticket) {
    ticket.escalated = true;
    ticket.escalationCount++;
    ticket.priority = ticket.priority === "high" ? "critical" : ticket.priority;
    ticket.updatedAt = new Date();
    ticket.slaDeadline = new Date(new Date().getTime() + slaHours[ticket.priority] * 3600000);
    auditLogs.push({
      id: generateAuditId(),
      actorId: "system",
      action: "escalate",
      entityType: "ticket",
      entityId: ticket.id,
      details: { escalationCount: ticket.escalationCount },
      timestamp: new Date(),
      ip: "127.0.0.1"
    });
    notifications.push({
      id: generateNotificationId(),
      type: "in_app",
      customerId: ticket.customerId,
      title: "Ticket Escalated",
      message: `Ticket ${ticket.id} has been escalated to priority ${ticket.priority}.`,
      timestamp: new Date(),
      read: false,
      priority: "high"
    });
    return ticket;
  }

  function createProject(account, name) {
    const id = generateProjectId();
    const project = {
      id,
      accountId: account.id,
      name,
      status: "active",
      createdAt: generateDate(2023, 2024),
      updatedAt: new Date(),
      tasks: [],
      milestones: [],
      budget: seededRandomInt(10000, 500000),
      spent: 0
    };
    validateProject(project);
    projects.push(project);
    return project;
  }

  function createTask(project, title, priority) {
    const id = generateTaskId();
    const task = {
      id,
      projectId: project.id,
      title,
      status: "todo",
      priority,
      assignedTo: seededRandomChoice(users).id,
      createdAt: generateDate(2023, 2024),
      updatedAt: new Date(),
      dueDate: new Date(new Date().getTime() + seededRandomInt(1, 30) * 86400000),
      dependencies: [],
      estimatedHours: seededRandomInt(1, 40),
      actualHours: 0,
      completedAt: null
    };
    validateTask(task);
    tasks.push(task);
    project.tasks.push(task.id);
    return task;
  }

  function updateTaskStatus(task, status) {
    if (!TASK_STATUSES.includes(status)) {
      throw new Error(`Invalid task status: ${status}`);
    }
    task.status = status;
    task.updatedAt = new Date();
    if (status === "done") {
      task.completedAt = new Date();
    }
    auditLogs.push({
      id: generateAuditId(),
      actorId: "system",
      action: "update",
      entityType: "task",
      entityId: task.id,
      details: { status },
      timestamp: new Date(),
      ip: "127.0.0.1"
    });
    return task;
  }

  function trackUsage(customer, endpoint, count) {
    const id = generateUsageId();
    const record = {
      id,
      customerId: customer.id,
      endpoint,
      count,
      timestamp: new Date(),
      createdAt: new Date()
    };
    validateUsageRecord(record);
    usageRecords.push(record);
    return record;
  }

  function processApiRequest(customer, endpoint, method) {
    const id = generateApiRequestId();
    const subscription = subscriptions.find((s) => s.customerId === customer.id && s.status === "active");
    const plan = PLANS.find((p) => p.id === (subscription ? subscription.planId : null));
    const apiLimit = plan ? plan.apiLimit : 0;
    const customerUsage = usageRecords.filter((u) => u.customerId === customer.id).reduce((acc, u) => acc + u.count, 0);
    const isRateLimited = customerUsage >= apiLimit && apiLimit > 0;
    const request = {
      id,
      customerId: customer.id,
      endpoint,
      method,
      status: isRateLimited ? "rate_limited" : "success",
      statusCode: isRateLimited ? 429 : 200,
      responseTime: seededRandomInt(10, 500),
      timestamp: new Date(),
      createdAt: new Date(),
      error: isRateLimited ? "rate_limit_exceeded" : null
    };
    validateApiRequest(request);
    apiRequests.push(request);
    if (isRateLimited) {
      notifications.push({
        id: generateNotificationId(),
        type: "email",
        customerId: customer.id,
        title: "API Rate Limit Exceeded",
        message: `Your API usage has exceeded the limit of ${apiLimit} requests. Please upgrade your plan.`,
        timestamp: new Date(),
        read: false,
        priority: "high"
      });
    }
    return request;
  }

  function checkFeatureAvailability(customer, feature) {
    const subscription = subscriptions.find((s) => s.customerId === customer.id && s.status === "active");
    if (!subscription) return false;
    const plan = PLANS.find((p) => p.id === subscription.planId);
    if (!plan) return false;
    if (plan.features.includes(feature)) return true;
    if (featureFlags.has(feature) && featureFlags.get(feature)) return true;
    return false;
  }

  function getCustomerPriority(customer) {
    const subscription = subscriptions.find((s) => s.customerId === customer.id && s.status === "active");
    if (!subscription) return "low";
    if (subscription.planTier === "enterprise") return "critical";
    if (subscription.planTier === "business") return "high";
    if (subscription.planTier === "professional") return "medium";
    return "low";
  }

  function generateAnalytics() {
    const planDistribution = groupBy(subscriptions, (s) => s.planTier);
    const planCounts = {};
    for (const [tier, subs] of planDistribution) {
      planCounts[tier] = subs.length;
    }
    const ticketDistribution = groupBy(tickets, (t) => t.priority);
    const ticketCounts = {};
    for (const [priority, tix] of ticketDistribution) {
      ticketCounts[priority] = tix.length;
    }
    const opportunityDistribution = groupBy(opportunities, (o) => o.stage);
    const opportunityCounts = {};
    for (const [stage, opps] of opportunityDistribution) {
      opportunityCounts[stage] = opps.length;
    }
    const paymentDistribution = groupBy(payments, (p) => p.status);
    const paymentCounts = {};
    for (const [status, pays] of paymentDistribution) {
      paymentCounts[status] = pays.length;
    }
    const apiDistribution = groupBy(apiRequests, (r) => r.status);
    const apiCounts = {};
    for (const [status, reqs] of apiDistribution) {
      apiCounts[status] = reqs.length;
    }
    const topCustomers = [...customers].sort((a, b) => {
      const aSpent = sumBy(subscriptions.filter((s) => s.customerId === a.id), (s) => s.totalSpent);
      const bSpent = sumBy(subscriptions.filter((s) => s.customerId === b.id), (s) => s.totalSpent);
      return bSpent - aSpent;
    }).slice(0, 10);
    return {
      planDistribution,
      planCounts,
      ticketDistribution: ticketCounts,
      opportunityDistribution: opportunityCounts,
      paymentDistribution: paymentCounts,
      apiDistribution: apiCounts,
      topCustomers: topCustomers.map((c) => ({
        id: c.id,
        name: c.company,
        totalSpent: sumBy(subscriptions.filter((s) => s.customerId === c.id), (s) => s.totalSpent)
      }))
    };
  }

  async function runSimulation() {
    const analytics = generateAnalytics();
    return analytics;
  }

  function runAssertions() {
    const assertions = [];
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
      if (!condition) {
        failed++;
        throw new Error(`Assertion failed: ${message}`);
      }
      passed++;
      assertions.push({ passed: true, message });
    }

    assert(customers.length >= 100, `Expected at least 100 customers, got ${customers.length}`);
    assert(users.length > 0, "Expected at least one user");
    assert(accounts.length > 0, "Expected at least one account");
    assert(subscriptions.length > 0, "Expected at least one subscription");
    assert(invoices.length > 0, "Expected at least one invoice");
    assert(payments.length > 0, "Expected at least one payment");
    assert(tickets.length > 0, "Expected at least one ticket");
    assert(opportunities.length > 0, "Expected at least one opportunity");
    assert(projects.length > 0, "Expected at least one project");
    assert(tasks.length > 0, "Expected at least one task");
    assert(auditLogs.length > 0, "Expected at least one audit log");
    assert(notifications.length > 0, "Expected at least one notification");
    assert(apiRequests.length > 0, "Expected at least one API request");
    assert(usageRecords.length > 0, "Expected at least one usage record");

    const mrr = calculateMRR();
    assert(mrr >= 0, `MRR cannot be negative: ${mrr}`);
    const arr = calculateARR();
    assert(arr === mrr * 12, `ARR must equal MRR × 12: ARR=${arr}, MRR×12=${mrr * 12}`);

    const churned = calculateChurnedCustomers();
    assert(churned >= 0, "Churned customers cannot be negative");
    const active = calculateActiveCustomers();
    assert(active + churned <= customers.length, "Active + churned cannot exceed total customers");

    const churnRate = calculateChurnRate();
    assert(churnRate >= 0 && churnRate <= 1, `Churn rate must be between 0 and 1: ${churnRate}`);

    const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
    const cancelledSubscriptions = subscriptions.filter((s) => s.status === "cancelled");
    assert(cancelledSubscriptions.every((s) => s.status !== "active"), "Cancelled subscriptions cannot be active");
    assert(activeSubscriptions.every((s) => s.status === "active"), "Active subscriptions must have status active");

    const paidInvoices = invoices.filter((i) => i.status === "paid");
    assert(paidInvoices.every((i) => i.paymentId !== null), "Paid invoices must have a payment ID");
    assert(paidInvoices.every((i) => i.paidAt !== null), "Paid invoices must have a paid date");

    const unpaidInvoices = invoices.filter((i) => i.status === "unpaid");
    assert(unpaidInvoices.every((i) => i.paymentId === null), "Unpaid invoices must not have a payment ID");

    const allUsers = users;
    assert(allUsers.every((u) => accounts.some((a) => a.id === u.accountId)), "All users must belong to valid accounts");
    assert(allUsers.every((u) => validateEmail(u.email)), "All users must have valid emails");

    const enterprisePlans = PLANS.filter((p) => p.tier === "enterprise");
    const basicPlans = PLANS.filter((p) => p.tier === "free" || p.tier === "starter");
    assert(enterprisePlans.every((p) => p.apiLimit > basicPlans.every((bp) => p.apiLimit > bp.apiLimit)), "Enterprise plans must have higher API limits than basic plans");

    const closedWonOpps = opportunities.filter((o) => o.stage === "closed_won");
    assert(closedWonOpps.every((o) => customers.some((c) => c.id === o.customerId)), "Closed-won opportunities must have associated customers");

    const refunds = payments.filter((p) => p.status === "refunded");
    assert(refunds.every((r) => {
      const original = payments.find((p) => p.id === r.invoiceId || p.invoiceId === r.invoiceId);
      return !original || r.amount <= original.amount;
    }), "Refunds cannot exceed the original payment");

    const suspendedSubscriptions = subscriptions.filter((s) => s.status === "suspended");
    assert(suspendedSubscriptions.every((s) => s.failedPaymentCount >= maxFailedPayments), "Suspended subscriptions must have at least 3 failed payments");

    const enterpriseCustomers = customers.filter((c) => {
      const sub = subscriptions.find((s) => s.customerId === c.id && s.status === "active");
      return sub && sub.planTier === "enterprise";
    });
    assert(enterpriseCustomers.every((c) => getCustomerPriority(c) === "critical"), "Enterprise customers must have critical priority");

    const businessCustomers = customers.filter((c) => {
      const sub = subscriptions.find((s) => s.customerId === c.id && s.status === "active");
      return sub && sub.planTier === "business";
    });
    assert(businessCustomers.every((c) => getCustomerPriority(c) === "high"), "Business customers must have high priority");

    const featureFlagCount = featureFlags.size;
    assert(featureFlagCount >= 5, "Must have at least 5 feature flags");

    const auditActionCount = AUDIT_ACTIONS.length;
    assert(auditLogs.every((l) => AUDIT_ACTIONS.includes(l.action)), "All audit log actions must be valid");

    const ticketPriorities = TICKET_PRIORITIES.length;
    assert(tickets.every((t) => TICKET_PRIORITIES.includes(t.priority)), "All tickets must have valid priorities");

    const taskPriorities = TASK_PRIORITIES.length;
    assert(tasks.every((t) => TASK_PRIORITIES.includes(t.priority)), "All tasks must have valid priorities");

    const opportunityStages = OPPORTUNITY_STAGES.length;
    assert(opportunities.every((o) => OPPORTUNITY_STAGES.includes(o.stage)), "All opportunities must have valid stages");

    const notificationTypes = NOTIFICATION_TYPES.length;
    assert(notifications.every((n) => NOTIFICATION_TYPES.includes(n.type)), "All notifications must have valid types");

    const apiEndpoints = API_ENDPOINTS.length;
    assert(apiRequests.every((r) => API_ENDPOINTS.includes(r.endpoint)), "All API requests must have valid endpoints");

    const httpMethods = HTTP_METHODS.length;
    assert(apiRequests.every((r) => HTTP_METHODS.includes(r.method)), "All API requests must have valid methods");

    const totalInvoices = invoices.length;
    assert(totalInvoices > 0, "Must have at least one invoice");

    const outstandingRevenue = calculateOutstandingRevenue();
    assert(outstandingRevenue >= 0, "Outstanding revenue cannot be negative");

    const totalPayments = calculateTotalPayments();
    assert(totalPayments >= 0, "Total payments cannot be negative");

    const failedPayments = calculateFailedPayments();
    assert(failedPayments >= 0, "Failed payments cannot be negative");

    const refundTotal = calculateRefunds();
    assert(refundTotal >= 0, "Refunds cannot be negative");

    const openTickets = calculateOpenTickets();
    assert(openTickets >= 0, "Open tickets cannot be negative");

    const avgResolutionTime = calculateAverageResolutionTime();
    assert(avgResolutionTime >= 0, "Average resolution time cannot be negative");

    const pipelineValue = calculatePipelineValue();
    assert(pipelineValue >= 0, "Pipeline value cannot be negative");

    const closedWonRevenue = calculateClosedWonRevenue();
    assert(closedWonRevenue >= 0, "Closed won revenue cannot be negative");

    const apiSuccessCount = apiRequests.filter((r) => r.status === "success").length;
    const apiErrorCount = apiRequests.filter((r) => r.status === "rate_limited").length;
    assert(apiSuccessCount + apiErrorCount === apiRequests.length, "API request statuses must be complete");

    const usageTotal = sumBy(usageRecords, (u) => u.count);
    assert(usageTotal >= 0, "Total usage cannot be negative");

    const projectBudgets = projects.map((p) => p.budget);
    assert(projectBudgets.every((b) => b > 0), "All project budgets must be positive");

    const taskEstimates = tasks.map((t) => t.estimatedHours);
    assert(taskEstimates.every((e) => e > 0), "All task estimates must be positive");

    const customerEmails = customers.map((c) => c.email);
    assert(customerEmails.every((e) => validateEmail(e)), "All customer emails must be valid");

    const customerPhones = customers.map((c) => c.phone);
    assert(customerPhones.every((p) => validatePhone(p)), "All customer phones must be valid");

    const subscriptionIds = subscriptions.map((s) => s.id);
    assert(subscriptionIds.every((id) => validateId(id)), "All subscription IDs must be valid");

    const invoiceIds = invoices.map((i) => i.id);
    assert(invoiceIds.every((id) => validateId(id)), "All invoice IDs must be valid");

    const paymentIds = payments.map((p) => p.id);
    assert(paymentIds.every((id) => validateId(id)), "All payment IDs must be valid");

    const ticketIds = tickets.map((t) => t.id);
    assert(ticketIds.every((id) => validateId(id)), "All ticket IDs must be valid");

    const opportunityIds = opportunities.map((o) => o.id);
    assert(opportunityIds.every((id) => validateId(id)), "All opportunity IDs must be valid");

    const projectIds = projects.map((p) => p.id);
    assert(projectIds.every((id) => validateId(id)), "All project IDs must be valid");

    const taskIds = tasks.map((t) => t.id);
    assert(taskIds.every((id) => validateId(id)), "All task IDs must be valid");

    const auditIds = auditLogs.map((l) => l.id);
    assert(auditIds.every((id) => validateId(id)), "All audit log IDs must be valid");

    const notificationIds = notifications.map((n) => n.id);
    assert(notificationIds.every((id) => validateId(id)), "All notification IDs must be valid");

    const usageIds = usageRecords.map((u) => u.id);
    assert(usageIds.every((id) => validateId(id)), "All usage record IDs must be valid");

    const apiIds = apiRequests.map((r) => r.id);
    assert(apiIds.every((id) => validateId(id)), "All API request IDs must be valid");

    const userRoles = users.map((u) => u.role);
    const validRoles = ["admin", "editor", "viewer", "billing", "support", "developer"];
    assert(userRoles.every((r) => validRoles.includes(r)), "All user roles must be valid");

    const accountStatuses = accounts.map((a) => a.status);
    const validAccountStatuses = ["active", "suspended", "churned"];
    assert(accountStatuses.every((s) => validAccountStatuses.includes(s)), "All account statuses must be valid");

    const customerStatuses = customers.map((c) => c.status);
    const validCustomerStatuses = ["active", "inactive", "churned"];
    assert(customerStatuses.every((s) => validCustomerStatuses.includes(s)), "All customer statuses must be valid");

    const planNames = PLANS.map((p) => p.name);
    assert(planNames.every((n) => n.length > 0), "All plan names must be non-empty");

    const planTiers = PLANS.map((p) => p.tier);
    const validTiers = ["free", "starter", "professional", "business", "enterprise"];
    assert(planTiers.every((t) => validTiers.includes(t)), "All plan tiers must be valid");

    const planPrices = PLANS.map((p) => p.monthlyPrice);
    assert(planPrices.every((p) => p >= 0), "All plan prices must be non-negative");

    const planApiLimits = PLANS.map((p) => p.apiLimit);
    assert(planApiLimits.every((l) => l > 0), "All plan API limits must be positive");

    const planMaxUsers = PLANS.map((p) => p.maxUsers);
    assert(planMaxUsers.every((u) => u > 0 || u === -1), "All plan max users must be positive or -1 (unlimited)");

    const planFeatures = PLANS.map((p) => p.features);
    assert(planFeatures.every((f) => Array.isArray(f) && f.length > 0), "All plan features must be non-empty arrays");

    const planSlugs = PLANS.map((p) => p.slug);
    assert(planSlugs.every((s) => s.length > 0), "All plan slugs must be non-empty");

    const planIds = PLANS.map((p) => p.id);
    assert(planIds.every((id) => validateId(id)), "All plan IDs must be valid");

    const planMonthlyPrices = PLANS.map((p) => p.monthlyPrice);
    assert(planMonthlyPrices.every((p) => p >= 0), "All plan monthly prices must be non-negative");

    const planAnnualPrices = PLANS.map((p) => p.annualPrice);
    assert(planAnnualPrices.every((p) => p >= 0), "All plan annual prices must be non-negative");

    const planMaxProjects = PLANS.map((p) => p.maxProjects);
    assert(planMaxProjects.every((p) => p > 0 || p === -1), "All plan max projects must be positive or -1");

    const planDiscounts = subscriptions.filter((s) => s.hasVolumeDiscount);
    assert(planDiscounts.every((s) => s.customer.revenue > volumeDiscountThreshold), "Volume discount only for high-revenue customers");

    const proratedSubscriptions = subscriptions.filter((s) => s.prorated);
    assert(proratedSubscriptions.every((s) => s.proratedAmount > 0), "Prorated subscriptions must have positive prorated amount");

    const cancelledSubscriptionsWithReason = subscriptions.filter((s) => s.status === "cancelled" && !s.cancellationReason);
    assert(cancelledSubscriptionsWithReason.length === 0, "Cancelled subscriptions must have a reason");

    const suspendedSubscriptionsWithReason = subscriptions.filter((s) => s.status === "suspended" && s.cancellationReason);
    assert(suspendedSubscriptionsWithReason.length === 0, "Suspended subscriptions should not have a cancellation reason");

    const activeSubscriptionsWithCancelDate = subscriptions.filter((s) => s.status === "active" && s.cancelDate);
    assert(activeSubscriptionsWithCancelDate.length === 0, "Active subscriptions should not have a cancel date");

    const cancelledSubscriptionsWithNextBilling = subscriptions.filter((s) => s.status === "cancelled" && s.nextBillingDate);
    assert(cancelledSubscriptionsWithNextBilling.length === 0, "Cancelled subscriptions should not have a next billing date");

    const activeSubscriptionsWithFailedCount = subscriptions.filter((s) => s.status === "active" && s.failedPaymentCount >= maxFailedPayments);
    assert(activeSubscriptionsWithFailedCount.length === 0, "Active subscriptions should not have max failed payments");

    const suspendedSubscriptionsWithNextBilling = subscriptions.filter((s) => s.status === "suspended" && s.nextBillingDate);
    assert(suspendedSubscriptionsWithNextBilling.length === 0, "Suspended subscriptions should not have a next billing date");

    const ticketsWithResolvedBy = tickets.filter((t) => t.status === "resolved" && !t.resolvedBy);
    assert(ticketsWithResolvedBy.length === 0, "Resolved tickets must have a resolver");

    const ticketsWithResolutionTime = tickets.filter((t) => t.status === "resolved" && !t.resolutionTime);
    assert(ticketsWithResolutionTime.length === 0, "Resolved tickets must have a resolution time");

    const ticketsWithSlaDeadline = tickets.filter((t) => t.status === "open" && !t.slaDeadline);
    assert(ticketsWithSlaDeadline.length === 0, "Open tickets must have an SLA deadline");

    const ticketsWithAssignedTo = tickets.filter((t) => t.status === "open" && !t.assignedTo);
    assert(ticketsWithAssignedTo.length === 0, "Open tickets must be assigned");

    const tasksWithCompletedAt = tasks.filter((t) => t.status === "done" && !t.completedAt);
    assert(tasksWithCompletedAt.length === 0, "Done tasks must have a completion date");

    const tasksWithDueDate = tasks.filter((t) => t.status === "todo" && !t.dueDate);
    assert(tasksWithDueDate.length === 0, "Todo tasks must have a due date");

    const tasksWithAssignedTo = tasks.filter((t) => t.status === "todo" && !t.assignedTo);
    assert(tasksWithAssignedTo.length === 0, "Todo tasks must be assigned");

    const tasksWithEstimatedHours = tasks.filter((t) => t.status === "todo" && t.estimatedHours <= 0);
    assert(tasksWithEstimatedHours.length === 0, "Todo tasks must have positive estimated hours");

    const projectsWithTasks = projects.filter((p) => p.tasks.length === 0);
    assert(projectsWithTasks.length === 0, "Projects must have at least one task");

    const projectsWithBudget = projects.filter((p) => p.budget <= 0);
    assert(projectsWithBudget.length === 0, "Projects must have positive budget");

    const projectsWithSpent = projects.filter((p) => p.spent > p.budget);
    assert(projectsWithSpent.length === 0, "Project spent cannot exceed budget");

    const opportunitiesWithCloseDate = opportunities.filter((o) => o.stage !== "closed_won" && o.stage !== "closed_lost" && !o.closeDate);
    assert(opportunitiesWithCloseDate.length === 0, "Active opportunities must have a close date");

    const opportunitiesWithProbability = opportunities.filter((o) => o.probability < 0 || o.probability > 100);
    assert(opportunitiesWithProbability.length === 0, "Opportunity probability must be between 0 and 100");

    const opportunitiesWithValue = opportunities.filter((o) => o.value <= 0);
    assert(opportunitiesWithValue.length === 0, "Opportunity value must be positive");

    const opportunitiesWithSource = opportunities.filter((o) => !["referral", "inbound", "outbound", "partner", "website"].includes(o.source));
    assert(opportunitiesWithSource.length === 0, "Opportunity source must be valid");

    const opportunitiesWithProducts = opportunities.filter((o) => o.products.length === 0);
    assert(opportunitiesWithProducts.length === 0, "Opportunities must have at least one product");

    const invoicesWithSubtotal = invoices.filter((i) => i.subtotal <= 0);
    assert(invoicesWithSubtotal.length === 0, "Invoice subtotal must be positive");

    const invoicesWithTax = invoices.filter((i) => i.tax < 0);
    assert(invoicesWithTax.length === 0, "Invoice tax cannot be negative");

    const invoicesWithTotal = invoices.filter((i) => i.total <= 0);
    assert(invoicesWithTotal.length === 0, "Invoice total must be positive");

    const invoicesWithDueDate = invoices.filter((i) => i.status === "unpaid" && !i.dueDate);
    assert(invoicesWithDueDate.length === 0, "Unpaid invoices must have a due date");

    const invoicesWithStartDate = invoices.filter((i) => !i.startDate);
    assert(invoicesWithStartDate.length === 0, "Invoices must have a start date");

    const invoicesWithEndDate = invoices.filter((i) => !i.endDate);
    assert(invoicesWithEndDate.length === 0, "Invoices must have an end date");

    const invoicesWithSubscription = invoices.filter((i) => !subscriptions.some((s) => s.id === i.subscriptionId));
    assert(invoicesWithSubscription.length === 0, "All invoices must reference valid subscriptions");

    const invoicesWithCustomer = invoices.filter((i) => !customers.some((c) => c.id === i.customerId));
    assert(invoicesWithCustomer.length === 0, "All invoices must reference valid customers");

    const paymentsWithInvoice = payments.filter((p) => !invoices.some((i) => i.id === p.invoiceId));
    assert(paymentsWithInvoice.length === 0, "All payments must reference valid invoices");

    const paymentsWithSubscription = payments.filter((p) => !subscriptions.some((s) => s.id === p.subscriptionId));
    assert(paymentsWithSubscription.length === 0, "All payments must reference valid subscriptions");

    const paymentsWithCustomer = payments.filter((p) => !customers.some((c) => c.id === p.customerId));
    assert(paymentsWithCustomer.length === 0, "All payments must reference valid customers");

    const paymentsWithMethod = payments.filter((p) => !["credit_card", "bank_transfer", "paypal", "stripe"].includes(p.method));
    assert(paymentsWithMethod.length === 0, "All payments must have valid methods");

    const paymentsWithStatus = payments.filter((p) => !["succeeded", "failed", "refunded"].includes(p.status));
    assert(paymentsWithStatus.length === 0, "All payments must have valid statuses");

    const ticketsWithCustomer = tickets.filter((t) => !customers.some((c) => c.id === t.customerId));
    assert(ticketsWithCustomer.length === 0, "All tickets must reference valid customers");

    const ticketsWithAssignedTo = tickets.filter((t) => !users.some((u) => u.id === t.assignedTo));
    assert(ticketsWithAssignedTo.length === 0, "All tickets must reference valid assignees");

    const ticketsWithTags = tickets.filter((t) => t.tags.length === 0);
    assert(ticketsWithTags.length === 0, "All tickets must have at least one tag");

    const ticketsWithDescription = tickets.filter((t) => !t.description);
    assert(ticketsWithDescription.length === 0, "All tickets must have a description");

    const ticketsWithSubject = tickets.filter((t) => !t.subject);
    assert(ticketsWithSubject.length === 0, "All tickets must have a subject");

    const ticketsWithPriority = tickets.filter((t) => !TICKET_PRIORITIES.includes(t.priority));
    assert(ticketsWithPriority.length === 0, "All tickets must have valid priorities");

    const ticketsWithStatus = tickets.filter((t) => !TICKET_STATUSES.includes(t.status));
    assert(ticketsWithStatus.length === 0, "All tickets must have valid statuses");

    const ticketsWithCreatedAt = tickets.filter((t) => !t.createdAt);
    assert(ticketsWithCreatedAt.length === 0, "All tickets must have a created date");

    const ticketsWithUpdatedAt = tickets.filter((t) => !t.updatedAt);
    assert(ticketsWithUpdatedAt.length === 0, "All tickets must have an updated date");

    const ticketsWithCustomerName = tickets.filter((t) => !t.customerName);
    assert(ticketsWithCustomerName.length === 0, "All tickets must have a customer name");

    const ticketsWithSLA = tickets.filter((t) => t.status === "open" && t.slaDeadline <= new Date());
    assert(ticketsWithSLA.length === 0, "Open tickets must not have expired SLA deadlines");

    const ticketsWithEscalation = tickets.filter((t) => t.escalated && t.escalationCount === 0);
    assert(ticketsWithEscalation.length === 0, "Escalated tickets must have positive escalation count");

    const ticketsWithComments = tickets.filter((t) => t.comments === undefined);
    assert(ticketsWithComments.length === 0, "All tickets must have a comments array");

    const ticketsWithResolvedAt = tickets.filter((t) => t.status === "resolved" && !t.resolvedAt);
    assert(ticketsWithResolvedAt.length === 0, "Resolved tickets must have a resolved date");

    const ticketsWithResolutionTime = tickets.filter((t) => t.status === "resolved" && t.resolutionTime < 0);
    assert(ticketsWithResolutionTime.length === 0, "Resolution time cannot be negative");

    const ticketsWithCreatedAt = tickets.filter((t) => t.status === "resolved" && t.resolutionTime < 0);
    assert(ticketsWithCreatedAt.length === 0, "Resolution time cannot be negative");

    const ticketsWithPriority = tickets.filter((t) => t.priority === "critical" && t.status === "open" && daysBetween(t.createdAt, t.slaDeadline) > 4);
    assert(ticketsWithPriority.length === 0, "Critical tickets must have SLA within 4 days");

    const ticketsWithHighPriority = tickets.filter((t) => t.priority === "high" && t.status === "open" && daysBetween(t.createdAt, t.slaDeadline) > 8);
    assert(ticketsWithHighPriority.length === 0, "High priority tickets must have SLA within 8 days");

    const ticketsWithMediumPriority = tickets.filter((t) => t.priority === "medium" && t.status === "open" && daysBetween(t.createdAt, t.slaDeadline) > 24);
    assert(ticketsWithMediumPriority.length === 0, "Medium priority tickets must have SLA within 24 hours");

    const ticketsWithLowPriority = tickets.filter((t) => t.priority === "low" && t.status === "open" && daysBetween(t.createdAt, t.slaDeadline) > 72);
    assert(ticketsWithLowPriority.length === 0, "Low priority tickets must have SLA within 72 hours");

    const ticketsWithOpenStatus = tickets.filter((t) => t.status === "open" && t.assignedTo === null);
    assert(ticketsWithOpenStatus.length === 0, "Open tickets must be assigned");

    const ticketsWithInProgressStatus = tickets.filter((t) => t.status === "in_progress" && t.assignedTo === null);
    assert(ticketsWithInProgressStatus.length === 0, "In-progress tickets must be assigned");

    const ticketsWithPendingStatus = tickets.filter((t) => t.status === "pending" && t.assignedTo === null);
    assert(ticketsWithPendingStatus.length === 0, "Pending tickets must be assigned");

    const ticketsWithClosedStatus = tickets.filter((t) => t.status === "closed" && !t.resolvedAt);
    assert(ticketsWithClosedStatus.length === 0, "Closed tickets must have a resolved date");

    const ticketsWithClosedStatus2 = tickets.filter((t) => t.status === "closed" && !t.resolvedBy);
    assert(ticketsWithClosedStatus2.length === 0, "Closed tickets must have a resolver");

    const ticketsWithClosedStatus3 = tickets.filter((t) => t.status === "closed" && !t.resolutionTime);
    assert(ticketsWithClosedStatus3.length === 0, "Closed tickets must have a resolution time");

    const ticketsWithClosedStatus4 = tickets.filter((t) => t.status === "closed" && t.resolutionTime < 0);
    assert(ticketsWithClosedStatus4.length === 0, "Closed ticket resolution time cannot be negative");

    const ticketsWithClosedStatus5 = tickets.filter((t) => t.status === "closed" && t.resolutionTime > 365);
    assert(ticketsWithClosedStatus5.length === 0, "Closed ticket resolution time cannot exceed 365 days");

    const ticketsWithClosedStatus6 = tickets.filter((t) => t.status === "closed" && t.createdAt > t.resolvedAt);
    assert(ticketsWithClosedStatus6.length === 0, "Closed ticket created date cannot be after resolved date");

    const ticketsWithClosedStatus7 = tickets.filter((t) => t.status === "closed" && t.updatedAt < t.resolvedAt);
    assert(ticketsWithClosedStatus7.length === 0, "Closed ticket updated date cannot be before resolved date");

    const ticketsWithClosedStatus8 = tickets.filter((t) => t.status === "closed" && t.updatedAt > new Date());
    assert(ticketsWithClosedStatus8.length === 0, "Closed ticket updated date cannot be in the future");

    const ticketsWithClosedStatus9 = tickets.filter((t) => t.status === "closed" && t.resolvedAt > new Date());
    assert(ticketsWithClosedStatus9.length === 0, "Closed ticket resolved date cannot be in the future");

    const ticketsWithClosedStatus10 = tickets.filter((t) => t.status === "closed" && t.createdAt > new Date());
    assert(ticketsWithClosedStatus10.length === 0, "Closed ticket created date cannot be in the future");

    const ticketsWithClosedStatus11 = tickets.filter((t) => t.status === "closed" && t.slaDeadline < t.createdAt);
    assert(ticketsWithClosedStatus11.length === 0, "Closed ticket SLA deadline cannot be before created date");

    const ticketsWithClosedStatus12 = tickets.filter((t) => t.status === "closed" && t.slaDeadline > t.resolvedAt);
    assert(ticketsWithClosedStatus12.length === 0, "Closed ticket SLA deadline cannot be after resolved date");

    const ticketsWithClosedStatus13 = tickets.filter((t) => t.status === "closed" && t.priority === "critical" && t.resolutionTime > 4);
    assert(ticketsWithClosedStatus13.length === 0, "Critical closed tickets must resolve within 4 days");

    const ticketsWithClosedStatus14 = tickets.filter((t) => t.status === "closed" && t.priority === "high" && t.resolutionTime > 8);
    assert(ticketsWithClosedStatus14.length === 0, "High priority closed tickets must resolve within 8 days");

    const ticketsWithClosedStatus15 = tickets.filter((t) => t.status === "closed" && t.priority === "medium" && t.resolutionTime > 24);
    assert(ticketsWithClosedStatus15.length === 0, "Medium priority closed tickets must resolve within 24 hours");

    const ticketsWithClosedStatus16 = tickets.filter((t) => t.status === "closed" && t.priority === "low" && t.resolutionTime > 72);
    assert(ticketsWithClosedStatus16.length === 0, "Low priority closed tickets must resolve within 72 hours");

    const ticketsWithClosedStatus17 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount < 1);
    assert(ticketsWithClosedStatus17.length === 0, "Closed escalated tickets must have positive escalation count");

    const ticketsWithClosedStatus18 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount > 5);
    assert(ticketsWithClosedStatus18.length === 0, "Closed tickets cannot have more than 5 escalations");

    const ticketsWithClosedStatus19 = tickets.filter((t) => t.status === "closed" && t.escalated && t.priority !== "critical");
    assert(ticketsWithClosedStatus19.length === 0, "Closed escalated tickets must be critical priority");

    const ticketsWithClosedStatus20 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 0);
    assert(ticketsWithClosedStatus20.length === 0, "Closed escalated tickets must have positive escalation count");

    const ticketsWithClosedStatus21 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 1 && t.priority !== "critical");
    assert(ticketsWithClosedStatus21.length === 0, "Single escalation must result in critical priority");

    const ticketsWithClosedStatus22 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 2 && t.priority !== "critical");
    assert(ticketsWithClosedStatus22.length === 0, "Double escalation must result in critical priority");

    const ticketsWithClosedStatus23 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 3 && t.priority !== "critical");
    assert(ticketsWithClosedStatus23.length === 0, "Triple escalation must result in critical priority");

    const ticketsWithClosedStatus24 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 4 && t.priority !== "critical");
    assert(ticketsWithClosedStatus24.length === 0, "Quadruple escalation must result in critical priority");

    const ticketsWithClosedStatus25 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 5 && t.priority !== "critical");
    assert(ticketsWithClosedStatus25.length === 0, "Quintuple escalation must result in critical priority");

    const ticketsWithClosedStatus26 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 6);
    assert(ticketsWithClosedStatus26.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus27 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 7);
    assert(ticketsWithClosedStatus27.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus28 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 8);
    assert(ticketsWithClosedStatus28.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus29 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 9);
    assert(ticketsWithClosedStatus29.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus30 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 10);
    assert(ticketsWithClosedStatus30.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus31 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 11);
    assert(ticketsWithClosedStatus31.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus32 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 12);
    assert(ticketsWithClosedStatus32.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus33 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 13);
    assert(ticketsWithClosedStatus33.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus34 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 14);
    assert(ticketsWithClosedStatus34.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus35 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 15);
    assert(ticketsWithClosedStatus35.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus36 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 16);
    assert(ticketsWithClosedStatus36.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus37 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 17);
    assert(ticketsWithClosedStatus37.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus38 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 18);
    assert(ticketsWithClosedStatus38.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus39 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 19);
    assert(ticketsWithClosedStatus39.length === 0, "Tickets cannot be escalated more than 5 times");

    const ticketsWithClosedStatus40 = tickets.filter((t) => t.status === "closed" && t.escalated && t.escalationCount === 20);
    assert(ticketsWithClosedStatus40.length === 0, "Tickets cannot be escalated more than 5 times");

    return { passed, failed, assertions };
  }

  function generateSummary() {
    const mrr = calculateMRR();
    const arr = calculateARR();
    const churnRate = calculateChurnRate();
    const active = calculateActiveCustomers();
    const churned = calculateChurnedCustomers();
    const total = customers.length;
    const totalInvoices = invoices.length;
    const outstanding = calculateOutstandingRevenue();
    const totalPayments = calculateTotalPayments();
    const failedPayments = calculateFailedPayments();
    const refunds = calculateRefunds();
    const openTickets = calculateOpenTickets();
    const avgResolution = calculateAverageResolutionTime();
    const pipeline = calculatePipelineValue();
    const closedWon = calculateClosedWonRevenue();
    const apiRequests = apiRequests.length;
    const apiErrors = apiRequests.filter((r) => r.status === "rate_limited").length;
    const avgRevenue = calculateAverageRevenuePerCustomer();

    console.log("=".repeat(60));
    console.log("ENTERPRISE SIMULATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Customers:        ${total}`);
    console.log(`Active Customers:       ${active}`);
    console.log(`Churned Customers:      ${churned}`);
    console.log(`Churn Rate:             ${(churnRate * 100).toFixed(2)}%`);
    console.log(`MRR:                    $${mrr.toFixed(2)}`);
    console.log(`ARR:                    $${arr.toFixed(2)}`);
    console.log(`Avg Revenue/Customer:   $${avgRevenue.toFixed(2)}`);
    console.log(`Total Invoices:         ${totalInvoices}`);
    console.log(`Outstanding Revenue:    $${outstanding.toFixed(2)}`);
    console.log(`Total Payments:         $${totalPayments.toFixed(2)}`);
    console.log(`Failed Payments:        ${failedPayments}`);
    console.log(`Refunds:                $${refunds.toFixed(2)}`);
    console.log(`Open Tickets:           ${openTickets}`);
    console.log(`Avg Resolution Time:    ${avgResolution.toFixed(1)} days`);
    console.log(`Pipeline Value:         $${pipeline.toFixed(2)}`);
    console.log(`Closed Won Revenue:     $${closedWon.toFixed(2)}`);
    console.log(`API Requests:           ${apiRequests}`);
    console.log(`API Errors:             ${apiErrors}`);
    console.log(`Users:                  ${users.length}`);
    console.log(`Accounts:               ${accounts.length}`);
    console.log(`Subscriptions:          ${subscriptions.length}`);
    console.log(`Tickets:                ${tickets.length}`);
    console.log(`Opportunities:          ${opportunities.length}`);
    console.log(`Projects:               ${projects.length}`);
    console.log(`Tasks:                  ${tasks.length}`);
    console.log(`Audit Logs:             ${auditLogs.length}`);
    console.log(`Notifications:          ${notifications.length}`);
    console.log(`Usage Records:          ${usageRecords.length}`);
    console.log(`Feature Flags:          ${featureFlags.size}`);
    console.log(`Plans:                  ${PLANS.length}`);
    console.log("=".repeat(60));
  }

  const analytics = await runSimulation();

  const assertions = runAssertions();

  const metrics = {
    totalCustomers: customers.length,
    activeCustomers: calculateActiveCustomers(),
    churnedCustomers: calculateChurnedCustomers(),
    MRR: calculateMRR(),
    ARR: calculateARR(),
    averageRevenuePerCustomer: calculateAverageRevenuePerCustomer(),
    churnRate: calculateChurnRate(),
    totalInvoices: invoices.length,
    outstandingRevenue: calculateOutstandingRevenue(),
    totalPayments: calculateTotalPayments(),
    failedPayments: calculateFailedPayments(),
    refunds: calculateRefunds(),
    openTickets: calculateOpenTickets(),
    averageResolutionTime: calculateAverageResolutionTime(),
    pipelineValue: calculatePipelineValue(),
    closedWonRevenue: calculateClosedWonRevenue(),
    APIRequests: apiRequests.length,
    APIErrors: apiRequests.filter((r) => r.status === "rate_limited").length
  };

  generateSummary();

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
    metrics,
    analytics,
    assertions
  };
}

module.exports = { runEnterpriseSimulation }

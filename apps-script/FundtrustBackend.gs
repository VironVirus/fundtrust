const CONFIG = {
  SPREADSHEET_ID: "",
  SHARED_SECRET: "replace-with-your-shared-secret",
  TIME_ZONE: "Africa/Lagos",
};

const SHEETS = {
  customers: {
    name: "Customers",
    headers: [
      "id",
      "name",
      "address",
      "sex",
      "age",
      "phone",
      "email",
      "branch",
      "contributionType",
      "savingsTarget",
      "savingsDuration",
      "weeklyPayment",
      "balanceToComplete",
      "totalAmount",
      "dateJoined",
    ],
  },
  agents: {
    name: "Agents",
    headers: [
      "id",
      "name",
      "phone",
      "address",
      "gender",
      "passwordHash",
      "dateRegistered",
      "status",
      "branch",
    ],
  },
  transactions: {
    name: "Transactions",
    headers: [
      "id",
      "date",
      "customerId",
      "customerName",
      "agentId",
      "agentName",
      "amount",
      "type",
    ],
  },
};

const BRANCH_CODE_BY_VALUE = {
  Onitsha: "01",
  Enugu: "02",
  Aba: "03",
  Nsukka: "04",
};

const BRANCH_VALUE_BY_KEY = {
  onitsha: "Onitsha",
  enugu: "Enugu",
  aba: "Aba",
  nsukka: "Nsukka",
};

const CONTRIBUTION_CODE_BY_VALUE = {
  "Daily contribution": "01",
  Loan: "02",
  "Property purchase": "03",
};

const CONTRIBUTION_VALUE_BY_KEY = {
  "daily contribution": "Daily contribution",
  loan: "Loan",
  "property purchase": "Property purchase",
};

function doGet() {
  return jsonResponse_({
    ok: true,
    data: {
      service: "Fundtrust Apps Script Backend",
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    authorize_(payload.token);

    let data;

    switch (payload.action) {
      case "getCustomers":
        data = getCustomers_();
        break;
      case "getCustomerById":
        data = getCustomerById_(payload.customerId);
        break;
      case "getCustomerByPhoneAndEmail":
        data = getCustomerByPhoneAndEmail_(
          payload.phone,
          payload.email,
          payload.branch,
          payload.contributionType,
        );
        break;
      case "createCustomer":
        data = createCustomer_(payload.customer);
        break;
      case "updateCustomer":
        data = updateCustomer_(payload.customer);
        break;
      case "getAgents":
        data = getAgents_();
        break;
      case "getAgentByPhone":
        data = getAgentByPhone_(payload.phone);
        break;
      case "createAgent":
        data = createAgent_(payload.agent);
        break;
      case "getTransactions":
        data = getTransactions_(payload.filters || {});
        break;
      case "recordDeposit":
        data = recordDeposit_(payload.deposit);
        break;
      default:
        throw new Error("Unsupported Apps Script action: " + payload.action);
    }

    return jsonResponse_({
      ok: true,
      data: data,
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error && error.message ? error.message : "Unexpected Apps Script error.",
    });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing POST body.");
  }

  return JSON.parse(e.postData.contents);
}

function authorize_(token) {
  if (CONFIG.SHARED_SECRET && token !== CONFIG.SHARED_SECRET) {
    throw new Error("Unauthorized request.");
  }
}

function getSpreadsheet_() {
  if (CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error(
      "No active spreadsheet found. Bind this Apps Script project to the sheet or set CONFIG.SPREADSHEET_ID.",
    );
  }

  return spreadsheet;
}

function ensureSheet_(definition) {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(definition.name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(definition.name);
  }

  const headerRange = sheet.getRange(1, 1, 1, definition.headers.length);
  const existingHeaders = headerRange
    .getValues()[0]
    .map(function (value) {
      return String(value || "").trim();
    });

  const headersMatch = definition.headers.every(function (header, index) {
    return existingHeaders[index] === header;
  });

  if (!headersMatch) {
    headerRange.setValues([definition.headers]);
  }

  return sheet;
}

function getRecords_(definition) {
  const sheet = ensureSheet_(definition);
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return [];
  }

  const headers = definition.headers;

  return values.slice(1).map(function (row, index) {
    const record = {
      _rowNumber: index + 2,
    };

    headers.forEach(function (header, columnIndex) {
      record[header] = row[columnIndex];
    });

    return record;
  });
}

function appendRecord_(definition, record) {
  const sheet = ensureSheet_(definition);
  const row = definition.headers.map(function (header) {
    return record[header] !== undefined ? record[header] : "";
  });

  sheet.appendRow(row);
}

function updateRecordById_(definition, id, record) {
  const sheet = ensureSheet_(definition);
  const records = getRecords_(definition);
  const existing = records.find(function (item) {
    return String(item.id || "").trim() === String(id || "").trim();
  });

  if (!existing) {
    throw new Error(definition.name + " record not found.");
  }

  const row = definition.headers.map(function (header) {
    return record[header] !== undefined ? record[header] : "";
  });

  sheet.getRange(existing._rowNumber, 1, 1, definition.headers.length).setValues([row]);
  return record;
}

function getRecordAtRow_(sheet, definition, rowNumber) {
  if (!rowNumber || rowNumber < 2) {
    return null;
  }

  const values = sheet.getRange(rowNumber, 1, 1, definition.headers.length).getValues()[0];
  const record = {
    _rowNumber: rowNumber,
  };

  definition.headers.forEach(function (header, columnIndex) {
    record[header] = values[columnIndex];
  });

  return record;
}

function getRecordById_(definition, id) {
  const sheet = ensureSheet_(definition);
  const normalizedId = normalizeText_(id);

  if (!normalizedId) {
    return null;
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return null;
  }

  const foundCell = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .createTextFinder(normalizedId)
    .matchEntireCell(true)
    .findNext();

  if (!foundCell) {
    return null;
  }

  return getRecordAtRow_(sheet, definition, foundCell.getRow());
}

function normalizeText_(value) {
  return String(value || "").trim();
}

function normalizePhone_(value) {
  return normalizeText_(value).replace(/\s+/g, "");
}

function normalizeNumber_(value) {
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeBranch_(value) {
  const key = normalizeText_(value).toLowerCase();
  return BRANCH_VALUE_BY_KEY[key] || "";
}

function normalizeContributionType_(value) {
  const key = normalizeText_(value).toLowerCase();
  return CONTRIBUTION_VALUE_BY_KEY[key] || "";
}

function getBranchCode_(branch) {
  const normalizedBranch = normalizeBranch_(branch);
  return BRANCH_CODE_BY_VALUE[normalizedBranch] || "";
}

function getContributionCode_(contributionType) {
  const normalizedContributionType = normalizeContributionType_(contributionType);
  return CONTRIBUTION_CODE_BY_VALUE[normalizedContributionType] || "";
}

function getCalendarDate_(value) {
  const date = value ? new Date(value) : new Date();

  if (isNaN(date.getTime())) {
    return "";
  }

  return Utilities.formatDate(date, CONFIG.TIME_ZONE, "yyyy-MM-dd");
}

function matchesSearch_(haystack, needle) {
  return normalizeText_(haystack).toLowerCase().indexOf(normalizeText_(needle).toLowerCase()) !== -1;
}

function buildCustomerRecord_(customer, existingRecord) {
  const savingsTarget = normalizeNumber_(customer.savingsTarget);
  const savingsDuration = normalizeNumber_(customer.savingsDuration);
  const totalAmount = normalizeNumber_(
    customer.totalAmount !== undefined ? customer.totalAmount : existingRecord && existingRecord.totalAmount,
  );
  const balanceToComplete = normalizeNumber_(
    customer.balanceToComplete !== undefined
      ? customer.balanceToComplete
      : existingRecord && existingRecord.balanceToComplete,
  );
  const branch = normalizeBranch_(
    customer.branch !== undefined ? customer.branch : existingRecord && existingRecord.branch,
  );
  const contributionType = normalizeContributionType_(
    customer.contributionType !== undefined
      ? customer.contributionType
      : existingRecord && existingRecord.contributionType,
  );

  return {
    id: normalizeText_(customer.id || (existingRecord && existingRecord.id)),
    name: normalizeText_(customer.name),
    address: normalizeText_(customer.address),
    sex: normalizeText_(customer.sex) || "Other",
    age: normalizeNumber_(customer.age),
    phone: normalizeText_(customer.phone),
    email: normalizeText_(customer.email),
    branch: branch,
    contributionType: contributionType,
    savingsTarget: savingsTarget,
    savingsDuration: savingsDuration,
    weeklyPayment:
      savingsTarget > 0 && savingsDuration > 0
        ? savingsTarget / savingsDuration
        : 0,
    balanceToComplete: balanceToComplete,
    totalAmount: totalAmount,
    dateJoined: normalizeText_(customer.dateJoined) || new Date().toISOString(),
  };
}

function getNextBranchSerial_(records, branchCode) {
  let highestSerial = 0;

  records.forEach(function (record) {
    const customerId = normalizeText_(record.id);

    if (!/^\d{8}$/.test(customerId)) {
      return;
    }

    if (customerId.slice(0, 2) !== branchCode) {
      return;
    }

    const serial = Number(customerId.slice(4));

    if (Number.isFinite(serial) && serial > highestSerial) {
      highestSerial = serial;
    }
  });

  return highestSerial + 1;
}

function generateCustomerId_(records, branch, contributionType) {
  const branchCode = getBranchCode_(branch);
  const contributionCode = getContributionCode_(contributionType);

  if (!branchCode) {
    throw new Error("A valid customer branch is required.");
  }

  if (!contributionCode) {
    throw new Error("A valid customer plan type is required.");
  }

  const serial = getNextBranchSerial_(records || [], branchCode);

  if (serial > 9999) {
    throw new Error("This branch has reached the maximum customer serial number.");
  }

  return branchCode + contributionCode + String(serial).padStart(4, "0");
}

function getCustomers_() {
  return getRecords_(SHEETS.customers).map(stripInternalFields_);
}

function getCustomerById_(customerId) {
  const customer = getRecordById_(SHEETS.customers, customerId);

  return customer ? stripInternalFields_(customer) : null;
}

function getCustomerByPhoneAndEmail_(phone, email, branch, contributionType) {
  const normalizedPhone = normalizePhone_(phone);
  const normalizedEmail = normalizeText_(email).toLowerCase();
  const normalizedBranch = normalizeBranch_(branch);
  const normalizedContributionType = normalizeContributionType_(contributionType);
  const customer = getRecords_(SHEETS.customers).find(function (record) {
    const matchesBranch =
      !normalizedBranch || normalizeBranch_(record.branch) === normalizedBranch;
    const matchesContributionType =
      !normalizedContributionType ||
      normalizeContributionType_(record.contributionType) === normalizedContributionType;

    return (
      normalizePhone_(record.phone) === normalizedPhone &&
      normalizeText_(record.email).toLowerCase() === normalizedEmail &&
      matchesBranch &&
      matchesContributionType
    );
  });

  return customer ? stripInternalFields_(customer) : null;
}

function createCustomer_(customer) {
  if (!customer) {
    throw new Error("Customer payload is required.");
  }

  const normalizedPhone = normalizePhone_(customer.phone);
  const normalizedEmail = normalizeText_(customer.email).toLowerCase();
  const existingRecords = getRecords_(SHEETS.customers);
  const existingCustomer = existingRecords.find(function (record) {
    return (
      normalizePhone_(record.phone) === normalizedPhone ||
      normalizeText_(record.email).toLowerCase() === normalizedEmail
    );
  });

  if (existingCustomer) {
    throw new Error("A customer with that phone number or email already exists.");
  }

  const record = buildCustomerRecord_(customer, null);

  if (!record.branch) {
    throw new Error("A valid branch is required.");
  }

  if (!record.contributionType) {
    throw new Error("A valid plan type is required.");
  }

  record.id = generateCustomerId_(
    existingRecords,
    record.branch,
    record.contributionType,
  );
  record.balanceToComplete = 0;
  record.totalAmount = 0;

  appendRecord_(SHEETS.customers, record);
  return record;
}

function updateCustomer_(customer) {
  if (!customer || !customer.id) {
    throw new Error("Customer payload must include an id.");
  }

  const existing = getRecordById_(SHEETS.customers, customer.id);

  if (!existing) {
    throw new Error("Customers record not found.");
  }

  const updated = buildCustomerRecord_(customer, existing);

  return stripInternalFields_(updateRecordById_(SHEETS.customers, updated.id, updated));
}

function getAgents_() {
  return getRecords_(SHEETS.agents).map(stripInternalFields_);
}

function getAgentByPhone_(phone) {
  const normalizedPhone = normalizePhone_(phone);
  const agent = getRecords_(SHEETS.agents).find(function (record) {
    return normalizePhone_(record.phone) === normalizedPhone;
  });

  return agent ? stripInternalFields_(agent) : null;
}

function createAgent_(agent) {
  if (!agent) {
    throw new Error("Agent payload is required.");
  }

  const record = {
    id: Utilities.getUuid(),
    name: normalizeText_(agent.name),
    phone: normalizeText_(agent.phone),
    address: normalizeText_(agent.address),
    branch: normalizeBranch_(agent.branch),
    gender: normalizeText_(agent.gender) || "Other",
    passwordHash: normalizeText_(agent.passwordHash),
    dateRegistered: new Date().toISOString(),
    status: normalizeText_(agent.status) || "Active",
  };

  if (!record.branch) {
    throw new Error("A valid marketer branch is required.");
  }

  appendRecord_(SHEETS.agents, record);
  return record;
}

function getTransactions_(filters) {
  filters = filters || {};

  return getRecords_(SHEETS.transactions)
    .map(stripInternalFields_)
    .filter(function (record) {
      if (filters.agentId && record.agentId !== filters.agentId) {
        return false;
      }

      if (filters.customerId && record.customerId !== filters.customerId) {
        return false;
      }

      const calendarDate = getCalendarDate_(record.date);

      if (filters.startDate && calendarDate < filters.startDate) {
        return false;
      }

      if (filters.endDate && calendarDate > filters.endDate) {
        return false;
      }

      if (
        filters.query &&
        !matchesSearch_(record.customerName, filters.query) &&
        !matchesSearch_(record.customerId, filters.query) &&
        !matchesSearch_(record.agentName, filters.query) &&
        !matchesSearch_(record.type, filters.query) &&
        !matchesSearch_(getPaymentMethodLabel_(record.type), filters.query)
      ) {
        return false;
      }

      return true;
    })
    .sort(function (left, right) {
      return new Date(right.date).getTime() - new Date(left.date).getTime();
    });
}

function recordDeposit_(deposit) {
  if (!deposit) {
    throw new Error("Deposit payload is required.");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const customerSheet = ensureSheet_(SHEETS.customers);
    const customer = getRecordById_(SHEETS.customers, deposit.customerId);

    if (!customer) {
      throw new Error("Customer record not found.");
    }

    const amount = normalizeNumber_(deposit.amount);
    const paymentMethod = normalizePaymentMethod_(
      deposit.paymentMethod || deposit.type,
    );

    if (amount <= 0) {
      throw new Error("Deposit amount must be greater than zero.");
    }

    const currentBalance = normalizeNumber_(customer.balanceToComplete);
    const currentTotal = normalizeNumber_(customer.totalAmount);

    const updatedCustomer = buildCustomerRecord_(
      {
        id: normalizeText_(customer.id),
        name: normalizeText_(customer.name),
        address: normalizeText_(customer.address),
        sex: normalizeText_(customer.sex) || "Other",
        age: normalizeNumber_(customer.age),
        phone: normalizeText_(customer.phone),
        email: normalizeText_(customer.email),
        branch: normalizeBranch_(customer.branch),
        contributionType: normalizeContributionType_(customer.contributionType),
        savingsTarget: normalizeNumber_(customer.savingsTarget),
        savingsDuration: normalizeNumber_(customer.savingsDuration),
        totalAmount: currentTotal + amount,
        balanceToComplete: Math.max(0, currentBalance - amount),
        dateJoined: normalizeText_(customer.dateJoined) || new Date().toISOString(),
      },
      customer,
    );

    customerSheet
      .getRange(customer._rowNumber, 1, 1, SHEETS.customers.headers.length)
      .setValues([
        SHEETS.customers.headers.map(function (header) {
          return updatedCustomer[header];
        }),
      ]);

    appendRecord_(SHEETS.transactions, {
      id: Utilities.getUuid(),
      date: new Date().toISOString(),
      customerId: updatedCustomer.id,
      customerName: updatedCustomer.name,
      agentId: normalizeText_(deposit.agentId),
      agentName: normalizeText_(deposit.agentName),
      amount: amount,
      type: paymentMethod,
    });

    return updatedCustomer;
  } finally {
    lock.releaseLock();
  }
}

function normalizePaymentMethod_(value) {
  const normalized = normalizeText_(value).toLowerCase();

  if (
    normalized === "transfer" ||
    normalized === "bank transfer" ||
    normalized === "bank-transfer"
  ) {
    return "transfer";
  }

  return "cash";
}

function getPaymentMethodLabel_(value) {
  return normalizePaymentMethod_(value) === "transfer"
    ? "Bank transfer"
    : "Cash";
}

function stripInternalFields_(record) {
  const clone = {};

  Object.keys(record).forEach(function (key) {
    if (key !== "_rowNumber") {
      clone[key] = record[key];
    }
  });

  return clone;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

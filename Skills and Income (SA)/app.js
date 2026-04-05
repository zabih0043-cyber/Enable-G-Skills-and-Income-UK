(() => {
  "use strict";

  const WEEKS_PER_MONTH = 52 / 12;
  const DEFAULT_TARGET = 20000;
  const DEFAULT_MIN_RATE = 150;
  const STORAGE_KEY = "enable-g-skills-income-v2";
  const SAVE_DEBOUNCE_MS = 240;
  const IDEA_REFRESH_DEBOUNCE_MS = 160;
  const IDEA_REFRESH_IDS = new Set(["currentJob", "skillsList", "experienceList"]);
  const PDF_SCRIPT_URLS = [
    "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
    "https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js",
  ];

  const IDEA_LIBRARY = [
    {
      id: "admin",
      keywords: ["admin", "office", "data", "typing", "organizing", "assistant"],
      title: "Virtual admin support",
      description: "Inbox help, booking support, quotes, and simple document work.",
      rate: 180,
      hours: 4,
    },
    {
      id: "writing",
      keywords: ["writing", "writer", "content", "copy", "cv", "resume"],
      title: "CV and writing support",
      description: "Help people with CVs, cover letters, bios, or short business copy.",
      rate: 220,
      hours: 3,
    },
    {
      id: "social",
      keywords: ["social", "marketing", "facebook", "instagram", "content"],
      title: "Social media content help",
      description: "Create captions, basic calendars, and posting support for small brands.",
      rate: 240,
      hours: 4,
    },
    {
      id: "driving",
      keywords: ["driving", "driver", "delivery", "transport", "errand"],
      title: "Errands and delivery runs",
      description: "Offer local errands, collections, or delivery support on flexible hours.",
      rate: 170,
      hours: 5,
    },
    {
      id: "beauty",
      keywords: ["manicure", "beauty", "hair", "nails", "makeup"],
      title: "Mobile beauty service",
      description: "Use beauty skills for home visits, event prep, or quick weekend sessions.",
      rate: 260,
      hours: 4,
    },
    {
      id: "care",
      keywords: ["child", "care", "babysit", "elder", "support"],
      title: "Care support sessions",
      description: "Offer after-school care, babysitting, or practical support visits.",
      rate: 180,
      hours: 6,
    },
    {
      id: "pets",
      keywords: ["pet", "dog", "animal", "cat", "walking"],
      title: "Pet sitting and dog walking",
      description: "Turn reliability and routine into short paid visits during the week.",
      rate: 180,
      hours: 4,
    },
    {
      id: "cleaning",
      keywords: ["cleaning", "organizing", "house", "home", "laundry"],
      title: "Home reset and organizing",
      description: "Offer decluttering, cupboard resets, or move-in support sessions.",
      rate: 190,
      hours: 5,
    },
    {
      id: "tech",
      keywords: ["tech", "computer", "phone", "device", "support", "it"],
      title: "Basic tech support",
      description: "Help with phone setup, app installs, printer issues, and troubleshooting.",
      rate: 250,
      hours: 3,
    },
    {
      id: "teaching",
      keywords: ["teach", "tutor", "school", "education", "homework"],
      title: "Tutoring and homework help",
      description: "Support school learners with revision, reading, and homework structure.",
      rate: 240,
      hours: 4,
    },
    {
      id: "food",
      keywords: ["cook", "baking", "food", "meal", "kitchen"],
      title: "Meal prep or baking orders",
      description: "Package what you make best into pre-orders for families or offices.",
      rate: 180,
      hours: 4,
    },
    {
      id: "sales",
      keywords: ["sales", "retail", "customer", "promotion", "shop"],
      title: "Weekend sales support",
      description: "Help small businesses with pop-ups, markets, or promotion shifts.",
      rate: 170,
      hours: 5,
    },
  ];

  const DEFAULT_IDEAS = [
    IDEA_LIBRARY[0],
    IDEA_LIBRARY[3],
    IDEA_LIBRARY[8],
    IDEA_LIBRARY[10],
  ];

  const $ = (selector) => document.querySelector(selector);

  const elements = {
    needRent: $("#needRent"),
    needFood: $("#needFood"),
    needBills: $("#needBills"),
    needDebt: $("#needDebt"),
    needDependencies: $("#needDependencies"),
    needsTotal: $("#needsTotal"),
    salaryAfterTax: $("#salaryAfterTax"),
    hoursPerWeek: $("#hoursPerWeek"),
    currentHourlyRate: $("#currentHourlyRate"),
    currentMonthlyIncome: $("#currentMonthlyIncome"),
    targetMonthlyIncome: $("#targetMonthlyIncome"),
    minHourlyRate: $("#minHourlyRate"),
    targetMonthly: $("#targetMonthly"),
    extraIncomeNeeded: $("#extraIncomeNeeded"),
    extraHoursPerWeek: $("#extraHoursPerWeek"),
    servicesTbody: $("#servicesTbody"),
    servicesTotal: $("#servicesTotal"),
    btnAddServiceRow: $("#btnAddServiceRow"),
    btnReset: $("#btnReset"),
    btnPrint: $("#btnPrint"),
    year: $("#year"),
    saveStatus: $("#saveStatus"),
    currentJob: $("#currentJob"),
    name: $("#name"),
    date: $("#date"),
    reference: $("#reference"),
    skillsList: $("#skillsList"),
    experienceList: $("#experienceList"),
    targetHint: $("#targetHint"),
    minRateHint: $("#minRateHint"),
    incomeSyncHint: $("#incomeSyncHint"),
    heroExtraIncome: $("#heroExtraIncome"),
    heroExtraHours: $("#heroExtraHours"),
    heroServices: $("#heroServices"),
    sumNeeds: $("#sumNeeds"),
    sumHourly: $("#sumHourly"),
    sumTarget: $("#sumTarget"),
    sumExtraIncome: $("#sumExtraIncome"),
    sumExtraHours: $("#sumExtraHours"),
    sumServices: $("#sumServices"),
    sumRemainingGap: $("#sumRemainingGap"),
    sumIncomeWithServices: $("#sumIncomeWithServices"),
    summaryCurrentIncome: $("#summaryCurrentIncome"),
    summaryServicePlan: $("#summaryServicePlan"),
    summaryGoalPercent: $("#summaryGoalPercent"),
    summaryGoalFill: $("#summaryGoalFill"),
    summaryPlanMessage: $("#summaryPlanMessage"),
    planStatusBadge: $("#planStatusBadge"),
    planStatusText: $("#planStatusText"),
    goalMeterFill: $("#goalMeterFill"),
    goalProgressValue: $("#goalProgressValue"),
    gapRemainingValue: $("#gapRemainingValue"),
    totalIncomeValue: $("#totalIncomeValue"),
    needsCoverage: $("#needsCoverage"),
    needsCoverageText: $("#needsCoverageText"),
    recommendedRate: $("#recommendedRate"),
    rateGuidanceText: $("#rateGuidanceText"),
    remainingGapInline: $("#remainingGapInline"),
    remainingGapText: $("#remainingGapText"),
    servicesHoursPlanned: $("#servicesHoursPlanned"),
    servicesCoverage: $("#servicesCoverage"),
    remainingGap: $("#remainingGap"),
    serviceIdeas: $("#serviceIdeas"),
    serviceIdeasEmpty: $("#serviceIdeasEmpty"),
    nextStepsList: $("#nextStepsList"),
  };

  const staticFieldIds = [
    "name",
    "date",
    "reference",
    "currentMonthlyIncome",
    "targetMonthlyIncome",
    "needRent",
    "needFood",
    "needBills",
    "needDebt",
    "needDependencies",
    "currentJob",
    "salaryAfterTax",
    "hoursPerWeek",
    "minHourlyRate",
    "targetMonthly",
    "skillsList",
    "experienceList",
  ];

  const mirroredFields = {
    currentMonthlyIncome: "salaryAfterTax",
    salaryAfterTax: "currentMonthlyIncome",
    targetMonthlyIncome: "targetMonthly",
    targetMonthly: "targetMonthlyIncome",
  };

  let nextServiceIndex = 1;
  let saveTimer = 0;
  let ideasRefreshTimer = 0;
  let lastIdeasSignature = "";
  let pdfLibraryPromise = null;

  function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function readNumber(element) {
    if (!element) return 0;
    return toNumber(element.value);
  }

  function formatCurrency(amount) {
    const value = Number.isFinite(amount) ? amount : 0;
    const rounded = Math.round(value);
    const formatted = rounded
      .toLocaleString("en-ZA", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\s/g, " ");
    return `R${formatted}`;
  }

  function formatHours(hours) {
    const value = Number.isFinite(hours) ? hours : 0;
    const rounded = value > 0 ? Math.ceil(value) : 0;
    return rounded
      .toLocaleString("en-ZA", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\s/g, " ");
  }

  function formatPercent(value) {
    const safeValue = Number.isFinite(value) ? value : 0;
    const formatted = safeValue
      .toLocaleString("en-ZA", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\s/g, " ");
    return `${formatted}%`;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function roundUpToNearestTen(value) {
    if (value <= 0) return DEFAULT_MIN_RATE;
    return Math.ceil(value / 10) * 10;
  }

  function setText(node, value) {
    if (node) node.textContent = value;
  }

  function setMeter(node, percent) {
    if (node) node.style.width = `${clamp(percent, 0, 100)}%`;
  }

  function todayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getIncomeValue() {
    return readNumber(elements.salaryAfterTax) || readNumber(elements.currentMonthlyIncome);
  }

  function getTargetValue() {
    return readNumber(elements.targetMonthly) || readNumber(elements.targetMonthlyIncome) || DEFAULT_TARGET;
  }

  function getMinimumRateInput() {
    return readNumber(elements.minHourlyRate);
  }

  function getEffectiveMinimumRate() {
    return getMinimumRateInput() || DEFAULT_MIN_RATE;
  }

  function getServiceRows() {
    return elements.servicesTbody
      ? Array.from(elements.servicesTbody.querySelectorAll("tr.service-row"))
      : [];
  }

  function getServiceRowData(row) {
    if (!row) return { description: "", hours: 0, rate: 0, monthly: 0 };

    const description = row.querySelector('input[id^="svcDesc"]')?.value?.trim() || "";
    const hours = toNumber(row.querySelector('input[id^="svcHours"]')?.value || 0);
    const rate = toNumber(row.querySelector('input[id^="svcRate"]')?.value || 0);
    const monthly = Math.max(0, hours) * Math.max(0, rate) * WEEKS_PER_MONTH;

    return { description, hours, rate, monthly };
  }

  function createServiceRow(index, values = {}) {
    const row = document.createElement("tr");
    row.className = "service-row";
    row.dataset.index = String(index);

    row.innerHTML = `
      <td>
        <label class="sr-only" for="svcDesc${index}">Service description</label>
        <input id="svcDesc${index}" type="text" placeholder="e.g. Weekend car wash service" />
      </td>
      <td class="right">
        <label class="sr-only" for="svcHours${index}">Hours per week</label>
        <input id="svcHours${index}" type="number" inputmode="numeric" min="0" max="100" step="1" placeholder="0" />
      </td>
      <td class="right">
        <label class="sr-only" for="svcRate${index}">Hourly rate</label>
        <input id="svcRate${index}" type="number" inputmode="decimal" min="0" step="1" placeholder="0" />
      </td>
      <td class="right">
        <output id="svcMonthly${index}" aria-live="polite">R0</output>
      </td>
      <td class="right">
        <button class="btn btn-ghost btn-remove" type="button" data-action="remove-service">
          Remove
        </button>
      </td>
    `;

    row.querySelector(`#svcDesc${index}`).value = values.description || "";
    row.querySelector(`#svcHours${index}`).value =
      values.hours || values.hours === 0 ? String(values.hours) : "";
    row.querySelector(`#svcRate${index}`).value =
      values.rate || values.rate === 0 ? String(values.rate) : "";

    return row;
  }

  function getHighestServiceIndex() {
    return getServiceRows().reduce((highest, row) => {
      const current = toNumber(row.dataset.index);
      return Math.max(highest, current);
    }, 0);
  }

  function appendServiceRow(values) {
    if (!elements.servicesTbody) return null;

    const row = createServiceRow(nextServiceIndex, values);
    nextServiceIndex += 1;
    elements.servicesTbody.appendChild(row);
    updateRemoveButtons();
    return row;
  }

  function resetToSingleServiceRow() {
    if (!elements.servicesTbody) return;

    elements.servicesTbody.innerHTML = "";
    elements.servicesTbody.appendChild(createServiceRow(0));

    nextServiceIndex = Math.max(1, getHighestServiceIndex() + 1);
    updateRemoveButtons();
  }

  function updateRemoveButtons() {
    const rows = getServiceRows();

    rows.forEach((row) => {
      const button = row.querySelector('[data-action="remove-service"]');
      if (!button) return;

      if (rows.length <= 1) {
        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
        button.title = "Add another service before removing this row";
      } else {
        button.disabled = false;
        button.setAttribute("aria-disabled", "false");
        button.title = "Remove this service";
      }
    });
  }

  function syncMirroredField(source) {
    const targetId = mirroredFields[source.id];
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (target) target.value = source.value;
  }

  function getNeedsTotal() {
    return (
      readNumber(elements.needRent) +
      readNumber(elements.needFood) +
      readNumber(elements.needBills) +
      readNumber(elements.needDebt) +
      readNumber(elements.needDependencies)
    );
  }

  function getCurrentHourlyRate(income) {
    const hours = readNumber(elements.hoursPerWeek);
    if (income <= 0 || hours <= 0) return 0;
    return income / (hours * WEEKS_PER_MONTH);
  }

  function getServicesTotals() {
    return getServiceRows().reduce(
      (totals, row) => {
        const data = getServiceRowData(row);
        setText(row.querySelector('output[id^="svcMonthly"]'), formatCurrency(data.monthly));
        totals.monthly += data.monthly;
        totals.hours += Math.max(0, data.hours);
        return totals;
      },
      { monthly: 0, hours: 0 }
    );
  }

  function buildPlanSnapshot() {
    const currentIncome = getIncomeValue();
    const targetIncome = getTargetValue();
    const needsTotal = getNeedsTotal();
    const currentHourlyRate = getCurrentHourlyRate(currentIncome);
    const minimumRateInput = getMinimumRateInput();
    const effectiveMinimumRate = getEffectiveMinimumRate();
    const services = getServicesTotals();
    const extraIncomeNeeded = Math.max(0, targetIncome - currentIncome);
    const extraHoursNeeded =
      extraIncomeNeeded > 0 ? extraIncomeNeeded / (effectiveMinimumRate * WEEKS_PER_MONTH) : 0;
    const totalIncomeWithServices = currentIncome + services.monthly;
    const remainingGap = Math.max(0, targetIncome - totalIncomeWithServices);
    const remainingServiceGap = Math.max(0, extraIncomeNeeded - services.monthly);
    const remainingServiceHours =
      remainingServiceGap > 0
        ? remainingServiceGap / (effectiveMinimumRate * WEEKS_PER_MONTH)
        : 0;
    const needsCoverage = currentIncome - needsTotal;
    const goalProgress =
      targetIncome > 0 ? clamp((totalIncomeWithServices / targetIncome) * 100, 0, 100) : 0;
    const serviceCoverage =
      extraIncomeNeeded > 0 ? clamp((services.monthly / extraIncomeNeeded) * 100, 0, 100) : 0;
    const recommendedRate = Math.max(
      DEFAULT_MIN_RATE,
      roundUpToNearestTen(currentHourlyRate || DEFAULT_MIN_RATE)
    );

    return {
      currentIncome,
      targetIncome,
      needsTotal,
      currentHourlyRate,
      minimumRateInput,
      effectiveMinimumRate,
      servicesMonthly: services.monthly,
      servicesHours: services.hours,
      extraIncomeNeeded,
      extraHoursNeeded,
      totalIncomeWithServices,
      remainingGap,
      remainingServiceGap,
      remainingServiceHours,
      needsCoverage,
      goalProgress,
      serviceCoverage,
      recommendedRate,
    };
  }

  function updateStatus(plan) {
    let badgeText = "Setup needed";
    let badgeClass = "tone-neutral";
    let statusText = "Add your income, target, and rate to unlock a full plan view.";
    let summaryMessage =
      "Start with your income, needs, and weekly hours to build a realistic plan.";

    if (!plan.currentIncome) {
      badgeText = "Income needed";
      badgeClass = "tone-warning";
      statusText = "Add your current income to see the gap between where you are and your goal.";
    } else if (plan.needsCoverage < 0) {
      badgeText = "Needs not covered";
      badgeClass = "tone-danger";
      statusText = `Your current income is ${formatCurrency(
        Math.abs(plan.needsCoverage)
      )} below your monthly needs.`;
      summaryMessage =
        "Covering essentials comes first. Focus on closing the needs gap before stretching the target.";
    } else if (plan.remainingGap > 0 && plan.servicesMonthly > 0) {
      badgeText = "Plan in progress";
      badgeClass = "tone-warning";
      statusText = `Your service plan has closed ${formatPercent(
        plan.serviceCoverage
      )} of the extra-income gap.`;
      summaryMessage = `You still need ${formatCurrency(
        plan.remainingGap
      )} more each month to hit the target.`;
    } else if (plan.remainingGap > 0) {
      badgeText = "Gap open";
      badgeClass = "tone-warning";
      statusText = `You need ${formatCurrency(
        plan.extraIncomeNeeded
      )} extra each month, or about ${formatHours(plan.extraHoursNeeded)} extra hours per week.`;
      summaryMessage =
        "Add one or two services below to see how your target becomes more realistic.";
    } else {
      badgeText = "Target covered";
      badgeClass = "tone-success";
      statusText =
        "Your current income plus planned services cover the target. Focus on consistency and scheduling.";
      summaryMessage =
        "Your plan currently meets the target. Keep checking that hours and rates stay realistic.";
    }

    if (plan.minimumRateInput > 0 && plan.minimumRateInput < DEFAULT_MIN_RATE) {
      statusText += " Raise your minimum rate to at least R150/hr for a healthier plan.";
    }

    if (elements.planStatusBadge) {
      elements.planStatusBadge.className = `status-badge ${badgeClass}`;
      elements.planStatusBadge.textContent = badgeText;
    }

    setText(elements.planStatusText, statusText);
    setText(elements.summaryPlanMessage, summaryMessage);
  }

  function updateHints(plan) {
    elements.minHourlyRate?.classList.toggle(
      "input-warning",
      plan.minimumRateInput > 0 && plan.minimumRateInput < DEFAULT_MIN_RATE
    );
    elements.targetMonthly?.classList.toggle(
      "input-warning",
      readNumber(elements.targetMonthly) > 0 && readNumber(elements.targetMonthly) < DEFAULT_TARGET
    );

    setText(
      elements.minRateHint,
      plan.minimumRateInput > 0 && plan.minimumRateInput < DEFAULT_MIN_RATE
        ? "Rates below R150/hr usually stretch the hours too far. Try raising this to at least R150/hr."
        : `Suggested floor: R${plan.recommendedRate}/hr based on your current earning power.`
    );

    setText(
      elements.targetHint,
      getTargetValue() < DEFAULT_TARGET
        ? "This target is below the Enable G recommendation of R20,000 per month."
        : "Enable G recommends aiming for at least R20,000 per month."
    );

    setText(
      elements.incomeSyncHint,
      "This stays in sync with the current income field above."
    );
  }

  function buildNextSteps(plan) {
    const steps = [];

    if (!plan.currentIncome) {
      steps.push("Add your current monthly income so the app can calculate the real gap.");
    }

    if (!readNumber(elements.hoursPerWeek)) {
      steps.push("Enter weekly working hours to calculate your current hourly rate.");
    }

    if (plan.needsCoverage < 0 && plan.currentIncome > 0) {
      steps.push(
        `Close the ${formatCurrency(Math.abs(plan.needsCoverage))} gap between current income and monthly needs.`
      );
    }

    if (plan.minimumRateInput > 0 && plan.minimumRateInput < DEFAULT_MIN_RATE) {
      steps.push("Lift your minimum service rate to at least R150/hr.");
    }

    if (plan.remainingServiceGap > 0 && plan.currentIncome > 0) {
      steps.push(
        `Add about ${formatHours(plan.remainingServiceHours)} more service hours per week or increase pricing to close the remaining ${formatCurrency(
          plan.remainingServiceGap
        )}.`
      );
    }

    if (!elements.skillsList?.value.trim() && !elements.experienceList?.value.trim()) {
      steps.push("Add skills or past roles to unlock more targeted service ideas.");
    }

    if (!steps.length) {
      steps.push("Your plan is on track. Next, confirm the schedule, customers, and pricing.");
      steps.push("Export the PDF when you are ready to share or review the plan.");
    }

    return steps.slice(0, 4);
  }

  function renderNextSteps(plan) {
    if (!elements.nextStepsList) return;

    elements.nextStepsList.innerHTML = "";
    buildNextSteps(plan).forEach((step) => {
      const item = document.createElement("li");
      item.textContent = step;
      elements.nextStepsList.appendChild(item);
    });
  }

  function getIdeaProfileText() {
    return [
      elements.currentJob?.value || "",
      elements.skillsList?.value || "",
      elements.experienceList?.value || "",
    ]
      .join(" ")
      .toLowerCase();
  }

  function getIdeaMatches(profileText = getIdeaProfileText()) {

    if (!profileText.trim()) return DEFAULT_IDEAS;

    const matches = IDEA_LIBRARY.filter((idea) =>
      idea.keywords.some((keyword) => profileText.includes(keyword))
    );

    return matches.length ? Array.from(new Set(matches)).slice(0, 6) : DEFAULT_IDEAS;
  }

  function renderIdeas(force = false) {
    if (!elements.serviceIdeas || !elements.serviceIdeasEmpty) return;

    const profileText = getIdeaProfileText();
    if (!force && profileText === lastIdeasSignature) return;

    lastIdeasSignature = profileText;
    const ideas = getIdeaMatches(profileText);
    elements.serviceIdeas.innerHTML = "";

    if (!ideas.length) {
      elements.serviceIdeasEmpty.style.display = "block";
      return;
    }

    elements.serviceIdeasEmpty.style.display = "none";

    ideas.forEach((idea) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "idea-card";
      button.dataset.ideaId = idea.id;
      button.innerHTML = `
        <h4>${idea.title}</h4>
        <p>${idea.description}</p>
        <div class="idea-meta">
          <span class="idea-chip">${formatHours(idea.hours)} hrs/wk</span>
          <span class="idea-chip">R${idea.rate}/hr</span>
        </div>
      `;
      elements.serviceIdeas.appendChild(button);
    });
  }

  function findIdeaById(id) {
    return IDEA_LIBRARY.find((idea) => idea.id === id) || null;
  }

  function getFirstEmptyServiceRow() {
    return getServiceRows().find((row) => {
      const data = getServiceRowData(row);
      return !data.description && data.hours === 0 && data.rate === 0;
    });
  }

  function applyIdeaToServices(idea) {
    if (!idea) return;

    let row = getFirstEmptyServiceRow();
    if (!row) {
      row = appendServiceRow({
        description: idea.title,
        hours: idea.hours,
        rate: idea.rate,
      });
    }

    if (!row) return;

    row.querySelector('input[id^="svcDesc"]').value = idea.title;
    row.querySelector('input[id^="svcHours"]').value = String(idea.hours);
    row.querySelector('input[id^="svcRate"]').value = String(idea.rate);

    recalcAndPersist();
    row.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function updateOutputs(plan) {
    setText(elements.needsTotal, formatCurrency(plan.needsTotal));
    setText(elements.sumNeeds, formatCurrency(plan.needsTotal));
    setText(elements.currentHourlyRate, formatCurrency(plan.currentHourlyRate));
    setText(elements.sumHourly, formatCurrency(plan.currentHourlyRate));
    setText(elements.extraIncomeNeeded, formatCurrency(plan.extraIncomeNeeded));
    setText(elements.sumExtraIncome, formatCurrency(plan.extraIncomeNeeded));
    setText(elements.heroExtraIncome, formatCurrency(plan.extraIncomeNeeded));
    setText(elements.extraHoursPerWeek, formatHours(plan.extraHoursNeeded));
    setText(elements.sumExtraHours, formatHours(plan.extraHoursNeeded));
    setText(elements.heroExtraHours, formatHours(plan.extraHoursNeeded));
    setText(elements.sumTarget, formatCurrency(plan.targetIncome));
    setText(elements.servicesTotal, formatCurrency(plan.servicesMonthly));
    setText(elements.sumServices, formatCurrency(plan.servicesMonthly));
    setText(elements.heroServices, formatCurrency(plan.servicesMonthly));
    setText(elements.sumRemainingGap, formatCurrency(plan.remainingGap));
    setText(elements.sumIncomeWithServices, formatCurrency(plan.totalIncomeWithServices));
    setText(elements.summaryCurrentIncome, formatCurrency(plan.currentIncome));
    setText(elements.summaryServicePlan, formatCurrency(plan.servicesMonthly));
    setText(elements.summaryGoalPercent, formatPercent(plan.goalProgress));
    setText(elements.goalProgressValue, formatPercent(plan.goalProgress));
    setText(elements.gapRemainingValue, formatCurrency(plan.remainingGap));
    setText(elements.totalIncomeValue, formatCurrency(plan.totalIncomeWithServices));
    setText(elements.needsCoverage, formatCurrency(Math.abs(plan.needsCoverage)));
    setText(elements.recommendedRate, `R${plan.recommendedRate}/hr`);
    setText(elements.remainingGapInline, formatCurrency(plan.remainingGap));
    setText(elements.servicesHoursPlanned, formatHours(plan.servicesHours));
    setText(elements.servicesCoverage, formatPercent(plan.serviceCoverage));
    setText(elements.remainingGap, formatCurrency(plan.remainingGap));

    setMeter(elements.goalMeterFill, plan.goalProgress);
    setMeter(elements.summaryGoalFill, plan.goalProgress);

    if (plan.needsCoverage >= 0 && plan.currentIncome > 0) {
      setText(elements.needsCoverageText, "Your current income covers monthly essentials.");
    } else if (plan.currentIncome > 0) {
      setText(
        elements.needsCoverageText,
        `You are short by ${formatCurrency(Math.abs(plan.needsCoverage))} against essentials.`
      );
    } else {
      setText(
        elements.needsCoverageText,
        "Add your current income and needs to see whether essentials are covered."
      );
    }

    if (plan.currentHourlyRate > 0) {
      setText(
        elements.rateGuidanceText,
        `Your current hourly rate is about ${formatCurrency(
          plan.currentHourlyRate
        )}. Use that as a baseline when pricing services.`
      );
    } else {
      setText(
        elements.rateGuidanceText,
        "Add weekly hours and income to estimate a fair minimum rate."
      );
    }

    if (plan.remainingGap > 0 && plan.servicesMonthly > 0) {
      setText(
        elements.remainingGapText,
        `Your current service plan still leaves ${formatCurrency(
          plan.remainingGap
        )} to close.`
      );
    } else if (plan.remainingGap === 0 && plan.totalIncomeWithServices > 0) {
      setText(
        elements.remainingGapText,
        "Your current income and planned services now cover the target."
      );
    } else {
      setText(
        elements.remainingGapText,
        "Add service lines to see how much of the target is still open."
      );
    }
  }

  function collectState() {
    const fields = staticFieldIds.reduce((result, id) => {
      const element = document.getElementById(id);
      if (element) result[id] = element.value;
      return result;
    }, {});

    const services = getServiceRows().map((row) => {
      const description = row.querySelector('input[id^="svcDesc"]')?.value || "";
      const hours = row.querySelector('input[id^="svcHours"]')?.value || "";
      const rate = row.querySelector('input[id^="svcRate"]')?.value || "";
      return {
        index: toNumber(row.dataset.index),
        description,
        hours,
        rate,
      };
    });

    return {
      fields,
      services,
      nextServiceIndex,
      savedAt: Date.now(),
    };
  }

  function updateSaveStatus(timestamp) {
    const timeLabel = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));

    setText(elements.saveStatus, `Saved locally at ${timeLabel}`);
  }

  function queueSaveState() {
    if (saveTimer) window.clearTimeout(saveTimer);

    saveTimer = window.setTimeout(() => {
      saveTimer = 0;
      saveState();
    }, SAVE_DEBOUNCE_MS);
  }

  function flushPendingSave() {
    if (!saveTimer) return;

    window.clearTimeout(saveTimer);
    saveTimer = 0;
    saveState();
  }

  function queueIdeasRefresh() {
    if (ideasRefreshTimer) window.clearTimeout(ideasRefreshTimer);

    ideasRefreshTimer = window.setTimeout(() => {
      ideasRefreshTimer = 0;
      renderIdeas();
    }, IDEA_REFRESH_DEBOUNCE_MS);
  }

  function saveState() {
    try {
      const snapshot = collectState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      updateSaveStatus(snapshot.savedAt);
    } catch (error) {
      setText(elements.saveStatus, "Local save is unavailable in this browser");
    }
  }

  function restoreState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const saved = JSON.parse(raw);
      if (saved?.fields) {
        Object.entries(saved.fields).forEach(([id, value]) => {
          const element = document.getElementById(id);
          if (element) element.value = value;
        });
      }

      if (elements.servicesTbody && Array.isArray(saved?.services) && saved.services.length) {
        elements.servicesTbody.innerHTML = "";
        saved.services.forEach((service) => {
          elements.servicesTbody.appendChild(createServiceRow(service.index, service));
        });
      }

      nextServiceIndex = Math.max(
        toNumber(saved?.nextServiceIndex),
        getHighestServiceIndex() + 1,
        1
      );
      updateRemoveButtons();

      if (saved?.savedAt) updateSaveStatus(saved.savedAt);
      return true;
    } catch (error) {
      return false;
    }
  }

  function recalcAndPersist(options = {}) {
    const { save = true } = options;
    const plan = buildPlanSnapshot();
    updateOutputs(plan);
    updateStatus(plan);
    updateHints(plan);
    renderNextSteps(plan);
    if (save) queueSaveState();
  }

  function resetAll() {
    if (!window.confirm("Clear all fields and remove the saved local copy of this worksheet?")) {
      return;
    }

    if (saveTimer) {
      window.clearTimeout(saveTimer);
      saveTimer = 0;
    }
    if (ideasRefreshTimer) {
      window.clearTimeout(ideasRefreshTimer);
      ideasRefreshTimer = 0;
    }

    staticFieldIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      if (id === "date") {
        element.value = todayString();
      } else if (id === "targetMonthlyIncome" || id === "targetMonthly") {
        element.value = String(DEFAULT_TARGET);
      } else if (id === "minHourlyRate") {
        element.value = String(DEFAULT_MIN_RATE);
      } else {
        element.value = "";
      }
    });

    resetToSingleServiceRow();

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Ignore storage errors during reset.
    }

    setText(elements.saveStatus, "Private and autosaved locally");
    lastIdeasSignature = "";
    renderIdeas(true);
    recalcAndPersist();
  }

  function imageElementToDataUrl(image) {
    return new Promise((resolve, reject) => {
      if (!image) {
        reject(new Error("Missing image"));
        return;
      }

      const exportImage = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth || image.width;
          canvas.height = image.naturalHeight || image.height;
          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Canvas is not supported"));
            return;
          }

          context.drawImage(image, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (error) {
          reject(error);
        }
      };

      if (image.complete && image.naturalWidth > 0) {
        exportImage();
      } else {
        image.addEventListener("load", exportImage, { once: true });
        image.addEventListener("error", () => reject(new Error("Image failed to load")), {
          once: true,
        });
      }
    });
  }

  function loadExternalScript(src) {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript?.dataset.state === "error") {
        existingScript.remove();
      }

      const reusableScript = document.querySelector(`script[src="${src}"]`);
      if (reusableScript) {
        if (reusableScript.dataset.state === "loaded") {
          resolve();
          return;
        }

        reusableScript.addEventListener("load", () => resolve(), { once: true });
        reusableScript.addEventListener(
          "error",
          () => reject(new Error(`Failed to load ${src}`)),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.state = "loading";
      script.addEventListener(
        "load",
        () => {
          script.dataset.state = "loaded";
          resolve();
        },
        { once: true }
      );
      script.addEventListener(
        "error",
        () => {
          script.dataset.state = "error";
          reject(new Error(`Failed to load ${src}`));
        },
        { once: true }
      );
      document.head.appendChild(script);
    });
  }

  async function ensurePdfLibraries() {
    if (window.jspdf?.jsPDF) return;

    if (!pdfLibraryPromise) {
      pdfLibraryPromise = PDF_SCRIPT_URLS.reduce(
        (promise, src) => promise.then(() => loadExternalScript(src)),
        Promise.resolve()
      ).catch((error) => {
        pdfLibraryPromise = null;
        throw error;
      });
    }

    await pdfLibraryPromise;
  }

  function getPdfTextLines(plan) {
    return [
      `Total monthly needs: ${formatCurrency(plan.needsTotal)}`,
      `Current income: ${formatCurrency(plan.currentIncome)}`,
      `Current hourly rate: ${formatCurrency(plan.currentHourlyRate)}`,
      `Target monthly income: ${formatCurrency(plan.targetIncome)}`,
      `Extra income needed: ${formatCurrency(plan.extraIncomeNeeded)}`,
      `Extra hours needed per week: ${formatHours(plan.extraHoursNeeded)}`,
      `Planned service income: ${formatCurrency(plan.servicesMonthly)}`,
      `Remaining gap: ${formatCurrency(plan.remainingGap)}`,
      `Income with services: ${formatCurrency(plan.totalIncomeWithServices)}`,
    ];
  }

  async function exportPdf() {
    flushPendingSave();

    const exportButton = elements.btnPrint;
    const originalLabel = exportButton?.textContent || "Export PDF";

    if (exportButton) {
      exportButton.disabled = true;
      exportButton.textContent = "Preparing PDF";
    }

    try {
      await ensurePdfLibraries();
    } catch (error) {
      if (exportButton) {
        exportButton.disabled = false;
        exportButton.textContent = originalLabel;
      }
      window.print();
      return;
    }

    try {
      const plan = buildPlanSnapshot();
      const jsPdfModule = window.jspdf;

      if (!jsPdfModule?.jsPDF) {
        window.print();
        return;
      }

      const { jsPDF } = jsPdfModule;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const logoImage = $(".brand-logo");

      try {
        const logoDataUrl = await imageElementToDataUrl(logoImage);
        doc.addImage(logoDataUrl, "PNG", 14, 10, 16, 16);
      } catch (error) {
        // Continue without a logo if it cannot be exported.
      }

      const name = elements.name?.value?.trim() || "User";
      const date = elements.date?.value || todayString();
      const reference = elements.reference?.value?.trim() || "-";

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Enable G - Skills & Income", 34, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Name: ${name}`, 14, 30);
      doc.text(`Date: ${date}`, 14, 35);
      doc.text(`Reference: ${reference}`, 14, 40);

      doc.setFont("helvetica", "bold");
      doc.text("Summary", 14, 50);
      doc.setFont("helvetica", "normal");
      getPdfTextLines(plan).forEach((line, index) => {
        doc.text(line, 14, 56 + index * 5);
      });

      const serviceRows = getServiceRows().map((row) => {
        const data = getServiceRowData(row);
        return [
          data.description || "-",
          formatHours(data.hours),
          formatCurrency(data.rate),
          formatCurrency(data.monthly),
        ];
      });

      if (typeof doc.autoTable === "function") {
        doc.autoTable({
          startY: 108,
          head: [["Monthly needs", "Amount (R)"]],
          body: [
            ["Rent / Mortgage", formatCurrency(readNumber(elements.needRent))],
            ["Food and living essentials", formatCurrency(readNumber(elements.needFood))],
            ["Bills, travel, petrol, utilities", formatCurrency(readNumber(elements.needBills))],
            ["Debt costs", formatCurrency(readNumber(elements.needDebt))],
            [
              "Dependencies / people you support",
              formatCurrency(readNumber(elements.needDependencies)),
            ],
          ],
          theme: "grid",
          headStyles: { fillColor: [38, 98, 67] },
          styles: { font: "helvetica", fontSize: 9, cellPadding: 2.4 },
          columnStyles: { 1: { halign: "right" } },
        });

        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 8,
          head: [["Current situation", "Value"]],
          body: [
            ["Current job", elements.currentJob?.value?.trim() || "-"],
            ["Current income", formatCurrency(plan.currentIncome)],
            ["Hours per week", formatHours(readNumber(elements.hoursPerWeek))],
            ["Current hourly rate", formatCurrency(plan.currentHourlyRate)],
          ],
          theme: "grid",
          headStyles: { fillColor: [38, 98, 67] },
          styles: { font: "helvetica", fontSize: 9, cellPadding: 2.4 },
          columnStyles: { 1: { halign: "right" } },
        });

        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 8,
          head: [["Services plan", "Hours/week", "Rate", "Monthly total"]],
          body: serviceRows.length ? serviceRows : [["-", "-", "-", "-"]],
          foot: [[
            "Total planned service income",
            "",
            "",
            formatCurrency(plan.servicesMonthly),
          ]],
          theme: "grid",
          headStyles: { fillColor: [38, 98, 67] },
          footStyles: { fillColor: [244, 248, 242], textColor: 19, fontStyle: "bold" },
          styles: { font: "helvetica", fontSize: 9, cellPadding: 2.4 },
          columnStyles: {
            1: { halign: "right" },
            2: { halign: "right" },
            3: { halign: "right" },
          },
        });
      } else {
        doc.setFont("helvetica", "bold");
        doc.text("Services plan", 14, 116);
        doc.setFont("helvetica", "normal");

        serviceRows.forEach((row, index) => {
          doc.text(
            `${row[0]} | ${row[1]} hrs/wk | ${row[2]} | ${row[3]}`,
            14,
            122 + index * 6
          );
        });
      }

      const safeName = name.replace(/\s+/g, "_").replace(/[^A-Za-z0-9_-]/g, "");
      doc.save(`EnableG_SkillsIncome_${safeName || "User"}_${date}.pdf`);
    } finally {
      if (exportButton) {
        exportButton.disabled = false;
        exportButton.textContent = originalLabel;
      }
    }
  }

  function handleDocumentInput(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;

    if (mirroredFields[target.id]) syncMirroredField(target);
    if (IDEA_REFRESH_IDS.has(target.id)) queueIdeasRefresh();
    recalcAndPersist();
  }

  function handleServicesClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const removeButton = target.closest('[data-action="remove-service"]');
    if (!removeButton) return;

    const row = removeButton.closest("tr.service-row");
    if (!row || getServiceRows().length <= 1) return;

    row.remove();
    updateRemoveButtons();
    recalcAndPersist();
  }

  function handleIdeasClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const ideaButton = target.closest("[data-idea-id]");
    if (!ideaButton) return;

    applyIdeaToServices(findIdeaById(ideaButton.getAttribute("data-idea-id") || ""));
  }

  function ensureDefaults() {
    setText(elements.year, String(new Date().getFullYear()));

    if (elements.date && !elements.date.value) elements.date.value = todayString();
    if (elements.targetMonthlyIncome && !elements.targetMonthlyIncome.value) {
      elements.targetMonthlyIncome.value = String(DEFAULT_TARGET);
    }
    if (elements.targetMonthly && !elements.targetMonthly.value) {
      elements.targetMonthly.value = String(DEFAULT_TARGET);
    }
    if (elements.minHourlyRate && !elements.minHourlyRate.value) {
      elements.minHourlyRate.value = String(DEFAULT_MIN_RATE);
    }

    nextServiceIndex = Math.max(1, getHighestServiceIndex() + 1);
    updateRemoveButtons();
  }

  function wireEvents() {
    document.addEventListener("input", handleDocumentInput);
    elements.servicesTbody?.addEventListener("click", handleServicesClick);
    elements.serviceIdeas?.addEventListener("click", handleIdeasClick);
    window.addEventListener("pagehide", flushPendingSave);

    elements.btnAddServiceRow?.addEventListener("click", () => {
      appendServiceRow();
      recalcAndPersist();
    });

    elements.btnReset?.addEventListener("click", resetAll);
    elements.btnPrint?.addEventListener("click", exportPdf);
  }

  function init() {
    const restored = restoreState();
    ensureDefaults();
    wireEvents();
    renderIdeas(true);

    if (!restored) setText(elements.saveStatus, "Private and autosaved locally");
    recalcAndPersist({ save: false });
  }

  document.addEventListener("DOMContentLoaded", init);
})();

// Demo data for screenshots. Deterministic (seeded PRNG) so re-captures match.
import { Timestamp } from './timestamp.js';

let s = 42;
const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (a, b) => Math.floor(a + rnd() * (b - a + 1));
const ts = (daysAgo) => Timestamp.fromMillis(Date.now() - daysAgo * 86400000 - int(0, 36e6));
const iso = (d) => d.toISOString().slice(0, 10);

const FIRST = ['Kasun', 'Dilani', 'Ruwan', 'Sanduni', 'Tharindu', 'Nimali', 'Chamath', 'Ishara', 'Pradeep', 'Hiruni', 'Malith', 'Anusha', 'Dinesh', 'Shehani', 'Lahiru', 'Gayathri', 'Asela', 'Rashmi', 'Nuwan', 'Thilini'];
const LAST = ['Perera', 'Fernando', 'Silva', 'Jayawardena', 'Wickramasinghe', 'Bandara', 'Gunasekara', 'Rajapaksha', 'Dissanayake', 'Herath', 'Senanayake', 'Wijesinghe', 'Karunaratne', 'Mendis'];
const CORPS = ['Lanka Tiles PLC', 'Ceylon Cold Stores', 'Hayleys Fabric', 'Dialog Axiata', 'Kelani Valley Plantations', 'Access Engineering', 'Royal Ceramics', 'Hemas Holdings', 'Sampath Leasing', 'Cargills Foods', 'Abans Electricals', 'Brandix Apparel'];
const INSURERS = ['Ceylinco General', 'Sri Lanka Insurance', 'Allianz Lanka', 'Fairfirst Insurance', 'LOLC General', 'HNB General', 'Union Assurance', 'Softlogic Life', 'Continental Insurance', 'Peoples Insurance'];
const PRODUCTS = [
  ['motor', 'Motor', 'Motor'], ['motor', 'Motor', 'Motor'], ['motor', 'Motor', 'Motor'],
  ['fire', 'Fire', 'Fire'], ['fire', 'Fire', 'Fire'], ['marine', 'Marine', 'Marine'],
  ['group_medical', 'Group Medical', 'Health'], ['personal_accidents', 'Personal Accident', 'Miscellaneous'],
  ['wci', "Workmen's Comp", 'Miscellaneous'], ['public_liability', 'Public Liability', 'Miscellaneous'],
  ['travel', 'Travel', 'Miscellaneous'], ['cyber', 'Cyber', 'Miscellaneous'], ['motor_fleet', 'Motor Fleet', 'Motor'],
];
const MANAGERS = ['Nadeesha Perera', 'Ravindu Silva', 'Amaya Fernando'];
const MAKES = [['Toyota', 'Aqua'], ['Honda', 'Vezel'], ['Suzuki', 'Wagon R'], ['Toyota', 'Prius'], ['Nissan', 'Leaf'], ['Mitsubishi', 'Montero'], ['BMW', 'X1'], ['Toyota', 'Hilux']];

const person = () => `${pick(FIRST)} ${pick(LAST)}`;

const clients = [];
for (let i = 0; i < 68; i++) {
  const corp = rnd() < 0.3;
  const [product, type, main] = pick(PRODUCTS);
  const name = corp ? pick(CORPS) : person();
  const from = new Date(Date.now() - (i % 5 === 2 ? int(302, 361) : int(-40, 290)) * 86400000);
  const to = new Date(from.getTime() + 364 * 86400000);
  const prem = Math.round((product.startsWith('motor') ? int(38, 260) : int(60, 1900)) * 1000);
  const mk = pick(MAKES);
  clients.push({
    id: 'c' + i,
    client_name: name,
    customer_type: corp ? 'Corporate' : 'Individual',
    email: (corp ? 'finance@' + name.split(' ')[0].toLowerCase() + '.lk' : name.toLowerCase().replace(' ', '.') + '@gmail.com'),
    mobile_no: '07' + int(0, 8) + ' ' + int(100, 999) + ' ' + int(1000, 9999),
    policy_no: `${product === 'motor' ? 'VM' : product.slice(0, 2).toUpperCase()}/${int(10, 99)}/${int(100000, 999999)}`,
    insuresaas_ib_file_no: `ISB-2026-${String(1200 + i).padStart(5, '0')}`,
    product, insurance_type: type, main_class: main,
    insurance_provider: pick(INSURERS),
    policy_period_from: iso(from), policy_period_to: iso(to),
    premium: prem, net_premium: Math.round(prem * 0.86), gross_premium: prem,
    sum_insured: prem * int(40, 90),
    manager: pick(MANAGERS), introducer_code: 'AG' + int(100, 140),
    vehicle_no: product.startsWith('motor') ? `${pick(['CAB', 'CBK', 'KX', 'PH', 'CAR'])}-${int(1000, 9999)}` : '',
    make: mk[0], model: mk[1],
    status: i < 3 ? 'pending' : 'approved',
    submitted_by: 'demo-admin',
    commission_rate: int(10, 25), commission_amount: Math.round(prem * 0.15),
    payments: [], endorsements: [],
    created_at: ts(i * 4 + int(0, 3)),
  });
}

const companies = INSURERS.map((n, i) => ({ id: 'ic' + i, name: n, email: `quotes@${n.split(' ')[0].toLowerCase()}.lk`, category: i > 6 ? 'Life' : i % 3 === 0 ? 'Motor' : 'Non Motor' }));

const quotes = [];
for (let i = 0; i < 18; i++) {
  const [product] = pick(PRODUCTS);
  const sent = [...companies].sort(() => rnd() - 0.5).slice(0, int(3, 6));
  const nResp = i < 4 ? int(0, 2) : int(2, sent.length);
  const responses = sent.slice(0, nResp).map((c, k) => {
    const p = int(52, 240) * 1000;
    return {
      id: 'r' + i + k, company_id: c.id, company_name: c.name, premium: p, net_premium: Math.round(p * 0.87),
      basic_premium: Math.round(p * 0.78), srcc_premium: Math.round(p * 0.06), tc_premium: Math.round(p * 0.03),
      validity_days: pick([14, 30, 30, 45]), deductible: pick(['LKR 10,000', '5% of claim', 'LKR 25,000']), excesses: pick(['Nil', 'LKR 7,500']),
      submitted_at: ts(i), cover_responses: {}, clause_responses: {},
    };
  });
  const confirmed = i > 3 && i % 3 === 0 && responses.length;
  const custName = rnd() < 0.3 ? pick(CORPS) : person();
  quotes.push({
    id: 'q' + i,
    reference: `QT-2026-${String(410 - i).padStart(4, '0')}`,
    product_key: product,
    customer_name: custName, customer_email: 'client@example.lk', customer_phone: '077 ' + int(1000000, 9999999),
    form_data: { proposer_name: custName, vehicle_no: `CAB-${int(1000, 9999)}`, make: 'Toyota', model: 'Aqua', market_value: int(4, 18) * 1000000 },
    sent_to: sent.map((c) => ({ company_id: c.id, company_name: c.name, email: c.email })),
    responses,
    status: confirmed ? 'confirmed' : responses.length ? 'responded' : 'sent',
    selected_company: confirmed ? responses[0].company_name : '',
    customer_selection: i % 4 === 1 && responses.length ? { company_name: responses[responses.length - 1].company_name, selected_at: Date.now() - i * 3600e3 } : null,
    created_by_name: pick(MANAGERS), created_by: 'demo-admin',
    created_at: ts(i * 2),
  });
}

const STATUSES = ['Filed', 'Investigating', 'Under Review', 'Approved', 'Settled', 'Settled'];
const claims = Array.from({ length: 14 }, (_, i) => {
  const c = clients[int(3, 60)];
  const loss = int(80, 2400) * 1000;
  const status = STATUSES[i % STATUSES.length];
  return {
    id: 'cl' + i, reference: `CLM-2026-${String(88 - i).padStart(4, '0')}`, claim_ref_id: `CR${int(10000, 99999)}`,
    client_name: c.client_name, policy_no: c.policy_no, product: c.product,
    cause: pick(['Accident damage', 'Flood damage', 'Theft', 'Fire damage', 'Hospitalisation', 'Windscreen']),
    incident_date: iso(new Date(Date.now() - int(3, 90) * 86400000)),
    loss_amount: loss, settlement_amount: status === 'Settled' ? Math.round(loss * 0.92) : 0,
    status, description: '', notes: '', process_tracker: {}, created_at: ts(i * 5),
  };
});

const users = [
  { id: 'demo-admin', full_name: 'Nadeesha Perera', email: 'nadeesha@insuresaas.lk', role: 'admin', created_at: ts(400) },
  { id: 'u2', full_name: 'Ravindu Silva', email: 'ravindu@insuresaas.lk', role: 'manager', created_at: ts(300) },
  { id: 'u3', full_name: 'Amaya Fernando', email: 'amaya@insuresaas.lk', role: 'employee', created_at: ts(200) },
];

export const SEED = {
  users, clients, quotes, claims,
  insurance_companies: companies,
  insurance_providers: companies,
  device_sessions: [{ id: 'demo-admin_dev', approved: true, blocked: false }],
  settings: [
    { id: 'device_control', lockdown_mode: false },
  ],
  marketers: [], products: [], customers: [], tickets: [], work_sessions: [],
};

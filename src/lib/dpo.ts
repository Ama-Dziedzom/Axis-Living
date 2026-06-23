const API_URL = process.env.DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/';
const PAYMENT_BASE_URL = process.env.DPO_PAYMENT_BASE_URL || 'https://secure.3gdirectpay.com/payv2.php';
const COMPANY_TOKEN = process.env.DPO_COMPANY_TOKEN!;
const SERVICE_TYPE = process.env.DPO_SERVICE_TYPE || '5525';

function extractXml(xml: string, tag: string): string {   
    const match = xml.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`));
    return match ? match[1].trim() : '';
}

async function dpoPost(xml: string): Promise<string> {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml',
            'Accept': 'text/xml, application/xml',
        },
        body: xml,
    });
    if (!res.ok) {
        const body = await res.text().catch(() => '(no body)');
        throw new Error(`DPO API error: ${res.status} — ${body}`);
    }
    return res.text();
}

function todayServiceDate(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} 00:00`;
}

export async function createToken(params: {
    amount: number;
    currency: string;
    reference: string;
    redirectUrl: string;
    backUrl: string;
    customerFirstName?: string;
    customerLastName?: string;
    customerEmail?: string;
    customerPhone?: string;
}) {
    const optionalFields = [
        params.customerFirstName ? `<customerFirstName>${params.customerFirstName}</customerFirstName>` : '',
        params.customerLastName  ? `<customerLastName>${params.customerLastName}</customerLastName>`   : '',
        params.customerEmail     ? `<customerEmail>${params.customerEmail}</customerEmail>`             : '',
        params.customerPhone     ? `<customerPhone>${params.customerPhone}</customerPhone>`             : '',
    ].filter(Boolean).join('\n    ');

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${COMPANY_TOKEN}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${params.amount.toFixed(2)}</PaymentAmount>
    <PaymentCurrency>${params.currency}</PaymentCurrency>
    <CompanyRef>${params.reference}</CompanyRef>
    <RedirectURL>${params.redirectUrl}</RedirectURL>
    <BackURL>${params.backUrl}</BackURL>
    <CompanyRefUnique>0</CompanyRefUnique>
    <PTL>60</PTL>
    ${optionalFields}
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${SERVICE_TYPE}</ServiceType>
      <ServiceDescription>Design Consultation - NOA Living Studio</ServiceDescription>
      <ServiceDate>${todayServiceDate()}</ServiceDate>
    </Service>
  </Services>
</API3G>`;

    const response = await dpoPost(xml);
    const result = extractXml(response, 'Result');

    if (result !== '000') {
        const explanation = extractXml(response, 'ResultExplanation');
        throw new Error(`DPO createToken failed (${result}): ${explanation}`);
    }

    return {
        transactionToken: extractXml(response, 'TransToken'),
        transactionRef: extractXml(response, 'TransRef'),
    };
}

const MNO_MAP: Record<string, string> = {
    AIRTEL: 'AIRTELZM',
    MTN: 'MTNZM',
    ZAMTEL: 'ZAMTELZM',
};

export async function chargeTokenMobile(
    transactionToken: string,
    phoneNumber: string,
    network: string,
) {
    const mno = MNO_MAP[network.toUpperCase()] ?? network;
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${COMPANY_TOKEN}</CompanyToken>
  <Request>chargeTokenMobile</Request>
  <TransactionToken>${transactionToken}</TransactionToken>
  <PhoneNumber>${phoneNumber}</PhoneNumber>
  <MNO>${mno}</MNO>
  <MNOcountry>Zambia</MNOcountry>
</API3G>`;
    
    const response = await dpoPost(xml);
    const result = extractXml(response, 'Result');
    const explanation = extractXml(response, 'ResultExplanation');

    // 000 = immediate success, 900 = push sent (pending confirmation)
    if (result !== '000' && result !== '900') {
        throw new Error(`DPO chargeTokenMobile failed (${result}): ${explanation}`);
    }

    return { result, explanation };
}

export async function verifyToken(transactionToken: string) {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${COMPANY_TOKEN}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${transactionToken}</TransactionToken>
</API3G>`;

    const response = await dpoPost(xml);
    const result = extractXml(response, 'Result');
    const explanation = extractXml(response, 'ResultExplanation');
    const transactionRef = extractXml(response, 'TransactionRef');

    return { result, explanation, transactionRef };
}

export function getPaymentUrl(transactionToken: string): string {
    return `${PAYMENT_BASE_URL}?ID=${transactionToken}`;
}

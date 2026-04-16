'use client';

// ─────────────────────────────────────────────
// Receipt PDF — generated with @react-pdf/renderer.
// A demo receipt carries a QR code that links to a
// verification page — same shape a real council
// might use to let stakeholders validate receipts.
//
// Spec §3.1 requires: QR verification, branded
// layout, downloadable, shareable.
// ─────────────────────────────────────────────

import {
  Document,
  Image as PdfImage,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type { Transaction } from '@/mocks/fixtures/transactions';
import type { Property } from '@/mocks/fixtures/properties';

// Re-declare brand colours locally because @react-pdf
// styles can't read CSS variables.
const C = {
  navy: '#1F3A68',
  gold: '#C9A227',
  success: '#1E7F4F',
  ink: '#222222',
  muted: '#555555',
  line: '#E5E7EB',
  surface: '#F7F8FA',
} as const;

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10.5,
    color: C.ink,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `2 solid ${C.navy}`,
    paddingBottom: 14,
    marginBottom: 20,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crest: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  councilName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
  },
  councilSub: {
    fontSize: 9,
    color: C.muted,
    marginTop: 2,
  },
  docTitle: {
    textAlign: 'right',
  },
  docTitleLabel: {
    fontSize: 10,
    color: C.muted,
    marginBottom: 2,
  },
  docTitleValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
  },
  pillPaid: {
    alignSelf: 'flex-start',
    backgroundColor: C.success,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    letterSpacing: 0.5,
  },
  amountBlock: {
    marginTop: 10,
    marginBottom: 18,
  },
  amountLabel: {
    fontSize: 10,
    color: C.muted,
    marginBottom: 2,
  },
  amount: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: C.ink,
  },
  section: {
    marginTop: 8,
  },
  sectionHeading: {
    fontSize: 9,
    color: C.muted,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottom: `0.5 solid ${C.line}`,
  },
  rowLabel: {
    color: C.muted,
  },
  rowValue: {
    fontFamily: 'Helvetica-Bold',
  },
  columns: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 20,
  },
  column: {
    flex: 1,
  },
  qrCol: {
    width: 130,
    alignItems: 'center',
  },
  qr: {
    width: 110,
    height: 110,
    border: `1 solid ${C.line}`,
    padding: 4,
    marginBottom: 6,
  },
  qrCaption: {
    fontSize: 8,
    color: C.muted,
    textAlign: 'center',
  },
  qrRef: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
    color: C.ink,
  },
  footer: {
    position: 'absolute',
    left: 40,
    right: 40,
    bottom: 30,
    fontSize: 8,
    color: C.muted,
    borderTop: `0.5 solid ${C.line}`,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  watermark: {
    position: 'absolute',
    top: 260,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 72,
    fontFamily: 'Helvetica-Bold',
    color: C.gold,
    opacity: 0.06,
    transform: 'rotate(-18deg)',
  },
});

interface ReceiptPdfProps {
  transaction: Transaction;
  property: Property;
  ownerName: string;
  qrDataUrl: string;
}

export function ReceiptPdf({ transaction, property, ownerName, qrDataUrl }: ReceiptPdfProps) {
  const date = new Date(transaction.createdAt);
  const dateStr = date.toLocaleString('en-ZW', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Document title={`Bikita RDC receipt ${transaction.reference}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark} fixed>
          PAID
        </Text>

        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.crest}>
              <View style={{ width: 32, height: 32, backgroundColor: C.navy, borderRadius: 6 }}>
                <Text
                  style={{
                    color: C.gold,
                    textAlign: 'center',
                    fontSize: 18,
                    fontFamily: 'Helvetica-Bold',
                    marginTop: 5,
                  }}
                >
                  ★
                </Text>
              </View>
            </View>
            <View>
              <Text style={styles.councilName}>Bikita RDC</Text>
              <Text style={styles.councilSub}>Rural District Council — Demo</Text>
            </View>
          </View>
          <View style={styles.docTitle}>
            <Text style={styles.docTitleLabel}>Receipt</Text>
            <Text style={styles.docTitleValue}>{transaction.reference}</Text>
          </View>
        </View>

        <Text style={styles.pillPaid}>PAID · {dateStr}</Text>

        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>Amount received</Text>
          <Text style={styles.amount}>
            {transaction.currency} {transaction.amount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.sectionHeading}>Payer</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Name</Text>
              <Text style={styles.rowValue}>{ownerName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Method</Text>
              <Text style={styles.rowValue}>{formatChannel(transaction.channel)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Reference</Text>
              <Text style={styles.rowValue}>{transaction.reference}</Text>
            </View>

            <Text style={[styles.sectionHeading, { marginTop: 18 }]}>Property</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Stand</Text>
              <Text style={styles.rowValue}>{property.stand}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Address</Text>
              <Text style={styles.rowValue}>{property.address}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Ward</Text>
              <Text style={styles.rowValue}>{property.ward}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Class</Text>
              <Text style={styles.rowValue}>{property.classKind}</Text>
            </View>
          </View>

          <View style={styles.qrCol}>
            <Text style={styles.sectionHeading}>Verify</Text>
            <PdfImage src={qrDataUrl} style={styles.qr} />
            <Text style={styles.qrCaption}>Scan to verify this receipt</Text>
            <Text style={styles.qrRef}>{transaction.reference}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Bikita Rural District Council · PO Box 1, Bikita · +263 39 2000000</Text>
          <Text>
            Demo document — not a live receipt. Generated {dateStr}.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

function formatChannel(ch: Transaction['channel']): string {
  const map: Record<Transaction['channel'], string> = {
    ecocash: 'EcoCash',
    onemoney: 'OneMoney',
    innbucks: 'InnBucks',
    paynow: 'Paynow',
    zimswitch: 'ZimSwitch',
    bank: 'Bank transfer',
    cash: 'Cash receipt',
    mastercard: 'Visa / Mastercard',
    mukuru: 'Mukuru',
  };
  return map[ch];
}

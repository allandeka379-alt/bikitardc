'use client';

// ─────────────────────────────────────────────
// Certificate PDF — issued when an application is
// approved and its fee has been paid (spec §3.1
// "Certificate download with QR verification").
// Shares the visual language of the payment
// receipt so council branding is consistent.
// ─────────────────────────────────────────────

import {
  Document,
  Image as PdfImage,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type { Application } from '@/mocks/fixtures/applications';

const C = {
  navy: '#1F3A68',
  gold: '#C9A227',
  success: '#1E7F4F',
  ink: '#222222',
  muted: '#555555',
  line: '#E5E7EB',
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: C.ink, fontFamily: 'Helvetica' },
  borderFrame: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: C.navy,
  },
  borderFrameInner: {
    position: 'absolute',
    top: 26,
    left: 26,
    right: 26,
    bottom: 26,
    borderStyle: 'solid',
    borderWidth: 0.75,
    borderColor: C.gold,
  },
  crestRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
  crestBox: {
    width: 40,
    height: 40,
    backgroundColor: C.navy,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crestStar: { color: C.gold, fontSize: 22, fontFamily: 'Helvetica-Bold' },
  councilName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.navy },
  councilSub:  { fontSize: 9, color: C.muted, marginTop: 2 },
  titleBlock: { marginTop: 36, textAlign: 'center' },
  title: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: C.navy, letterSpacing: 1 },
  titleUnderline: { width: 80, height: 2, backgroundColor: C.gold, alignSelf: 'center', marginTop: 6, marginBottom: 18 },
  ribbon: {
    alignSelf: 'center',
    backgroundColor: C.success,
    color: '#fff',
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 12,
    paddingVertical: 3,
    fontSize: 10,
    letterSpacing: 0.8,
    borderRadius: 999,
    marginBottom: 18,
  },
  subjectIntro: { textAlign: 'center', color: C.muted, fontSize: 11, marginBottom: 4 },
  subjectName: { textAlign: 'center', fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.ink },
  description: { textAlign: 'center', color: C.ink, marginTop: 14, fontSize: 11, lineHeight: 1.5, marginHorizontal: 30 },
  columns: { flexDirection: 'row', marginTop: 30 },
  leftCol: { flex: 1, paddingRight: 16 },
  rightCol: { width: 140, alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottom: `0.5 solid ${C.line}` },
  rowLabel: { color: C.muted, fontSize: 10 },
  rowValue: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  qr: { width: 115, height: 115, border: `1 solid ${C.line}`, padding: 4 },
  qrCaption: { fontSize: 8, color: C.muted, textAlign: 'center', marginTop: 6 },
  qrRef: { fontFamily: 'Helvetica-Bold', fontSize: 9, textAlign: 'center', marginTop: 2, color: C.ink },
  seal: {
    position: 'absolute',
    right: 64,
    bottom: 110,
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'rotate(-14deg)',
    opacity: 0.85,
  },
  sealRing: {
    width: 90,
    height: 90,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: C.gold,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealText: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.gold, letterSpacing: 1 },
  sealYear: { fontFamily: 'Helvetica-Bold', fontSize: 16, color: C.gold },
  signature: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' },
  sigBlock: { width: 180 },
  sigLine: { borderTopWidth: 0.75, borderTopColor: C.ink, marginTop: 28, paddingTop: 4 },
  sigLabel: { color: C.muted, fontSize: 9 },
  sigName:  { fontFamily: 'Helvetica-Bold', fontSize: 10, color: C.ink, marginTop: 1 },
  footer: {
    position: 'absolute',
    left: 40,
    right: 40,
    bottom: 30,
    fontSize: 8,
    color: C.muted,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

interface CertificatePdfProps {
  application: Application;
  issuedTo: string;
  qrDataUrl: string;
}

export function CertificatePdf({ application, issuedTo, qrDataUrl }: CertificatePdfProps) {
  const issuedOn = new Date().toLocaleDateString('en-ZW', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const validTo = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString('en-ZW', { year: 'numeric', month: 'long', day: 'numeric' });
  })();

  return (
    <Document title={`Bikita RDC certificate ${application.reference}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.borderFrame} />
        <View style={styles.borderFrameInner} />

        <View style={styles.crestRow}>
          <View style={styles.crestBox}>
            <Text style={styles.crestStar}>★</Text>
          </View>
          <View>
            <Text style={styles.councilName}>Bikita Rural District Council</Text>
            <Text style={styles.councilSub}>Office of the Chief Executive Officer</Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>CERTIFICATE</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.ribbon}>ISSUED {issuedOn.toUpperCase()}</Text>
          <Text style={styles.subjectIntro}>This is to certify that</Text>
          <Text style={styles.subjectName}>{issuedTo}</Text>
          <Text style={styles.description}>
            has been granted the licence described below under the authority of the Bikita Rural District
            Council and is authorised to carry on the activities set out, subject to all applicable by-laws.
          </Text>
        </View>

        <View style={styles.columns}>
          <View style={styles.leftCol}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Licence</Text>
              <Text style={styles.rowValue}>{application.title}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Reference</Text>
              <Text style={styles.rowValue}>{application.reference}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Issued on</Text>
              <Text style={styles.rowValue}>{issuedOn}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Valid until</Text>
              <Text style={styles.rowValue}>{validTo}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Fee paid</Text>
              <Text style={styles.rowValue}>USD {application.feeUsd.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.rightCol}>
            <PdfImage src={qrDataUrl} style={styles.qr} />
            <Text style={styles.qrCaption}>Scan to verify</Text>
            <Text style={styles.qrRef}>{application.reference}</Text>
          </View>
        </View>

        {/* Decorative seal */}
        <View style={styles.seal}>
          <View style={styles.sealRing}>
            <Text style={styles.sealText}>OFFICIAL</Text>
            <Text style={styles.sealYear}>RDC</Text>
            <Text style={styles.sealText}>BIKITA</Text>
          </View>
        </View>

        <View style={styles.signature}>
          <View style={styles.sigBlock}>
            <View style={styles.sigLine}>
              <Text style={styles.sigLabel}>Issuing Officer</Text>
              <Text style={styles.sigName}>Mai Moyo · Rates Clerk</Text>
            </View>
          </View>
          <View style={styles.sigBlock}>
            <View style={styles.sigLine}>
              <Text style={styles.sigLabel}>Chief Executive Officer</Text>
              <Text style={styles.sigName}>Bikita Rural District Council</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Bikita Rural District Council · PO Box 1, Bikita · +263 39 2000000</Text>
          <Text>Demo document — not a legal instrument.</Text>
        </View>
      </Page>
    </Document>
  );
}

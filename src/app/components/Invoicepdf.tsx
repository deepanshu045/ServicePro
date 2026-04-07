import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// ✅ TYPES (match your Billing.tsx Bill type)
interface BillItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface BusinessSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  termsAndConditions: string;
}

interface Bill {
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: BillItem[];
  total: number;
  totalInWords: string;
  date: string;
  businessSettings: BusinessSettings;
}

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 11, fontFamily: "Helvetica" },
  main: { border: "2 solid black" },

  header: {
    textAlign: "center",
    padding: 15,
    borderBottom: "2 solid black",
  },
  headerText: { fontSize: 16, marginBottom: 5 },

  invoiceDetail: {
    flexDirection: "row",
    borderBottom: "2 solid black",
  },
  leftBox: {
    width: "50%",
    padding: 10,
    borderRight: "2 solid black",
  },
  rightBox: {
    width: "50%",
    padding: 10,
  },

  table: {
    width: "100%",
    border: "1 solid black",
  },
  tableRow: { flexDirection: "row" },
  th: {
    width: "20%",
    backgroundColor: "#b2b1b1",
    border: "1 solid black",
    padding: 5,
    textAlign: "center",
    fontWeight: "bold",
  },
  td: {
    width: "20%",
    border: "1 solid black",
    padding: 5,
    textAlign: "center",
  },

  totalText: {
    textAlign: "right",
    paddingRight: 10,
    marginTop: 5,
  },

  bank: {
    marginTop: 20,
    borderTop: "2 solid black",
    borderBottom: "2 solid black",
    padding: 10,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  footerLeft: { width: "40%" },
  footerCenter: { width: "20%" },
  footerRight: { width: "20%" },
  image: { width: "100%" },
});

// ✅ RECEIVE PROPS
const InvoiceDocument = ({ bill }: { bill: Bill }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.main}>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {bill.businessSettings.businessName}
            </Text>
            <Text>{bill.businessSettings.address}</Text>
            <Text>
              Tel.: {bill.businessSettings.phone} | Email:{" "}
              {bill.businessSettings.email}
            </Text>
          </View>

          {/* INVOICE DETAILS */}
          <View style={styles.invoiceDetail}>
            <View style={styles.leftBox}>
              <Text>Invoice no: {bill.invoiceNumber}</Text>
              <Text>Date: {bill.date}</Text>
            </View>

            <View style={styles.rightBox}>
              <Text>Customer Details</Text>
              <Text>Name: {bill.customerName}</Text>
              <Text>Phone: {bill.customerPhone}</Text>
              <Text>Address: {bill.customerAddress}</Text>
            </View>
          </View>

          {/* TABLE */}
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.th}>S.N.</Text>
              <Text style={styles.th}>Description</Text>
              <Text style={styles.th}>Qty</Text>
              <Text style={styles.th}>Rate</Text>
              <Text style={styles.th}>Amount</Text>
            </View>

            {/* ✅ DYNAMIC ITEMS */}
            {bill.items.map((item, index) => (
              <View style={styles.tableRow} key={item.id}>
                <Text style={styles.td}>{index + 1}</Text>
                <Text style={styles.td}>{item.description}</Text>
                <Text style={styles.td}>{item.quantity}</Text>
                <Text style={styles.td}>{item.rate}</Text>
                <Text style={styles.td}>{item.amount}</Text>
              </View>
            ))}

            {/* TOTAL */}
            <View style={styles.tableRow}>
              <Text style={styles.td}></Text>
              <Text style={styles.td}></Text>
              <Text style={styles.td}></Text>
              <Text style={styles.td}>Total</Text>
              <Text style={styles.td}>{bill.total}</Text>
            </View>
          </View>

          {/* TOTAL WORDS */}
          <Text style={styles.totalText}>
            Total Amount in Words: {bill.totalInWords}
          </Text>

          {/* BANK */}
          <View style={styles.bank}>
            <Text>Bank Details</Text>
            <Text>A/C: {bill.businessSettings.accountNumber}</Text>
            <Text>IFSC: {bill.businessSettings.ifscCode}</Text>
            <Text>UPI: {bill.businessSettings.upiId}</Text>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text>
                Terms & Conditions:
                {"\n"}
                {bill.businessSettings.termsAndConditions}
              </Text>
            </View>

            <View style={styles.footerCenter}>
              <Image
                style={styles.image}
                src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi"
              />
            </View>

            <View style={styles.footerRight}>
              <Text>Authorized Signatory</Text>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  );
};

export default InvoiceDocument;
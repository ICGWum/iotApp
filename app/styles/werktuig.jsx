import { StyleSheet } from "react-native";
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#4CAF50", // Green button
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
    elevation: 2,
  },
  addButtonWide: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
    width: "100%",
    alignSelf: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff", // White text for button
  },
  list: {
    padding: 16,
  },
  equipmentItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  equipmentActions: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: "center",
    minWidth: 70,
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    maxHeight: 300,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#FF0000",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  scanTagButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 16,
  },
  scanTagButtonDefault: {
    backgroundColor: "#00bee1",
  },
  scanTagButtonScanned: {
    backgroundColor: "#4CAF50",
  },
  scanTagButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoModalButton: {
    width: 240,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
  infoModalButtonGroup: {
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },
  alertForeground: {
    zIndex: 9999,
    elevation: 10,
  },
});

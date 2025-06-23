import { StyleSheet } from "react-native";
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // White background
  },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff", // White background
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111", // Black text
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
    minWidth: "40%",
    maxWidth: "60%",
    alignSelf: "flex-end",
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
    paddingBottom: 80,
  },
  tractorItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#888",
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  formContainer: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    marginRight: 0, // Remove right margin for centering
    alignSelf: "center", // Center the button
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    marginLeft: 0, // Remove left margin for centering
    alignSelf: "center", // Center the button
  },
  scanTagButton: {
    backgroundColor: "#2196F3",
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  scanTagButtonScanned: {
    backgroundColor: "#4CAF50",
  },
  scanTagButtonDefault: {
    backgroundColor: "#2196F3",
  },
  scanTagButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoModalButton: {
    width: 240, // Make all popup buttons wider
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
});

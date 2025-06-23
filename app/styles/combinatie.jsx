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
    paddingTop: 40, // Added to match Tractor header
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexWrap: "wrap",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24, // wider
    paddingVertical: 10, // slightly taller
    borderRadius: 20,
    alignSelf: "flex-start",
    minWidth: 200, // make button wider
    maxWidth: 300,
    elevation: 2,
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  list: {
    padding: 16,
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
  combinationItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  combinationHeader: {
    marginBottom: 10,
  },
  combinationName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  combinationDescription: {
    color: "#666",
    marginBottom: 4,
  },
  tractorInfo: {
    fontWeight: "500",
    color: "#2196F3",
  },
  equipmentList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  equipmentItem: {
    marginLeft: 8,
    marginBottom: 2,
  },
  noEquipment: {
    fontStyle: "italic",
    color: "#666",
    marginLeft: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: "center",
    minWidth: 90,
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#F44336",
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
    maxHeight: "90%",
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    maxHeight: 350,
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
  },
  selectedEquipmentList: {
    marginBottom: 16,
  },
  selectedEquipmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 4,
    padding: 8,
    marginBottom: 4,
  },
  removeButton: {
    backgroundColor: "#ffcdd2",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#b71c1c",
    fontWeight: "bold",
    fontSize: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 8,
  },
  modalActionsVertical: {
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "stretch",
    marginTop: 32,
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: "#F44336", // red
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  closeButton: {
    backgroundColor: "#2196F3",
    marginTop: 16,
  },
  selectionList: {
    maxHeight: 350,
  },
  selectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedItem: {
    backgroundColor: "#e3f2fd",
  },
  selectionItemContent: {
    flex: 1,
  },
  itemName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#2196F3",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#2196F3",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptySelectionList: {
    padding: 20,
    alignItems: "center",
  },
  warningText: {
    color: "#f44336",
    fontSize: 12,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  mappingContainer: {
    flex: 1,
    minHeight: 100,
    marginBottom: 16,
  },
  mappingLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  mappingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  mappingWerktuig: {
    flex: 1,
    alignItems: "center",
  },
  mappingArrowContainer: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 25,
  },
  mappingTractor: {
    flex: 2,
    alignItems: "center",
  },
  mappingLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  connectionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  connectionBadgeMapped: {
    backgroundColor: "#2196F3",
    borderColor: "#1976D2",
  },
  connectionNumber: {
    fontSize: 18,
    color: "#666",
  },
  connectionNumberMapped: {
    color: "#fff",
  },
  tractorConnectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
    maxWidth: 200,
  },
  tractorConnectionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  tractorConnectionButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#1976D2",
  },
  tractorConnectionButtonUsed: {
    opacity: 0.5,
  },
  tractorConnectionNumber: {
    fontSize: 16,
    color: "#666",
  },
  tractorConnectionNumberSelected: {
    color: "#fff",
  },
  mappingArrow: {
    fontSize: 24,
    color: "#666",
  },
  mappingHeaderContainer: {
    marginBottom: 16,
  },
  mappingContentContainer: {
    paddingBottom: 16,
  },
  modalActionsBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    gap: 12,
  },
  blueButton: {
    backgroundColor: "#2196F3",
  },
  redButton: {
    backgroundColor: "#F44336",
  },
  nfcButton: {
    backgroundColor: "#FF9800",
  },
});

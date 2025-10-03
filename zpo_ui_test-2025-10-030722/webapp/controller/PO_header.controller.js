sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("zpouitest.controller.PO_header", {
        onInit: function () {
            // Create empty model for table data
            var oTableModel = new JSONModel({
                poHeaders: []   // array for rows
            });
            this.getView().setModel(oTableModel, "tableData");

            // Create model for form input (single entry)
            var oFormModel = new JSONModel({
                purchaseorder: "",
                creationdate: "",
                purchaseorderdate: ""
            });
            this.getView().setModel(oFormModel, "formData");
        },

        onGo: function () {
            var oTableModel = this.getView().getModel("tableData");
            $.ajax({
                url: "/sap/bc/http/sap/ZHTTP_PO",
                method: "GET",
                contentType: "application/json",
                success: function (response) {
                    // Bind full array to table
                    oTableModel.setProperty("/poHeaders", response);
                    MessageToast.show("✅ Data loaded");

                },
                error: function (err) {
                    MessageToast.show("❌ Error loading PO headers");
                    console.error(err);
                }
            });
        },

        onRowSelect: function (oEvent) {

            var oTable = oEvent.getSource(); // the Table
            var oSelectedItem = oTable.getSelectedItem(); // get selected row
            if (!oSelectedItem) return; // safety check

            var oContext = oSelectedItem.getBindingContext("tableData");
            var oRowData = oContext.getObject();

            console.log("Selected row data:", oRowData);

            // Set formData model
            var oFormModel = this.getView().getModel("formData");
            oFormModel.setProperty("/purchaseorder", oRowData.purchaseorder);
            oFormModel.setProperty("/creationdate", oRowData.creationdate);
            oFormModel.setProperty("/purchaseorderdate", oRowData.purchaseorderdate);
        },

        onSave: function () {
            // var oData = this.getView().getModel("formData").getData();
            var oView = this.getView();
            var oFormModel = oView.getModel("formData"); // ✅ get the model
            var oData = oFormModel.getData();

            console.log("Saving data:", oData);

            if (!oData.purchaseorder) {
                MessageToast.show("⚠️ Please fill all mandatory fields");
                return; // stop save
            }

            $.ajax({
                url: "/sap/bc/http/sap/ZHTTP_PO",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify([oData]), // wrap in array since backend expects table
                success: function (response) {
                    MessageToast.show("✅ Data saved successfully!");
                    console.log("Response:", response);
                    // history.go(0);

                    oFormModel.setProperty("/purchaseorder", "");
                    oFormModel.setProperty("/creationdate", "");
                    oFormModel.setProperty("/purchaseorderdate", "");

                    // Automatically trigger the "Go" logic
                    oView.getController().onGo();  // ✅ call onGo

                },
                error: function (err) {
                    MessageToast.show("❌ Server error: Data not saved!");
                    console.error(err.responseText || err);
                }
            });

        },
        onEditRow: function (oEvent) {
            // Get the row's context from the button press
            var oContext = oEvent.getSource().getBindingContext("tableData");
            var oRowData = oContext.getObject();

            console.log("Editing row:", oRowData);

            var oFormModel = this.getView().getModel("formData");
            oFormModel.setProperty("/purchaseorder", oRowData.purchaseorder);
            oFormModel.setProperty("/creationdate", oRowData.creationdate);
            oFormModel.setProperty("/purchaseorderdate", oRowData.purchaseorderdate);

            sap.m.MessageToast.show("✏️ Row data loaded for editing. Make changes and press Update.");
        },

        onDeleteRow: function (oEvent) {
            // Get the row's context from the button press
            var oContext = oEvent.getSource().getBindingContext("tableData");
            var oData = oContext.getObject();   // Row data

            // Call backend to delete
            $.ajax({
                url: "/sap/bc/http/sap/ZHTTP_PO",
                method: "DELETE",
                contentType: "application/json",
                data: JSON.stringify([oData]),
                success: function (response) {
                    sap.m.MessageToast.show("✅ Row deleted successfully!");
                    console.log("Response:", response);

                    // 🔥 Update frontend model
                    var oModel = this.getView().getModel("tableData");
                    var aData = oModel.getProperty("/poHeaders");

                    // Filter out deleted row by unique key (purchaseorder)
                    var aUpdated = aData.filter(function (item) {
                        return item.purchaseorder !== oData.purchaseorder;
                    });

                    oModel.setProperty("/poHeaders", aUpdated);
                }.bind(this),
                error: function (err) {
                    sap.m.MessageToast.show("❌ Server error: Row not deleted!");
                    console.error(err.responseText || err);
                }
            });
        },
        onUpdate: function () {

            var oData = this.getView().getModel("formData").getData();
            console.log("Saving data:", oData);

            $.ajax({
                url: "/sap/bc/http/sap/ZHTTP_PO",
                method: "PUT",
                contentType: "application/json",
                data: JSON.stringify([oData]), // wrap in array since backend expects table
                success: function (response) {
                    MessageToast.show("✅ Data Update successfully!");
                    console.log("Response:", response);
                    // history.go(0);
                },
                error: function (err) {
                    MessageToast.show("❌ Server error: Data not saved!");
                    console.error(err.responseText || err);
                }
            });
        },
        onDelete: function () {
            var oData = this.getView().getModel("formData").getData();
            console.log("Saving data:", oData);

            $.ajax({
                url: "/sap/bc/http/sap/ZHTTP_PO",
                method: "DELETE",
                contentType: "application/json",
                data: JSON.stringify([oData]), // wrap in array since backend expects table
                success: function (response) {
                    MessageToast.show("✅ Data Delete successfully!");
                    console.log("Response:", response);
                    // history.go(0);
                },
                error: function (err) {
                    MessageToast.show("❌ Server error: Data not saved!");
                    console.error(err.responseText || err);
                }
            });
        }







    });
});

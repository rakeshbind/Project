/*global QUnit*/

sap.ui.define([
	"zpouitest/controller/PO_header.controller"
], function (Controller) {
	"use strict";

	QUnit.module("PO_header Controller");

	QUnit.test("I should test the PO_header controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});

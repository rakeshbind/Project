/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["zpouitest/test/integration/AllJourneys"
], function () {
	QUnit.start();
});

function assignInspectionDistrict(itemCap,district,addressID) {

	if (itemCap && district && addressID) {
		var districtResult = aa.address.addAddressDistrictForDaily(itemCap.ID1, itemCap.ID2, itemCap.ID3, addressID, district);

		if (districtResult.getSuccess()) {
			logDebug("Address district updated to " + district + " for record " + itemCap.getCustomID() + " and address ID " + addressID);
			return true;
		} else {
			logDebug("Address district updated failed: " + districtResult.getErrorMessage());
			return false;
		}		
	} else {
		logDebug("Address district updated failed: Required fields not provided.");
		return false;
	}


}
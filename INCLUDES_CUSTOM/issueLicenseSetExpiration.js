function issueLicenseSetExpiration(srcCapId, newLicId) { //srcCapId is the app Id and newlicId is the parent
isExpirationSet = false;
showMessage=false;
var licNum = newLicId.getCustomID();
if (appMatch("Licenses/Milk Dealer/*/Application")) {
	setExpirationDateForMlk(newLicId);
	isExpirationSet = true;
	}

if (appMatch("Licenses/Agricultural Development/Farm Products Dealer/Application")) {
	setExpirationDateForFarmOrNursery(newLicId,"Farm");
	}
	
	if (appMatch("Licenses/Plant/Agricultural Liming Material/Application")) {
		calExpireDate(newLicId);
	}

if (!isExpirationSet && appMatch("Licenses/Plant/Nursery Grower/Application")) {
	setExpirationDateForFarmOrNursery(newLicId,"Nursery");
	}

if (!isExpirationSet && appMatch("Licenses/Plant/Nursery Dealer/Application")) {
	setExpirationDateForFarmOrNursery(newLicId,"Nursery");
	//getNextLicenseNumber(srcCapId, newLicId, licNum);
	//copyContactsForNursery(srcCapId, newLicId);
	 
	}
	
}
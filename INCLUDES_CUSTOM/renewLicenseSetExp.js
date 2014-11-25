function renewLicenseSetExp(parentCapId){
isExpirationSet = false;
renewLicense=false;
logDebug("Parent License ID:" + parentCapId);
if (appMatch("Licenses/Agricultural Development/Farm Products Dealer/Renewal")) {
	renewLicense=true;
	setExpirationDateForFarmOrNursery(parentCapId,"Farm",renewLicense);
	isExpirationSet = true;
	}

if (!isExpirationSet && appMatch("Licenses/Plant/Nursery Grower/Renewal")) {
	setExpirationDateForFarmOrNursery(parentCapId,"Nursery",renewLicense);
	}

if (!isExpirationSet && appMatch("Licenses/Plant/Nursery Dealer/Renewal")) {
	renewLicense=true;
	setExpirationDateForFarmOrNursery(parentCapId,"Nursery",renewLicense);
	}

	if (appMatch("Licenses/Milk Dealer/*/Renewal")) {
		setExpirationDateForMlkRenewal(parentCapId);
	}
	
	if(appMatch("Licenses/Plant/Agricultural Liming Material/Renewal"))
	{
		calExpireDate(parentCapId,"Renew");
	}
}
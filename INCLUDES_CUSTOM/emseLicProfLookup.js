function emseLicProfLookup(){
logDebug("Using LICENSESTATE = " + LICENSESTATE + " from EMSE:GlobalFlags");
//Issue State;
LICENSETYPE = "";
//License Type to be populated;
licCapId = null;
isNewLic = false;
licIDString = null;
licObj = null;
licCap = null;
branch("EMSE:LicProfLookup:getLicenses");
//Get License CAP;
if (licCapId !=null) {
	branch("EMSE:LicProfLookup:getLicenseType");
	}

licObj = licenseProfObject(licIDString,LICENSETYPE);
//Get LicArray;
if (!licObj.valid && lookup("LICENSED PROFESSIONAL TYPE",LICENSETYPE) != null) {
	branch("EMSE:LicProfLookup:CreateLP");
	licObj = licenseProfObject(licIDString,LICENSETYPE );
	}

if (licObj.valid) {
	branch("EMSE:LicProfLookup:UpdateLP");
	} else {
	logDebug("LP Not found to update");
	}
}
var gp = AInfo['Parent Record ID'];
var gpc = null;

if (gp) {
	gpc = aa.cap.getCapID(AInfo['Parent Record ID']).getOutput();
	if (gpc) {
		if (appMatch("Licenses/Agricultural Development/Farm Products Dealer/License",gpc)) {
			addAdHocTask("WFADHOC_PROCESS","Security Release Review","",currentUserID,gpc);
			}
		}
	}

	
/*var gp = AInfo['Parent Record ID'];
var gpc = null;

if (gp) {
	gpc = aa.cap.getCapID(AInfo['Parent Record ID']).getOutput();
	if (gpc) {
		if (appMatch("Licenses/Agricultural Development/Farm Products Dealer/License",gpc)) {
			addAdHocTask("WFADHOC_PROCESS","Security Release Review","","",gpc);
			}
		}
	}
*/
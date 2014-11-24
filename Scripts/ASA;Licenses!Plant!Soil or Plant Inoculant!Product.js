var gp = AInfo['Parent Record ID'];
var gpc = null;
gpc = aa.cap.getCapID(AInfo['Parent Record ID']).getOutput();
	
if (!publicUser && !partialCap) {
	addParent(gpc.getCustomID());
	}
logDebug("Cap ID" + capId);

/*
var flagValue = contactAddressCheck();

if(flagValue)
	{
	showMessage = true;
	cancel = true;
	comment("The following contacts are listing multiple addresses of the same type, each contact may only have ONE of each address type, please remove the appropriate address(es):");
	}

*/

var flagValue = contactAddressCheck();
if(flagValue)
	{
	showMessage = true;
	cancel = true;
	comment("The entered contacts are listing multiple addresses of the same type, each contact may only have ONE of each address type, please remove the appropriate address(es):");
	}
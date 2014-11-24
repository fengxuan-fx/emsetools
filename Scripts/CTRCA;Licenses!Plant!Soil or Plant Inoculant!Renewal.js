parentLic = getParentLicenseCapID(capId);
aa.print("Parent Lic" + parentLic);
logDebug("Parent Lic" + parentLic);
pLicArray = String(parentLic).split("-");
parentLicenseCAPID = aa.cap.getCapID(pLicArray[0],pLicArray[1],pLicArray[2]).getOutput();
aa.print("Parent License CAP ID" + parentLic);
logDebug("Parent License CAP ID" + parentLic);
productArray = getChildren("Licenses/Plant/Soil or Plant Inoculant/Product", parentLicenseCAPID);
var lengthProd = 0;
for(zz in productArray){
var status = aa.cap.getCap(productArray[zz]).getOutput().getCapStatus();
aa.print("Status" + status);
if(status == "Inactive"){
lengthProd++;

}
else{
continue;
}
}
aa.print("Length" + lengthProd);



if(productArray.length > 0) 
	for (ii in productArray) {
		rowToAdd = new Array();
		rowToAdd["Record Alias"] = "Soil or Plant Inoculant Product";
		rowToAdd["Product Name"] = "FIX LATER";
		rowToAdd["RelationshipID"] = productArray[ii].getCustomID();
		addToASITable("PRODUCT",rowToAdd);
		
	}
prodnum = productArray.length - lengthProd;
if(feeExists("PLNT_SPI_R")) removeFee("PLNT_SPI_R","FINAL");
if(!feeExists("PLNT_SPI_R")) addFee("PLNT_SPI_R","PLNT_SPI-R","FINAL",prodnum,"N");
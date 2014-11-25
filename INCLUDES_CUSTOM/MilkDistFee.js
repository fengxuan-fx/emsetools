function milkDistFee() {

totalVolume();
//Add Result of ASI from TotalVolume function to ASI field Monthly Sales(Pounds) and place in total volume asi field
//Take total volume and place in "Milk Purchased Sold" asi field.
//"Milk Purchased Sold" + "Bulk Milk" + "Packaged Products Handled" - "Deduct Milk, Cream, Skim" / #Days In Month) = Average daily Quantity 
//if (AInfo['Reporting Period'] == "July 2013 - December 2013") { Total Volume Purchased
var tv = AInfo['Total Volume'];
var mps = AInfo['Milk Purchased Sold'];
var adq = AInfo['Average Daily Quantity'];



tv == (parseFloat(AInfo['Total Volume Purchased']) + parseFloat(AInfo['Monthly sale (Pounds)']));
mps == parseFloat(AInfo['Total Volume']);
adq == (parseFloat(AInfo['Milk Purchased Sold']) + parseFloat(AInfo['Bulk Milk']) + parseFloat(AInfo['Packaged Products Handled']) - parseFloat(AInfo['Deduct Milk, Cream, Skim'])/30);

editAppSpecific("Total Volume", tv.toString());
editAppSpecific("Milk Purchased Sold", mps.toString());
editAppSpecific("Average Daily Quantity", adq.toString());

/*if(feeExists("MILK_DLR_R")) removeFee("MILK_DLR_R","FINAL");
if (publicUser) {
	addFee("MILK_DLR_R","MILK_DLR_R","FINAL",calcMilkDlrLicenseFee(AInfo['Average Daily Quantity']),"Y");
	}
}*/

}
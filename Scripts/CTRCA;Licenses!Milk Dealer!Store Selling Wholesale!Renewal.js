//totalVolume();
/*var total = parseFloat(AInfo['Monthly sale (Pounds)']) + parseFloat(AInfo['Total Volume Purchased']);
editAppSpecific("Total Volume",total.toString());
if (!publicUser && !partialCap) {
	addFee("MILK_VOL","MILK_DLR","FINAL",calcMilkDlrLicenseFee(AInfo['Total Volume']),"Y");
	}
*/

var monthlySales = AInfo['Monthly sale (Pounds)']; 
logDebug("Monthly Sales" + monthlySales);//returns the number
//totalVolume(); //function call from INCLUDES_CUSTOM
var tvp = AInfo['Total Volume Purchased'];

//var sumTest = parseFloat(monthlySales) + parseFloat(tvp);

//AInfo['Total Volume'] = sumTest + ' ';
//var tv = sumTest + ' ';
//editAppSpecific("Total Volume",tv);



//editAppSpecific("Milk Purchased Sold", tv);


var mps = AInfo['Milk Purchased Sold'];
logDebug("MPS" + mps);
var bm = AInfo['Bulk Milk'];
logDebug("BM" + bm);
var pph = AInfo['Packaged Products Handled'];
logDebug("PPH" + pph);
var dmcs = AInfo['Deduct Milk, Cream , Skim'];
logDebug("DMCS" + dmcs);

var add = parseFloat(mps) + parseFloat(bm) + parseFloat(pph);
var addTest = add + ' ';
editAppSpecific("Total", addTest);
var tth = AInfo['Total'];

var sub = parseFloat(mps) + parseFloat(bm) + parseFloat(pph) - parseFloat(dmcs);
var subTest = sub + ' ';
editAppSpecific("Total Less Product Utilized at Own Plant", subTest);
var tlp = AInfo['Total Less Product Utilized at Own Plant'];

//var adq = (parseFloat(AInfo['Milk Purchased Sold']) + parseFloat(AInfo['Bulk Milk']) + parseFloat(AInfo['Packaged Products Handled']) - parseFloat(AInfo['Deduct Milk, Cream, Skim'])/30);
var adq = parseFloat(tv) + parseFloat(bm) + parseFloat(pph) - parseFloat(dmcs);
logDebug("Average Daily Quantity" + adq);
var adqDiv = adq/30;
logDebug("Dividend" + adqDiv);

var dailyQuantity = adqDiv + ' ';

editAppSpecific("Average Daily Quantity", dailyQuantity);
//logDebug("Average Daily Quantity" + adq); // returns null

//milkDistFee();

if (!publicUser) {
	addFee("MILK_WS_RNW","MILK_WS_DIS_R","FINAL",calcMilkDlrLicenseFee(AInfo['Average Daily Quantity']),"Y");
	}

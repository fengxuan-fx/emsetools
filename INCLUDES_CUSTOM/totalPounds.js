function totalPounds(){
var totalAmt = 0;
if (typeof(MILKDEALERSLISTFORSTORES) == "object") {
	for(x in MILKDEALERSLISTFORSTORES) totalAmt+=parseFloat(MILKDEALERSLISTFORSTORES[x]["Pounds of Milk"]);
	editAppSpecific("Total Pounds Purchased Weekly",totalAmt.toString());
	}
	}
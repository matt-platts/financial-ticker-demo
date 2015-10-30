/*
* A couple of notes:
* 1. I am aware css transition won't work in IE 8. I did think about fading opacity using javascript and rgba background but IE8 doesn't support that either. Using the small delay between the fade in and out transitions ensures that IE8 does something at least.
* 2. One change I would make, I would flash up the whole row rather than each cell when it changes, this would probably be less work for the browser, as per discussion last night on keeping things minimal
*/ 


/* 
*  CLASS: dataGrid
*  class for the datagrid - referenced internally as __dg) 
*/
var dataGrid = function(){
	var __dg = this;

	var initDataArray;
	var updateDataArray;

	/* 
	*  Function: getUpdateData
	*  Get update data from the server, pass to function updateGrid to start parsing 
	*/
	dataGrid.prototype.getUpdateData = function() {
		var xmlhttp = new XMLHttpRequest();
		url="deltas.csv";
		xmlhttp.onreadystatechange = function() {
		    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			__dg.updateDataArray = xmlhttp.responseText.split("\n");
			__dg.updateGrid(__dg.updateDataArray);
		    }
		}
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	}

	/* 
	*  Function: loadInitialData
	*  Load the initial Data 
	*/
	dataGrid.prototype.loadInitialData = function (arr){
		for (i=1;i<arr.length;i++){ // start at 1, discard header line. In a live environment would do checking to ensure we're not throwing vital info away
			var newTr = document.createElement("tr");
			var data=arr[i].split(",");
			var idAttr = document.createAttribute("id");
			idAttr.value = data[0];
			newTr.setAttributeNode(idAttr);
			for (j=0;j<data.length;j++){
				var newTd = document.createElement("td");
				var cellText = document.createTextNode(data[j]);
				newTd.appendChild(cellText);
				newTr.appendChild(newTd);
			}
			if (data[0]){
				document.getElementById("display_table_body").appendChild(newTr); // add the tr to the table body  
			} else {
				//alert("No data on this line");
			}
		}
	}

	/* 
	*  Function: updateGrid
	*  This function is called on a loop with the array of update data
	*/
	dataGrid.prototype.updateGrid = function (arr) {
		var tbody = document.getElementById("display_table_body");
		var r=0;
		while (row = tbody.rows[r++]){
			dataCells = arr[0].split(",");
			var c=0;
			while (cell = row.cells[c++]){

				if (c>2 && c < 6){

					if (dataCells[c-1] != "" && cell.innerHTML != dataCells[c-1]){
						cell.innerHTML = dataCells[c-1];
						
						// update the class so that there is a flash in the ui
						__dg.uiFlash(cell);
					}
				}
			}
			arr.shift();
		}

		var fadeTimer = setTimeout(function(){
					var changedCells=document.getElementsByTagName("td");
					var i;
					for (i = 0; i < changedCells.length; i++) {
					    changedCells[i].className = "reset"; 
					}
		},200); // This timer gives IE8 a chance to display the background even though it doesn't fade on transition.

		var delayBeforeUpdate = arr.shift();

		if (arr[0]){
			timer = setTimeout(function(){
				__dg.updateGrid(arr);},
			delayBeforeUpdate);
		} else {
			__dg.getUpdateData(); // This repeats the server call to get the update data. This is assuming (somewhat outside the purposes of this demo) that it is likely to have changed - if it was just straight looping I could have saved accessed the stored data locally 
		}
	}

	dataGrid.prototype.uiFlash = function (cell) {
		cellClass = document.createAttribute("class");
		cellClass.value="changed";
		cell.setAttributeNode(cellClass);
	}
}

/*
*  START 
*  Xhr to load initial data file - fires on the window.onload event
*/
window.onload=function(){
	var xmlhttp = new XMLHttpRequest();
	url="snapshot.csv";
	xmlhttp.onreadystatechange = function() {
	    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		var initDataArray = xmlhttp.responseText.split("\n");
		var myGrid = new dataGrid();
		myGrid.initDataArray=initDataArray;
		myGrid.loadInitialData(myGrid.initDataArray);
		var t = setTimeout(myGrid.getUpdateData, 2000); // start updating - deliberately left a 2 second wait for demo purposes only
	    }
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

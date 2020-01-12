"use strict";

/*A : max delay with official blockchain
  q : taux de hashage relatif
  z : nb de confirmations demandées par le vendeur
  v : amount of double spend*/

  function updateChart(n, A, z, v) {
  	
  	var X = Array(51).fill().map((v,i) => i);
  	var X2 = Array(51).fill().map((v,i) => i / 100);
  	var res = new Array();

  	for(var x in X2) {
  		res.push(attack(n, A, X2[x], z, v));
  	}

  	var ctxL = document.getElementById("lineChart").getContext('2d');
  	ctxL.canvas.width = 700;
  	ctxL.canvas.height = 300;

  	var myLineChart = new Chart(ctxL, {
  		type: 'line',
  		data: {
  			labels : X,
  			datasets: [{
  				label: "Attacker",
  				data: res,
  				backgroundColor: 'rgba(105, 0, 132, .2)',
  				borderColor:'rgba(200, 99, 132, .7)',
  				borderWidth: 2
  			},

  			{
  				label: "Honest",
  				data: X2,
  				backgroundColor: 'rgba(0, 137, 132, .2)',
  				borderColor: 'rgba(0, 10, 130, .7)',
  				borderWidth: 2
  			}
  			]
  		},
  		options: {
  			responsive: false,
  			scales : {
  				yAxes : [{
  					scaleLabel: {
  						display : true,
  						labelString : 'Revenue/Time ratio'
  					}
  				}],
  				xAxes : [{
  					scaleLabel: {
  						display : true,
  						labelString : 'Relative hashrate %'
  					}
  				}]
  			}
  		}
  	});

  }

  function attack(n, A, q, z, v) {
  	var time = 0;
  	var revenue = 0;

  	for(var i = 0; i < n ; i++) {
  		var res = cycle(A, q, z, v);
  		revenue += parseInt(res[0]);
  		time += parseInt(res[1]);
  	}

  	return revenue / time;
  }

  function cycle(A, q, z, v) {
  	var time = 1 / q;

  	if(q == 0) {
  		q = 0.00001;
  	}

  	/*Phase 0, préminage d'un block de l'attaquant*/
  	var honestBlocks = 0;
  	var attackBlocks = 1;

  	/*Phase 1, début du cycle*/
  	var retard = honestBlocks - attackBlocks;

  	while ( (A > retard) && (honestBlocks < z) ) {
  		if(Math.random() <=  q) {
  			attackBlocks++;
  		}
  		else{
  			honestBlocks++;
  			time += 1 / (1 - q);
  		}
  		retard = honestBlocks - attackBlocks;
  		time++;
  	}
  	var revenue = 0;
  	/*Phase 2, on check si l'attaquant a pris de l'avance sur les honnêtes mineurs*/
  	if(honestBlocks < attackBlocks) {
  		revenue = parseInt(attackBlocks) + parseInt(v);
  	}
  	return [revenue, time];
  }
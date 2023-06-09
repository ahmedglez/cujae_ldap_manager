const jerzy = require('jerzy')
var v = new jerzy.Vector([1, 2, 3, 4, 20])
console.log(JSON.stringify(jerzy.Normality.shapiroWilk(v), null, 4))

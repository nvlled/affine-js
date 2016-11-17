var affine = require("./affine");

var v = affine.vector(0, 0);
var w = affine.vector(300, 300);

var m = affine.matrix(
    [1.11],
    [4.44444],
    [6]
);
var m2= affine.matrix(
    [5,6,7],
    [7,8,9]
);



console.log(v.sub(w).length(), w.sub(v).length());
affine.print(v.sub(w).normalize().scale(10), w.sub(v).normalize().scale(10));
//affine.print(m.normalize().length());


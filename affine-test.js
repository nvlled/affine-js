var A = Matrix.newCol('a', 'b', 'c');
var A_ = Matrix.newRow(1,2,3);
document.write(A.toHTML());

//document.write(new Matrix(3,4)
//    .init([
//        1,2,3,4,
//        2,9,8,1,
//        3,7,3,2,
//    ]).toHTML()
//);

var B =
    Matrix.new(
        [1,2,3,4],
        [5,6,7,8],
        [9,10,11,12]
    );
var C =
    Matrix.new(
        [1,0,0,0],
        [1,0,0,0],
        [1,1,1,1]
    );

document.write(B.toHTML());
B.add(C);
document.write(B.toHTML());
var M = Matrix.newCol(3, 4).mul(Matrix.newRow(1, 2));
document.write(M.toHTML());
document.write(Matrix.newRow(1,2,3,4).transpose().toHTML());
document.write(Matrix.newCol(1,2,3,4).transpose().toHTML());
document.write(C.transpose().toHTML());
document.write("<hr>");

